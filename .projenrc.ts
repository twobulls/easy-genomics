import { awscdk, javascript, typescript } from 'projen';
import { JestOptions, PrettierOptions, TrailingComma, TypescriptConfigOptions } from 'projen/lib/javascript';
import { pathsToModuleNameMapper } from 'ts-jest';
import { setupProjectFolders } from './projenrc/easy-genomics-project-setup';
import { Husky } from './projenrc/husky';
import { Nx } from './projenrc/nx';
import { PnpmWorkspace } from './projenrc/pnpm';
import { VscodeSettings } from './projenrc/vscode';

const defaultReleaseBranch = 'main';
const cdkVersion = '2.124.0';
const nodeVersion = '18.16.0';
const pnpmVersion = '8.6.0';
const authorName = 'DEPT Agency';
const copyrightOwner = authorName;
const copyrightPeriod = `${new Date().getFullYear()}`;

const prettierOptions: PrettierOptions = {
  settings: {
    printWidth: 120,
    tabWidth: 2,
    singleQuote: true,
    semi: true,
    trailingComma: TrailingComma.ES5,
  },
};

// Changing compiler options will require that you re-run projen twice.
// As the jestConfig is reliant on the current (pre-projen run) version of ./tsconfig.json
const tsConfigOptions: TypescriptConfigOptions = {
  compilerOptions: {
    baseUrl: '.',
    rootDir: '.',
    // Add '@App/' as a path import alias for '<rootDir>/src/app/'
    paths: {
      '@BE/*': ['packages/back-end/src/*'],
      '@FE/*': ['packages/front-end/src/*'],
      '@SharedLib/*': ['packages/shared-lib/src/*'],
    },
  },
  include: ['packages/back-end/src/**/*.ts', 'packages/front-end/src/**/*.ts', 'packages/shared-lib/src/**/*.ts'],
  exclude: [],
};

const jestOptions: JestOptions = {
  jestConfig: {
    // Add all the special paths to let Jest resolve them properly
    moduleNameMapper: {
      ...pathsToModuleNameMapper(tsConfigOptions.compilerOptions.paths!, { prefix: '<rootDir>/' }),
    },
    coveragePathIgnorePatterns: ['/node_modules/'],
  },
  junitReporting: false,
  extraCliOptions: ['--detectOpenHandles'],
};

const root = new typescript.TypeScriptProject({
  authorName: authorName,
  authorOrganization: true,
  copyrightOwner: copyrightOwner,
  copyrightPeriod: copyrightPeriod,
  defaultReleaseBranch: defaultReleaseBranch,
  description:
    'Easy Genomics web application to help simplify genomic analysis of sequenced genetic data for bioinformaticians utilizing AWS HealthOmics & NextFlow Tower',
  eslint: true,
  jest: true,
  jestOptions: jestOptions,
  homepage: 'https://github.com/twobulls/easy-genomics',
  license: 'Apache-2.0',
  licensed: true,
  minNodeVersion: nodeVersion,
  name: '@easy-genomics',
  packageManager: javascript.NodePackageManager.PNPM,
  prettier: true,
  prettierOptions,
  projenCommand: 'pnpm dlx projen',
  projenrcTs: true,
  sampleCode: false,
  tsconfig: tsConfigOptions,
  // Disable default github actions workflows generated
  // by projen as we will generate our own later (that uses nx)
  depsUpgradeOptions: { workflow: false },
  buildWorkflow: false,
  release: false,
  devDeps: [
    '@aws-sdk/types',
    '@commitlint/cli',
    '@commitlint/config-conventional',
    '@commitlint/cz-commitlint',
    '@types/aws-lambda',
    '@types/uuid',
    '@typescript-eslint/eslint-plugin',
    '@typescript-eslint/parser',
    'aws-cdk-lib',
    'aws-sdk-client-mock',
    'aws-sdk-client-mock-jest',
    'cz-conventional-changelog',
    'eslint',
    'husky',
    'lint-staged',
    'validate-branch-name',
  ],
});
root.removeScript('build');
root.removeScript('deploy');
root.addScripts({
  ['build-all']: 'pnpm nx run-many --targets=eslint,test,build,nuxt-generate --all',
  ['test-all']: 'pnpm nx run-many --targets=eslint,compile,test --all',
  ['deploy-all']: 'pnpm nx run-many --targets=test,build,nuxt-generate,deploy --all',
  ['build-back-end']: 'pnpm nx run-many --targets=eslint,test,build --projects=@easy-genomics/back-end',
  ['build-front-end']: 'pnpm nx run-many --targets=eslint,test,build,nuxt-generate --projects=@easy-genomics/front-end',
  ['build-shared-lib']: 'pnpm nx run-many --targets=eslint,test,build --projects=@easy-genomics/shared-lib',
  ['deploy-back-end']:
    'pnpm nx run-many --targets=test,build,deploy --projects=@easy-genomics/back-end,@easy-genomics/shared-lib',
  ['deploy-front-end']:
    'pnpm nx run-many --targets=test,build,nuxt-generate,deploy --projects=@easy-genomics/front-end,@easy-genomics/shared-lib',
  ['prepare']: 'husky || true', // Enable Husky each time projen is synthesized
});

