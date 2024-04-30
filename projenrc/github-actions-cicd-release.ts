import { Component, github, typescript } from 'projen';
import { IConstruct } from 'constructs';

// Custom projen component that configures a Github Actions Workflow.
export class GithubActionsCICDRelease extends Component {
  private readonly environment: string;
  private readonly pnpmVersion: string;

  constructor(rootProject: typescript.TypeScriptProject, options: { environment: string; pnpmVersion: string }) {
    super(<IConstruct>rootProject);
    this.environment = options.environment;
    this.pnpmVersion = options.pnpmVersion;

    const wf = new github.GithubWorkflow(rootProject.github!, `cicd-release-${this.environment}`);
    const runsOn = ['ubuntu-latest'];
    wf.on({ push: { branches: ['main'] } });

    wf.addJobs({
      ['test-back-end']: {
        name: 'Test Back-End',
        runsOn,
        environment: this.environment,
        env: this.loadEnv(),
        permissions: {
          contents: github.workflows.JobPermission.WRITE,
          actions: github.workflows.JobPermission.READ,
        },
        steps: [
          ...this.bootstrapSteps(),
          {
            name: 'Run Test Back-End CI/CD',
            run: 'pnpm cicd-test-back-end',
          },
        ],
      },
      ['build-deploy-back-end']: {
        name: 'Build & Deploy Back-End',
        needs: ['test-back-end'],
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
            name: 'Run Build & Deploy Back-End CI/CD',
            run: 'pnpm cicd-build-deploy-back-end',
          },
        ],
      },
      ['test-front-end']: {
        name: 'Test Front-End',
        needs: ['build-deploy-back-end'],
        runsOn,
        environment: this.environment,
        env: this.loadEnv(),
        permissions: {
          contents: github.workflows.JobPermission.WRITE,
          actions: github.workflows.JobPermission.READ,
        },
        steps: [
          ...this.bootstrapSteps(),
          {
            name: 'Run Test Front-End CI/CD',
            run: 'pnpm cicd-test-front-end',
          },
        ],
      },
      ['build-deploy-front-end']: {
        name: 'Build & Deploy Front-End',
        needs: ['test-front-end'],
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
            name: 'Run Build & Deploy Front-End CI/CD',
            run: 'pnpm cicd-build-deploy-front-end',
          },
        ],
      },
    });
  }

  private loadEnv(): Record<string, string> {
    return {
      'AWS_ACCOUNT_ID': '${{ secrets.AWS_ACCOUNT_ID }}',
      'AWS_REGION': '${{ secrets.AWS_REGION }}',
      'ENV_TYPE': '${{ vars.ENV_TYPE }}',
      'ENV_NAME': '${{ vars.ENV_NAME }}',
      'APPLICATION_URL': '${{ vars.APPLICATION_URL }}',
      // Back-End specific settings
      'SYSTEM_ADMIN_EMAIL': '${{ vars.SYSTEM_ADMIN_EMAIL }}',
      // Front-End specific settings
      'AWS_HOSTED_ZONE_ID': '${{ secrets.AWS_HOSTED_ZONE_ID }}', // Must be pre-configured in AWS
      'AWS_HOSTED_ZONE_NAME': '${{ secrets.AWS_HOSTED_ZONE_NAME }}', // Must be pre-configured in AWS
      'AWS_CERTIFICATE_ARN': '${{ secrets.AWS_CERTIFICATE_ARN }}', // Must be pre-configured in AWS
      'AWS_COGNITO_USER_POOL_ID': '${{ secrets.AWS_COGNITO_USER_POOL_ID }}', // Sourced from Back-End deployment
      'AWS_COGNITO_CLIENT_ID': '${{ secrets.AWS_COGNITO_CLIENT_ID }}', // Sourced from Back-End deployment
      'AWS_BASE_API_URL': '${{ secrets.AWS_BASE_API_URL }}', // Sourced from Back-End deployment
      'MOCK_ORG_ID': '${{ vars.MOCK_ORG_ID }}', // TODO: Remove once custom User Authorization logic retrieves OrgIds
    };
  }

  private bootstrapSteps(): github.workflows.JobStep[] {
    const project = this.project as typescript.TypeScriptProject;
    return [
      {
        name: 'Checkout',
        uses: 'actions/checkout@v3',
        with: { 'fetch-depth': 0 },
      },
      {
        name: 'Install pnpm',
        uses: 'pnpm/action-setup@v2.2.1',
        with: { version: this.pnpmVersion },
      },
      {
        name: 'Setup node',
        uses: 'actions/setup-node@v3',
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
        uses: 'actions/cache@v3',
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
      // The commits between the base and head sha's is used by subesquent 'nx affected'
      // commands to determine what packages have changed so targets only run
      // against those packages.
      {
        name: 'Derive SHAs for nx affected commands',
        uses: 'nrwl/nx-set-shas@v2',
        with: { 'main-branch-name': 'main' },
      },
    ];
  }

  private configureAwsCredentials(): github.workflows.JobStep[] {
    return [
      {
        name: 'Configure AWS Credentials',
        id: 'configure_iam_credentials',
        uses: 'aws-actions/configure-aws-credentials@v1',
        with: {
          'role-to-assume': 'arn:aws:iam::851725267090:role/GitHub_to_AWS_via_FederatedOIDC',
          'role-session-name': 'GitHub_to_AWS_via_FederatedOIDC',
          'role-duration-seconds': 3600,
          'aws-region': 'ap-southeast-1',
          'audience': 'sts.amazonaws.com',
        },
      },
    ];
  }
}
