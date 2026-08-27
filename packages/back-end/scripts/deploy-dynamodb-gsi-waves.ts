/**
 * Pre-deploy helper that splits DynamoDB GSI creates/deletes across multiple
 * CloudFormation updates.
 *
 * Why
 * ---
 * DynamoDB (and therefore `AWS::DynamoDB::Table`) rejects an UpdateTable that
 * creates or deletes more than one Global Secondary Index. Staging can land
 * two new indexes on `laboratory-run-table` in a single merge (PollStatus +
 * WorkflowExternalId), which is exactly the UAT failure:
 *
 *   Cannot perform more than one GSI creation or deletion in a single update
 *
 * Environments that already have the desired indexes (or that only need one
 * more) are a no-op and fall through to the normal `cdk deploy`.
 *
 * How
 * ---
 *  1. Read the pre-synthesized `cdk.out` assembly (desired end state).
 *  2. Read the currently deployed stack templates (CloudFormation's view,
 *     not live DescribeTable — CFN diffs templates, not physical state).
 *  3. While any existing table would mutate more than one GSI, patch a copy
 *     of `cdk.out` so each of those tables takes exactly one step, deploy,
 *     restore the original assembly, and repeat.
 *  4. Exit 0. The caller then runs the unpatched `cdk deploy` which applies
 *     the last remaining GSI (if any) plus every other stack change.
 *
 * Brand-new tables are never patched: CreateTable may define many GSIs.
 *
 * Usage (from packages/back-end, already wired into `pnpm run deploy`):
 *   pnpm run deploy-dynamodb-gsi-waves
 *   pnpm run deploy-dynamodb-gsi-waves -- --dry-run
 */

import { spawnSync } from 'child_process';
import { copyFileSync, existsSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import {
  CloudFormationClient,
  GetTemplateCommand,
  ListStackResourcesCommand,
  StackResourceSummary,
} from '@aws-sdk/client-cloudformation';
import { ConfigurationSettings } from '@easy-genomics/shared-lib/src/app/types/configuration';
import {
  getStackEnvName,
  loadConfigurations,
  resolveConfiguration,
} from '@easy-genomics/shared-lib/src/app/utils/configuration';
import {
  advanceCurrentNames,
  applyWaveToTemplates,
  backupSuffix,
  CfnGlobalSecondaryIndex,
  CfnTemplate,
  formatWaveChange,
  gsiIndexNames,
  listTableSnapshots,
  maxRemainingMutations,
  syncCurrentGsisFromTemplates,
} from './lib/dynamodb-gsi-waves';

type DeployEnv = {
  envName: string;
  envType: string;
  awsRegion: string;
  namePrefix: string;
};

type CdkStackArtifact = {
  type?: string;
  properties?: {
    templateFile?: string;
    stackName?: string;
  };
};

type CdkManifest = {
  artifacts?: Record<string, CdkStackArtifact>;
};

const CDK_OUT_DIR = resolve(join(__dirname, '..', 'cdk.out'));
const BACKEND_DIR = resolve(join(__dirname, '..'));
const MAX_WAVES = 20;

function parseArgs(argv: string[]): { dryRun: boolean } {
  return { dryRun: argv.includes('--dry-run') };
}

function resolveDeployEnv(): DeployEnv {
  if (process.env.CI_CD === 'true') {
    const envName = process.env.ENV_NAME;
    const envType = process.env.ENV_TYPE;
    const awsRegion = process.env.AWS_REGION;
    if (!envName || !envType || !awsRegion) {
      throw new Error(
        'GSI waves: CI_CD=true but ENV_NAME / ENV_TYPE / AWS_REGION are not all set. ' +
          'Fix the CI environment or run locally without CI_CD=true to fall back to easy-genomics.yaml.',
      );
    }
    return { envName, envType, awsRegion, namePrefix: `${envType}-${envName}` };
  }

  const configPath = join(__dirname, '../../../config/easy-genomics.yaml');
  const configurations: { [p: string]: ConfigurationSettings }[] = loadConfigurations(configPath);
  const configuration = resolveConfiguration(configurations, getStackEnvName() ?? process.env.ENV_NAME);
  const envName = Object.keys(configuration)[0];
  const settings = Object.values(configuration)[0];
  const envType = settings['env-type'];
  const awsRegion = settings['aws-region'];
  if (!envName || !envType || !awsRegion) {
    throw new Error('GSI waves: env-name / env-type / aws-region missing from easy-genomics.yaml.');
  }
  return { envName, envType, awsRegion, namePrefix: `${envType}-${envName}` };
}

function readJsonFile<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf-8')) as T;
}

