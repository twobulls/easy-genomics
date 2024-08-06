# Easy Genomics

## Introduction

This open-source web application project aims to help simplify genomic analysis of sequenced genetic data for
bioinformaticians utilizing AWS HealthOmics & NextFlow Tower. This project is an initiative of the Wisconsin State
Laboratory of Hygiene (WSLH), AWS HealthOmics, and the US Centers for Disease Control and Prevention (CDC).

This web application has been designed to work on AWS Cloud Infrastructure and utilises:

- AWS CDK leveraging CloudFormation for Infrastructure-as-Code (IaC)
- AWS SDKs & libraries
- NX for mono-repo management and build management
- Nuxt for front-end build and development
- Projen for project and dependency management
- PNPM for package management

This project is organized as a mono-repo that consists of the following sub-packages:

- `packages/back-end`: contains back-end application-logic, data integrations with AWS HealthOmics / NextFlow Tower, and
back-end infrastructure
- `packages/front-end`: contains front-end application-logic, styling, and front-end infrastructure
- `packages/shared-lib`: contains shared code, object type-definitions, infrastructure constructs shared between the
`back-end` and `front-end` sub-packages

In addition to the sub-package structure, the `back-end` application logic is further organized into the following
sub-components for logical separation to make it easier to maintain and enhance:

- `easy-genomics`: contains this web application's specific logic
- `aws-healthomics`: contains AWS HealthOmics specific logic
- `nf-tower`: contains NextFlow Tower specific logic

NOTE: As of 2024, the Easy Genomics' AWS HealthOmics integration has been deferred to align with AWS HealthOmics'
upcoming new features on their development roadmap, and will focus on integration with NextFlow Tower / Seqera Cloud
platform in the meantime.

## Installation Quick Start Guide

The configuration deployment consists of five steps:
1. Configure the AWS Credentials on your local machine.
2. Configure the `easy-genomics.yaml` shared settings and back-end specific settings.
3. Deploy the Easy Genomics back-end logic.
4. Configure the `easy-genomics.yaml` front-end specific settings, including details generated from the previous step.
5. Deploy the Easy Genomics front-end logic.