// Defines the Easy Genomics 'shared-lib' subproject
new typescript.TypeScriptProject({
  parent: root,
  name: '@easy-genomics/shared-lib',
  outdir: './packages/shared-lib',
  defaultReleaseBranch: defaultReleaseBranch,
  docgen: false,
  sampleCode: false,
  authorName: authorName,
  authorOrganization: true,
  // Copyright & Licensing
  copyrightOwner: copyrightOwner,
  copyrightPeriod: copyrightPeriod,
  license: 'Apache-2.0',
  licensed: true,
  // Use same settings from root project
  packageManager: root.package.packageManager,
  projenCommand: root.projenCommand,
  minNodeVersion: root.minNodeVersion,
  deps: ['aws-cdk', 'aws-cdk-lib', 'aws-lambda', 'uuid'],
  devDeps: ['@types/aws-lambda', '@types/uuid', 'aws-cdk-lib'],
});

// Defines the Easy Genomics 'back-end' subproject
new awscdk.AwsCdkTypeScriptApp({
  parent: root,
  name: '@easy-genomics/back-end',
  outdir: './packages/back-end',
  cdkVersion: cdkVersion,
  defaultReleaseBranch: defaultReleaseBranch,
  docgen: false,
  lambdaAutoDiscover: false,
  requireApproval: awscdk.ApprovalLevel.NEVER,
  sampleCode: false,
  // Copyright & Licensing
  authorName: authorName,
  authorOrganization: true,
  copyrightOwner: copyrightOwner,
  copyrightPeriod: copyrightPeriod,
  license: 'Apache-2.0',
  licensed: true,
  // Use same settings from root project
  packageManager: root.package.packageManager,
  projenCommand: root.projenCommand,
  minNodeVersion: root.minNodeVersion,
  deps: [
    '@aws-sdk/client-dynamodb',
    '@aws-sdk/lib-dynamodb',
    '@aws-sdk/types',
    '@aws-sdk/util-dynamodb',
    '@easy-genomics/shared-lib@workspace:*',
    'aws-lambda',
    'aws-sdk',
    'dotenv',
    'uuid',
  ],
  devDeps: ['@aws-sdk/util-dynamodb', '@aws-sdk/types', '@types/aws-lambda', '@types/uuid', 'aws-sdk-client-mock'],
});

// Defines the Easy Genomics 'front-end' subproject
const frontEndApp = new awscdk.AwsCdkTypeScriptApp({
  parent: root,
  name: '@easy-genomics/front-end',
  outdir: './packages/front-end',
  cdkVersion: cdkVersion,
  defaultReleaseBranch: defaultReleaseBranch,
  docgen: false,
  lambdaAutoDiscover: false,
  requireApproval: awscdk.ApprovalLevel.NEVER,
  sampleCode: false,
  // Copyright & Licensing
  authorName: authorName,
  authorOrganization: true,
  copyrightOwner: copyrightOwner,
  copyrightPeriod: copyrightPeriod,
  license: 'Apache-2.0',
  licensed: true,
  // Use same settings from root project
  packageManager: root.package.packageManager,
  projenCommand: root.projenCommand,
  minNodeVersion: root.minNodeVersion,
  deps: ['@easy-genomics/shared-lib@workspace:*', 'aws-sdk', 'dotenv', 'nuxt', 'uuid', 'vue', 'vue-router'],
  devDeps: ['@aws-sdk/types', '@types/uuid'],
});

// Add additional Nuxt Scripts to front-end/package.json
frontEndApp.addScripts({
  ['nuxt-build']: 'nuxt build',
  ['nuxt-dev']: 'nuxt dev',
  ['nuxt-generate']: 'nuxt generate',
  ['nuxt-preview']: 'nuxt preview',
  ['nuxt-postinstall']: 'nuxt prepare',
});

new PnpmWorkspace(root);
new VscodeSettings(root);
new Nx(root);
new Husky(root);

// Provision templated project folders structure with README.md descriptions.
setupProjectFolders(root);

root.package.addField('packageManager', `pnpm@${pnpmVersion}`);
root.gitignore.addPatterns(
  '*.bkp',
  '*.dtmp',
  '.env',
  '.env.*',
  '!.env.local',
  '.idea',
  '.DS_Store',
  'test-reports/*',
  '.nuxt',
  '.output',
  'dist'
);
root.synth();