function listAssemblyTemplates(cdkOut: string): Array<{ stackName: string; templatePath: string }> {
  const manifestPath = join(cdkOut, 'manifest.json');
  if (!existsSync(manifestPath)) {
    throw new Error(
      `GSI waves: cloud assembly manifest not found at "${manifestPath}". ` +
        'Run the back-end build/synth before deploy.',
    );
  }
  const manifest = readJsonFile<CdkManifest>(manifestPath);
  const templates: Array<{ stackName: string; templatePath: string }> = [];
  for (const [id, artifact] of Object.entries(manifest.artifacts ?? {})) {
    if (artifact.type !== 'aws:cloudformation:stack') {
      continue;
    }
    const templateFile = artifact.properties?.templateFile;
    if (!templateFile) {
      continue;
    }
    templates.push({
      stackName: artifact.properties?.stackName ?? id,
      templatePath: join(cdkOut, templateFile),
    });
  }
  return templates;
}

function loadDesiredTables(cdkOut: string): {
  templatesByPath: Map<string, CfnTemplate>;
  desiredNamesByTable: Map<string, string[]>;
} {
  const templatesByPath = new Map<string, CfnTemplate>();
  const desiredNamesByTable = new Map<string, string[]>();

  for (const { templatePath } of listAssemblyTemplates(cdkOut)) {
    if (!existsSync(templatePath)) {
      continue;
    }
    const template = readJsonFile<CfnTemplate>(templatePath);
    templatesByPath.set(templatePath, template);
    for (const snapshot of listTableSnapshots(template)) {
      desiredNamesByTable.set(snapshot.tableName, gsiIndexNames(snapshot.gsis));
    }
  }

  return { templatesByPath, desiredNamesByTable };
}

function isStackMissingError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return /does not exist/i.test(message);
}

async function getTemplateJson(client: CloudFormationClient, stackName: string): Promise<CfnTemplate | undefined> {
  try {
    const response = await client.send(new GetTemplateCommand({ StackName: stackName }));
    if (!response.TemplateBody) {
      return undefined;
    }
    try {
      return JSON.parse(response.TemplateBody) as CfnTemplate;
    } catch {
      throw new Error(
        `GSI waves: CloudFormation template for stack "${stackName}" is not JSON. ` +
          'This script cannot plan GSI waves from a YAML template body.',
      );
    }
  } catch (err) {
    if (isStackMissingError(err)) {
      return undefined;
    }
    throw err;
  }
}

async function listNestedStackPhysicalIds(client: CloudFormationClient, stackName: string): Promise<string[]> {
  const collected: StackResourceSummary[] = [];
  let nextToken: string | undefined;
  try {
    do {
      const resp = await client.send(new ListStackResourcesCommand({ StackName: stackName, NextToken: nextToken }));
      if (resp.StackResourceSummaries) {
        collected.push(...resp.StackResourceSummaries);
      }
      nextToken = resp.NextToken;
    } while (nextToken);
  } catch (err) {
    if (isStackMissingError(err)) {
      return [];
    }
    throw err;
  }
  return collected
    .filter((r) => r.ResourceType === 'AWS::CloudFormation::Stack' && r.PhysicalResourceId)
    .map((r) => r.PhysicalResourceId as string);
}

function mergeTableGsis(into: Map<string, CfnGlobalSecondaryIndex[]>, template: CfnTemplate | undefined): void {
  if (!template) {
    return;
  }
  for (const snapshot of listTableSnapshots(template)) {
    into.set(snapshot.tableName, snapshot.gsis);
  }
}

async function loadCurrentGsis(
  client: CloudFormationClient,
  topLevelStackNames: string[],
): Promise<Map<string, CfnGlobalSecondaryIndex[]>> {
  const current = new Map<string, CfnGlobalSecondaryIndex[]>();
  const visited = new Set<string>();

  const visit = async (stackName: string): Promise<void> => {
    if (visited.has(stackName)) {
      return;
    }
    visited.add(stackName);
    const template = await getTemplateJson(client, stackName);
    mergeTableGsis(current, template);
    const nested = await listNestedStackPhysicalIds(client, stackName);
    for (const nestedId of nested) {
      await visit(nestedId);
    }
  };

  for (const stackName of topLevelStackNames) {
    await visit(stackName);
  }
  return current;
}

function namesFromGsiMap(gsisByTable: Map<string, CfnGlobalSecondaryIndex[]>): Map<string, string[]> {
  const names = new Map<string, string[]>();
  for (const [tableName, gsis] of gsisByTable) {
    names.set(tableName, gsiIndexNames(gsis));
  }
  return names;
}

function writeTemplates(templatesByPath: Map<string, CfnTemplate>): void {
  for (const [path, template] of templatesByPath) {
    writeFileSync(path, `${JSON.stringify(template, null, 2)}\n`);
  }
}

function backupTemplates(paths: string[]): string[] {
  const backups: string[] = [];
  for (const path of paths) {
    const backupPath = `${path}${backupSuffix()}`;
    copyFileSync(path, backupPath);
    backups.push(backupPath);
  }
  return backups;
}

function restoreTemplates(originalPaths: string[]): void {
  for (const path of originalPaths) {
    const backupPath = `${path}${backupSuffix()}`;
    if (!existsSync(backupPath)) {
      continue;
    }
    renameSync(backupPath, path);
  }
}