Skip to [Configuration and Installation](#configuration-and-installation) section if you already have satisfied the
[Prerequisites and Preparation](#prerequisites-and-preparation) tasks below.

### Prerequisites and Preparation
Before the following Quick Start instructions can be carried out, your local computer requires the following utilities
to be installed.

| Build Dependency Utility | Tested Version | More Information                          | 
|--------------------------|----------------|-------------------------------------------|
| `git`                    | v2.40.1        | https://github.com/git-guides/install-git |
| `nvm`                    | v0.40.0        | https://nvm.sh                            |
 | `node`                   | v20.15.0       | https://nodejs.org                        |
| `pnpm`                   | v9.6.0         | https://pnpm.io/installation              | 

NOTE: If you are using a restricted operating system environment for deployment where NodeJS package(s) cannot be
installed in a system-wide / global context (such as AWS CloudShell), you will need to run the following commands in
order to install the NodeJS package(s) locally.

```
# Verify GIT is installed and executable
[cloudshell-user@ip-... ~]$ git --version                           # Expect v2.40.1

# Install NVM and verify it is executable
[cloudshell-user@ip-... ~]$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
[cloudshell-user@ip-... ~]$ nvm --version                           # Expect v0.40.0

# Use NVM to install and use NodeJs ver 20.15.0
[cloudshell-user@ip-... ~]$ nvm install 20.15.0
[cloudshell-user@ip-... ~]$ nvm alias default 20.15.0
[cloudshell-user@ip-... ~]$ node --version                          # Expect v20.15.0

# Install PNPM and verify it is executable
[cloudshell-user@ip-... ~]$ npm install -g pnpm
[cloudshell-user@ip-... ~]$ pnpm --version                          # Expect v9.6.0
```

Additionally, you will need to manually setup a Public Hosted Zone in AWS Route53 with the same Domain Name that will be 
used in the`${easy-genomics root-dir}/config/easy-genomics.yaml` configuration file's `app-domain-name` setting.

* ``

1. Clone this Github Repository to your local machine:

   ```
   $ git clone https://github.com/twobulls/easy-genomics.git
   ```

2. Change directory into the Easy Genomics project root directory (referred to as `${easy-genomics root-dir}` from henceforth):

   ```
   $ cd easy-genomics
   [easy-genomics]$
   ```

3. Run `pnpm install` to install the initial project dependencies, including `projen` for project and dependency management.

   ```
   [easy-genomics]$ pnpm install
   ```

4. Run `pnpm projen` to synthesize/update the project files managed by `projen`:

   ```
   [easy-genomics]$ pnpm projen
   ```

5. Run `pnpm projen install` to install all the defined `.projenrc.ts` dependencies for compilation:

   ```
   [easy-genomics]$ pnpm projen install
   ```
   
    * The `.projenrc.ts` defined dependencies can be easily upgraded and resolve any potential security updates:
      ```
      [easy-genomics]$ pnpm projen upgrade
      ```

### Configuration and Installation

1. Configure your local machine AWS CLI credentials.

   * NOTE: This step is not required if using AWS CloudShell.

      ```
      [easy-genomics]$ aws configure
      AWS Access Key ID [****************PXCF]:
      AWS Secret Access Key [****************mipR]:
      Default region name [us-east-1]:
      Default output format [None]:
      ```

      Alternatively, if you have access to the AWS access portal copy and paste the temporary credentials provided into
      your shell/terminal:

      ```
      e.g.

      export AWS_ACCESS_KEY_ID="..."
      export AWS_SECRET_ACCESS_KEY="..."
      export AWS_SESSION_TOKEN="..."
      ```

2. Copy the `${easy-genomics root-dir}/config/easy-genomics.example.yaml` as `${easy-genomics root-dir}/config/easy-genomics.yaml`
and edit the Shared and Back-End settings for your deployment environment.

   For convenience, the `easy-genomics.yaml` configuration file can support multiple configurations, but each will
   require a unique identifier for the collection of configuration settings. The example below illustrates the
   `dev` and `prod` configuration settings.

   ```
   e.g.

   easy-genomics:
      configurations:
         - dev: # Unique identifier for the following collection of configuration settings (e.g. dev, uat, demo, prod)
            # Shared settings common to Back-End and Front-End sub-packages
            aws-account-id: # e.g. 123456789
            aws-region: # e.g. us-east-1
            env-type: dev # e.g. dev | pre-prod | prod; only dev env-type can have AWS CloudFormation resources destroyed
            app-domain-name: dev.easy-genomics.mycompany.com # e.g. dev.easy-genomics.myinstitution.org

            # Back-End specific settings
            back-end:
               secret-key: # Random Secret Key value for crypographic salt   
               system-admin-email: sysadmin@myinstitution.org
               system-admin-password: T0pS3cret! # System Admin initial Cognito Password
               test-user-email: demo.user@myinstitution.org
               test-user-password: P@ssw0rd! # Demo User initial Cognito Password
               seqera-api-base-url: # Optional: Update for self-hosted Seqera API Base URL; defaults to 'https://api.cloud.seqera.io'

            # Front-End specific settings
               front-end:
                  # The following Front-End Infrastructure settings will need to be pre-configured in AWS.
                  aws-hosted-zone-id:
                  aws-hosted-zone-name:
                  aws-certificate-arn:

                  # The following Front-End Web UI / Nuxt Config settings will need to be sourced from the Back-End deployment.
                  aws-api-gateway-url:
                  aws-cognito-user-pool-id:
                  aws-cognito-user-pool-client-id:
         - prod:
            ...
   ```

   * Please consult the [/packages/shared-lib/src/app/types/configuration.d.ts](https://github.com/twobulls/easy-genomics/blob/main/packages/shared-lib/src/app/types/configuration.d.ts) 
   for more information regarding the configuration type definition.
   * Each configuration is validated at run-time, if a configuration is incomplete or invalid it will be ignored as part
   of the build and deployment.

3. Deploy the Easy Genomics Back-End sub-package to AWS using the following commands:

   ```
   [easy-genomics]$ cd packages/back-end
   [easy-genomics/packages/back-end]$ pnpm run bootstrap
   [easy-genomics/packages/back-end]$ pnpm run build
   [easy-genomics/packages/back-end]$ pnpm run deploy
   ```
    * NOTE: If the `easy-genomics.yaml` has multiple collections of configuration settings, you can supply the
    configuration collection's `{Unique identifier}-main-back-end-stack` to specifically build and deploy it.
   
      ```
      e.g.
      
      [easy-genomics/packages/back-end]$ pnpm run build dev-main-back-end-stack
      [easy-genomics/packages/back-end]$ pnpm run deploy dev-main-back-end-stack
      ```
   
    Once Back-End deployment is completed, it will generate the following AWS configurations details which will be 
    required for the Front-End configuration settings.

      ```
      [easy-genomics/packages/back-end]$ pnpm run deploy
      ...
   
      Outputs:
      dev-main-back-end-stack.ApiGatewayRestApiUrl = {AWS_API_GATEWAY_URL}
      dev-main-back-end-stack.CognitoUserPoolClientId = {AWS_COGNITO_USER_POOL_CLIENT_ID}
      dev-main-back-end-stack.CognitoUserPoolId = {AWS_COGNITO_USER_POOL_ID}
      ```

4. Update the `${easy-genomics root-dir}/config/easy-genomics.yaml` Front-End specific settings with the pre-configured
AWS Route53 Hosted Zone details, and the AWS configuration details generated from the Back-End deployment.
   
   ```
            ...
            # Front-End specific settings
               front-end:
                  # The following Front-End Infrastructure settings will need to be pre-configured in AWS.
                  aws-hosted-zone-id:
                  aws-hosted-zone-name:
                  aws-certificate-arn:

                  # The following Front-End Web UI / Nuxt Config settings will need to be sourced from the Back-End deployment.
                  aws-api-gateway-url: {AWS_API_GATEWAY_URL}
                  aws-cognito-user-pool-id: {AWS_COGNITO_USER_POOL_ID}
                  aws-cognito-user-pool-client-id: {AWS_COGNITO_USER_POOL_CLIENT_ID}
   ```

5. Deploy the Easy Genomics Front-End sub-package to AWS using the following commands:

   ```
   [easy-genomics/packages/back-end]$ cd ../front-end
   [easy-genomics/packages/front-end]$ pnpm run bootstrap
   [easy-genomics/packages/front-end]$ pnpm run build
   [easy-genomics/packages/front-end]$ pnpm run nuxt-prepare
   [easy-genomics/packages/front-end]$ pnpm run nuxt-generate
   [easy-genomics/packages/front-end]$ pnpm run deploy
   ```

    * NOTE: If the `easy-genomics.yaml` has multiple collections of configuration settings, you can supply the
    configuration collection's `{Unique identifier}-main-front-end-stack` to specifically build and deploy it.
    You will also need to explicitly specify the `{Unique identifier}` to prepare and generate the Nuxt UI content.
   
      ```
      e.g.
      
      [easy-genomics/packages/front-end]$ pnpm run build dev-main-front-end-stack
      [easy-genomics/packages/front-end]$ pnpm run nuxt-prepare --stack dev
      [easy-genomics/packages/front-end]$ pnpm run nuxt-generate --stack dev
      [easy-genomics/packages/front-end]$ pnpm run deploy dev-main-front-end-stack
      ```
      
      * Once Front-End deployment is completed, open a web browser and enter the URL for the configured `app-domain-name`
      to access the login page. 

      * Use the `${easy-genomics root-dir}/config/easy-genomics.yaml` file's configured
      `test-user-email` and `test-user-password` account details to log in into Easy Genomics to test the functionality.

   * NOTE: Whilst in non-production status, the deployed Easy Genomics installation requires manually adding a new
   user's email to the AWS Simple-Email-Service (SES) verified identities list before AWS SES will send out new user
   invitations and forgot-password emails.
      
## Contributions

### Branch Naming convention:

This project requires the branch name to follow the customized
[validate-branch-name](https://www.npmjs.com/package/validate-branch-name) regular expression:
`^(main|release){1}$|^(feat|fix|hotfix|infra|release|refactor|chore|docs)/.+$`, defined within the `.husky/pre-commit` hook.

Format: `<Branch Type>/<Summary>`

where `<Branch Type>`:

- `feat`
- `fix`
- `hotfix`
- `infra`
- `release`
- `refactor`
- `chore`
- `docs`

#### Example branch names

```
git checkout -b "feat/EG-XXX_add_new_feature"
^-------------^  ^-----^ ^--------------------^
|                |       |
|                |       +-> Summary in present tense with JIRA ticket prefix when possible.
|                |
|                +--> Branch Type: feat, fix, hotfix, infra, release, refactor, chore, docs.
|
+-------> Create new branch from current branch.
```

```
git branch -m "fix/EG-XXX_fix_something_&_something_else"
^-----------^  ^-^ ^-----------------------------------^
|              |   |
|              |   +-> Summary in present tense with JIRA ticket prefix when possible.
|              |
|              +--> Branch Type: feat, fix, hotfix, infra, release, refactor, chore, docs.
|
+-------> Modify current branch name.
```

### Conventional Commit syntax:

This project requires commit messages to follow the
[Conventional Commit specification](https://www.conventionalcommits.org/):

Format: `<Commit Type>(<Scope>): <Subject>`

where `<Commit Type>`:

- `feat`: Introduces a new feature or provides an enhancement of an existing feature
- `fix`: Patches a bug
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `style`: Formatting, missing semi colons, etc; no production code change
- `test`: Adds missing tests or corrects existing tests
- `docs`: Documentation only changes
- `chore`: Changes to the build process or auxiliary tools and libraries such as CI or package updates

Note: `<Scope>` is optional

#### Example commit message

```
git commit -m "feat(EG-XXX): add hat wobble"
^-----------^  ^--^ ^----^   ^------------^
|              |    |        |
|              |    |        +-> Subject in present tense.
|              |    |
|              |    +--> Scope: specify the JIRA ticket code here when possible.
|              |
|              +--> Commit Type: chore, docs, feat, fix, refactor, style, or test.
|
+-------> Create a commit to the current branch with a message.
```
