import { IConstruct } from 'constructs';
import { Component, github, typescript } from 'projen';

// Custom projen component that configures a Github Actions Workflow.
export class GithubActionsCICDRelease extends Component {
  private readonly environment: string;
  private readonly pnpmVersion: string;
  private readonly e2e: boolean;
  private readonly onPushBranch?: string;

  constructor(
    rootProject: typescript.TypeScriptProject,
    options: {
      environment: string;
      pnpmVersion: string;
      onPushBranch?: string;
      e2e: boolean;
    },
  ) {
    super(<IConstruct>rootProject);
    this.environment = options.environment;
    this.pnpmVersion = options.pnpmVersion;
    this.onPushBranch = options.onPushBranch;
    this.e2e = options.e2e;

    const wf = new github.GithubWorkflow(rootProject.github!, `cicd-release-${this.environment}`);
    const runsOn = ['ubuntu-latest'];
    if (this.onPushBranch) {
      wf.on({ push: { branches: [this.onPushBranch] } });
    } else {
      wf.on({ push: { branches: ['main'] } });
    }

    const jobs: Record<string, github.workflows.Job> = {
      ['build-deploy-back-end']: {
        name: 'Build & Deploy Back-End',
        runsOn,
        environment: this.environment,
        env: this.loadEnv(),
        permissions: {
          idToken: github.workflows.JobPermission.WRITE,
          contents: github.workflows.JobPermission.WRITE,
          actions: github.workflows.JobPermission.READ,
        },
        steps: [
          ...this.bootstrapSteps(),
          ...this.configureAwsCredentials(),
          {
            name: 'Run CI/CD Build & Deploy Back-End',
            run: 'pnpm run cicd-build-deploy-back-end',
          },
        ],
      },
      ['build-deploy-front-end']: {
        name: 'Build & Deploy Front-End',
        needs: ['build-deploy-back-end'],
        runsOn,
        environment: this.environment,
        env: this.loadEnv(),
        permissions: {
          idToken: github.workflows.JobPermission.WRITE,
          contents: github.workflows.JobPermission.WRITE,
          actions: github.workflows.JobPermission.READ,
        },
        steps: [
          ...this.bootstrapSteps(),
          ...this.configureAwsCredentials(),
          {
            name: 'Run CI/CD Build & Deploy Front-End',
            run: 'pnpm cicd-build-deploy-front-end',
          },
        ],
      },
    };

    if (this.e2e) {
      jobs['run-e2e-tests'] = {
        name: 'Run E2E Tests',
        needs: ['build-deploy-front-end'],
        runsOn,
        environment: this.environment,
        env: this.loadEnv(),
        permissions: {
          idToken: github.workflows.JobPermission.WRITE,
          contents: github.workflows.JobPermission.WRITE,
          actions: github.workflows.JobPermission.READ,
        },
        steps: [
          ...this.bootstrapSteps(),
          {
            name: 'Clear Playwright Cache',
            run: 'rm -rf /home/runner/.cache/ms-playwright',
          },
          {
            name: 'Install Playwright + Chromium Only and Slack Reporter',
            run: 'pnpm add -Dw @playwright/test && pnpm add -Dw playwright-slack-report && npx playwright install chromium',
          },
          {
            name: 'Run E2E Tests',
            workingDirectory: 'packages/front-end',
            run: 'pnpm run test-e2e',
            continueOnError: true,
          },
          {
            name: 'Always Succeed Step',
            if: 'failure()',
            run: 'echo "E2E tests failed, but we are allowing the pipeline to succeed."',
          },
        ],
      };
    }

    wf.addJobs(jobs);
  }

