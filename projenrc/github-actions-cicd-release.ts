import { IConstruct } from 'constructs';
import { Component, github, typescript } from 'projen';

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
            name: 'Run CI/CD Test Back-End',
            run: 'pnpm run cicd-test-back-end',
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
            name: 'Run CI/CD CDK Bootstrap Back-End',
            run: 'pnpm run cicd-bootstrap-back-end',
          },
          {
            name: 'Run CI/CD Build & Deploy Back-End',
            run: 'pnpm run cicd-build-deploy-back-end',
          },
        ],
      },
      // ['test-front-end']: {
      //   name: 'Test Front-End',
      //   needs: ['build-deploy-back-end'],
      //   runsOn,
      //   environment: this.environment,
      //   env: this.loadEnv(),
      //   permissions: {
      //     contents: github.workflows.JobPermission.WRITE,
      //     actions: github.workflows.JobPermission.READ,
      //   },
      //   steps: [
      //     ...this.bootstrapSteps(),
      //     {
      //       name: 'Run CI/CD Test Front-End',
      //       run: 'pnpm cicd-test-front-end',
      //     },
      //   ],
      // },
      ['build-deploy-front-end']: {
        name: 'Build & Deploy Front-End',
        // needs: ['test-front-end'],
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
            name: 'Run CI/CD CDK Bootstrap Back-End',
            run: 'pnpm cicd-bootstrap-front-end',
          },
          {
            name: 'Run CI/CD Build & Deploy Front-End',
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
      'SYSTEM_ADMIN_PASSWORD': '${{ secrets.SYSTEM_ADMIN_PASSWORD }}',
      'SECRET_KEY': '${{ secrets.SECRET_KEY }}',
      'TEST_USER_EMAIL': '${{ vars.TEST_USER_EMAIL }}',
      'TEST_USER_PASSWORD': '${{ secrets.TEST_USER_PASSWORD }}',
      // Front-End specific settings
      'AWS_HOSTED_ZONE_ID': '${{ secrets.AWS_HOSTED_ZONE_ID }}', // Must be pre-configured in AWS
      'AWS_HOSTED_ZONE_NAME': '${{ secrets.AWS_HOSTED_ZONE_NAME }}', // Must be pre-configured in AWS
      'AWS_CERTIFICATE_ARN': '${{ secrets.AWS_CERTIFICATE_ARN }}', // Must be pre-configured in AWS
      'AWS_COGNITO_USER_POOL_ID': '${{ secrets.AWS_COGNITO_USER_POOL_ID }}', // Sourced from Back-End deployment
      'AWS_COGNITO_CLIENT_ID': '${{ secrets.AWS_COGNITO_CLIENT_ID }}', // Sourced from Back-End deployment
      'AWS_BASE_API_URL': '${{ secrets.AWS_BASE_API_URL }}', // Sourced from Back-End deployment
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
      // The commits between the base and head sha's is used by subesquent 'nx affected'
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