function cleanupBackups(originalPaths: string[]): void {
  for (const path of originalPaths) {
    const backupPath = `${path}${backupSuffix()}`;
    if (existsSync(backupPath)) {
      unlinkSync(backupPath);
    }
  }
}

function runCdkDeploy(): void {
  const result = spawnSync(
    'pnpm',
    ['exec', 'projen', 'deploy', '--app', 'cdk.out', '--all', '--progress', 'bar', '--no-color', '--no-notices'],
    {
      cwd: BACKEND_DIR,
      stdio: 'inherit',
      env: process.env,
    },
  );
  if (result.status !== 0) {
    throw new Error(`GSI waves: intermediate cdk deploy exited with status ${result.status ?? 'null'}`);
  }
}

function cloneTemplates(templatesByPath: Map<string, CfnTemplate>): Map<string, CfnTemplate> {
  const clone = new Map<string, CfnTemplate>();
  for (const [path, template] of templatesByPath) {
    clone.set(path, JSON.parse(JSON.stringify(template)) as CfnTemplate);
  }
  return clone;
}

export async function main(argv: string[] = process.argv): Promise<void> {
  const { dryRun } = parseArgs(argv);
  const env = resolveDeployEnv();
  const cdkOut = process.env.CDK_OUT ? resolve(process.env.CDK_OUT) : CDK_OUT_DIR;

  console.log(`GSI waves: env=${env.envType}-${env.envName} region=${env.awsRegion} cdkOut=${cdkOut}`);

  const { templatesByPath, desiredNamesByTable } = loadDesiredTables(cdkOut);
  if (desiredNamesByTable.size === 0) {
    console.log('GSI waves: no DynamoDB tables in cdk.out; nothing to do.');
    return;
  }

  const cfn = new CloudFormationClient({ region: env.awsRegion });
  const topLevelStacks = [`${env.namePrefix}-easy-genomics-api-stack`, `${env.namePrefix}-main-back-end-stack`];

  const currentGsis = await loadCurrentGsis(cfn, topLevelStacks);
  let currentNames = namesFromGsiMap(currentGsis);

  if (currentGsis.size === 0) {
    console.log('GSI waves: no deployed DynamoDB tables found (fresh environment); skipping intermediate waves.');
    return;
  }

  let remaining = maxRemainingMutations(desiredNamesByTable, currentNames);
  if (remaining <= 1) {
    console.log(
      remaining === 0
        ? 'GSI waves: deployed index sets already match cdk.out; skipping intermediate waves.'
        : 'GSI waves: at most one GSI mutation per table remains; the final cdk deploy can apply it.',
    );
    return;
  }

  console.log(
    `GSI waves: ${remaining} GSI mutation(s) needed on at least one existing table. ` +
      'CloudFormation can only apply one per table update, so intermediate deploys will be used.',
  );

  const templatePaths = [...templatesByPath.keys()];
  const totalIntermediate = remaining - 1;
  let wave = 0;

  while (remaining > 1) {
    wave += 1;
    if (wave > MAX_WAVES) {
      throw new Error(`GSI waves: exceeded ${MAX_WAVES} intermediate deploys; aborting to avoid a loop.`);
    }

    const patched = cloneTemplates(templatesByPath);
    const changes = applyWaveToTemplates(patched, currentGsis);
    if (changes.length === 0) {
      console.log('GSI waves: planner produced no patches; stopping.');
      break;
    }

    console.log(`GSI waves: intermediate deploy ${wave}/${totalIntermediate}`);
    for (const change of changes) {
      console.log(`  - ${formatWaveChange(change)}`);
    }

    if (!dryRun) {
      backupTemplates(templatePaths);
      try {
        writeTemplates(patched);
        runCdkDeploy();
      } finally {
        restoreTemplates(templatePaths);
        cleanupBackups(templatePaths);
      }
    }

    syncCurrentGsisFromTemplates(currentGsis, patched, changes);
    currentNames = advanceCurrentNames(currentNames, changes);
    remaining = maxRemainingMutations(desiredNamesByTable, currentNames);
  }

  if (dryRun) {
    console.log(
      remaining <= 1
        ? 'GSI waves: dry-run complete. The final unpatched cdk deploy would finish the remaining index(es).'
        : `GSI waves: dry-run stopped with ${remaining} mutation(s) still pending.`,
    );
  } else {
    console.log(
      'GSI waves: intermediate updates complete. The final cdk deploy will apply the remaining index (if any).',
    );
  }
}

if (!process.env.JEST_WORKER_ID) {
  main().catch((err: unknown) => {
    console.error('');
    console.error('GSI waves failed:');
    console.error(err instanceof Error ? (err.stack ?? err.message) : err);
    console.error('');
    console.error('DynamoDB refuses to create or delete more than one GSI per table update. This script splits those');
    console.error('changes across sequential CloudFormation deploys. Fix the error above and rerun `pnpm run deploy`.');
    process.exit(1);
  });
}