  private loadEnv(): Record<string, string> {
    return {
      // NODE ENV settings
      'NODE_OPTIONS': '--max-old-space-size=8192',
      // Shared settings
      'AWS_ACCOUNT_ID': '${{ secrets.AWS_ACCOUNT_ID }}',
      'AWS_REGION': '${{ secrets.AWS_REGION }}',
      'ENV_TYPE': '${{ vars.ENV_TYPE }}',
      'ENV_NAME': '${{ vars.ENV_NAME }}',
      'APP_DOMAIN_NAME': '${{ vars.APP_DOMAIN_NAME }}',
      'AWS_HOSTED_ZONE_ID': '${{ secrets.AWS_HOSTED_ZONE_ID }}', // Not required when env-type: 'dev', but must exist for the same app-domain-name if configured
      'AWS_CERTIFICATE_ARN': '${{ secrets.AWS_CERTIFICATE_ARN }}', // Not required when env-type: 'dev', but must exist for the same app-domain-name if configured
      // Back-End specific settings
      'JWT_SECRET_KEY': '${{ secrets.JWT_SECRET_KEY }}',
      'SYSTEM_ADMIN_EMAIL': '${{ vars.SYSTEM_ADMIN_EMAIL }}',
      'SYSTEM_ADMIN_PASSWORD': '${{ secrets.SYSTEM_ADMIN_PASSWORD }}',
      'TEST_USER_EMAIL': '${{ vars.TEST_USER_EMAIL }}',
      'TEST_USER_PASSWORD': '${{ secrets.TEST_USER_PASSWORD }}',
      // Front-End specific settings
      'SLACK_E2E_TEST_WEBHOOK_URL': '${{ vars.SLACK_E2E_TEST_WEBHOOK_URL }}',
    };
  }

  private bootstrapSteps(): github.workflows.JobStep[] {
    const project = this.project as typescript.TypeScriptProject;
    return [
      {
        name: 'Checkout',
        uses: 'actions/checkout@v4',
        with: { 'fetch-depth': 0 },
      },
      {
        name: 'Install pnpm',
        uses: 'pnpm/action-setup@v4',
        with: { version: this.pnpmVersion },
      },
      {
        name: 'Setup node',
        uses: 'actions/setup-node@v4',
        with: {
          'node-version': project.minNodeVersion,
          cache: 'pnpm',
        },
      },
      // Ensures the nx cache for the current commit sha is restored
      // before running any subsequent commands. This allows outputs
      // from any previous target executions to become available and
      // avoids re-running previously cached targets unnecessarily.
      // This action also updates the cache with any changes and the
      // end of the job so that subsequent jobs get the updated cache.
      {
        name: 'Nx cache',
        uses: 'actions/cache@v4',
        with: {
          path: 'node_modules/.cache/nx',
          'fail-on-cache-miss': false,
          key: 'nx-${{ github.repository_id }}-${{ github.sha }}',
        },
      },
      {
        name: 'Install dependencies',
        run: 'pnpm install',
      },
      // This determines the sha of the last successful build on the main branch
      // (known as the base sha) and adds to env vars along with the current (head) sha.
      // The commits between the base and head sha's is used by subsequent 'nx affected'
      // commands to determine what packages have changed so targets only run
      // against those packages.
      {
        name: 'Derive SHAs for nx affected commands',
        uses: 'nrwl/nx-set-shas@v4',
        with: { 'main-branch-name': 'main' },
      },
    ];
  }

  private configureAwsCredentials(): github.workflows.JobStep[] {
    return [
      {
        name: 'Configure AWS Credentials',
        id: 'configure_iam_credentials',
        uses: 'aws-actions/configure-aws-credentials@v4',
        with: {
          'role-to-assume': 'arn:aws:iam::${{ secrets.AWS_ACCOUNT_ID }}:role/GitHub_to_AWS_via_FederatedOIDC',
          'role-session-name': 'GitHub_to_AWS_via_FederatedOIDC',
          'role-duration-seconds': 3600,
          'aws-region': '${{ secrets.AWS_REGION }}',
          'audience': 'sts.amazonaws.com',
        },
      },
    ];
  }
}
