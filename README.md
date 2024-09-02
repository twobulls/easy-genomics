# Easy Genomics

## Table of Contents

- [Introduction](#introduction)
- [Installation Quick Start Guide](#installation-quick-start-guide)
  - [Prerequisites and Preparation](#prerequisites-and-preparation)
  - [Configuration and Installation](#configuration-and-installation)
  - [Test Runners](#test-runners)
    - [End-to-End Tests](#end-to-end-tests)
  - [Contributions](#contributions)
- [Branch Naming Convention](#branch-naming-convention)
- [Conventional Commit Syntax](#conventional-commit-syntax)

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

---

## Installation Quick Start Guide

The configuration deployment consists 3 simple steps:

1. Configure the AWS Credentials on your local machine.
2. Configure the `easy-genomics.yaml` shared settings and back-end specific settings.
3. Deploy the Easy Genomics.

Skip to [Configuration and Installation](#configuration-and-installation) section if you already have satisfied the
[Prerequisites and Preparation](#prerequisites-and-preparation) tasks below.

### Prerequisites and Preparation

Before the following Quick Start instructions can be carried out, the O/S environment used for this installation
requires the following utilities to be available.

| Build Dependency Utility | Tested Version | More Information                          |
| ------------------------ | -------------- | ----------------------------------------- |
| `git`                    | v2.40.1        | https://github.com/git-guides/install-git |
| `nvm`                    | v0.40.0        | https://nvm.sh                            |
| `node`                   | v20.15.0       | https://nodejs.org                        |
| `pnpm`                   | v9.6.0         | https://pnpm.io/installation              |

NOTE: If you are using a restricted O/S environment for deployment where NodeJS package(s) cannot be installed in a
system-wide / global context (such as AWS Cloud9), you will need to run the following commands in order to install the
NodeJS package(s) locally.

```
# Verify GIT is installed and executable
[user ~]$ git --version                           # Expect v2.40.1

# Install NVM and verify it is executable
[user ~]$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
[user ~]$ nvm --version                           # Expect v0.40.0

# Use NVM to install and use NodeJs ver 20.15.0
[user ~]$ nvm install 20.15.0
[user ~]$ nvm alias default 20.15.0
[user ~]$ node --version                          # Expect v20.15.0

# Install PNPM and verify it is executable
[user ~]$ npm install -g pnpm
[user ~]$ pnpm --version                          # Expect v9.6.0
```

Also ensure the O/S has sufficient disk space (50GiB or more) to complete the compilation and installation process.

If you are using the AWS Cloud9 environment, you will need to increase the EBS disk volume using the following
[AWS provided Bash script](https://docs.aws.amazon.com/cloud9/latest/user-guide/move-environment.html#move-environment-resize).
Copy and save the script logic as `resize.sh` to your AWS Cloud9 environment, and then run the script:

```
[user ~]$ chmod +x ./resize.sh                    # Make the './resize.sh' script executable
[user ~]$ ./resize.sh 200                         # Run './resize.sh' script to increase ESB volume size to 200GiB
```

Once the above mentioned prerequisites and preparation steps have been completed, complete the following commands to
obtain the Easy Genomics project source code and install the project dependencies.

1. Clone this Github Repository to your local O/S environment:

   ```
   $ git clone https://github.com/twobulls/easy-genomics.git
   ```

2. Change directory into the Easy Genomics project root directory (referred to as `${easy-genomics root-dir}` from
   henceforth):

   ```
   $ cd easy-genomics
   [easy-genomics]$
   ```

3. Run `pnpm install` to install the initial project dependencies, including `projen` for project and dependency
   management.

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

### Configuration and Installation

1. Configure your local machine AWS CLI credentials.

   NOTE: This step is not required if the configuration and deployment is from an AWS environment such as CloudShell, or
   Cloud9.

   ```
   [easy-genomics]$ aws configure
   AWS Access Key ID [****************PXCF]:
   AWS Secret Access Key [****************mipR]:
   Default region name [us-east-1]:
   Default output format [None]:
   ```

   NOTE: If you are manually configuring the AWS CLI credentials, please ensure the AWS Region set matches the
   `aws-region` setting in the `easy-genomics.yaml` configuration file.

   Alternatively, if you have access to the AWS access portal copy and paste the temporary credentials provided into
   your shell/terminal:

   ```
   e.g.

   export AWS_ACCESS_KEY_ID="..."
   export AWS_SECRET_ACCESS_KEY="..."
   export AWS_SESSION_TOKEN="..."
   ```

2. Copy the `${easy-genomics root-dir}/config/easy-genomics.example.yaml` as
   `${easy-genomics root-dir}/config/easy-genomics.yaml` and edit the Shared and Back-End settings for your deployment
   environment.

   Please ensure each of the settings are enclosed with quotes `'...'` to enforce explicit string values.

   - NOTE:

     - The quotation for the `aws-account-id` setting is mandatory if the AWS Account ID starts with `00...`.

     - The `easy-genomics.yaml` configuration validation logic has been updated to only support one configuration
       collection in order to simplify the build and deployment workflow. As a result, if there are multiple
       configuration collections you will need to remove or comment the remaining configuration collections.

   ```
   e.g.

   easy-genomics:
      configurations:
         - demo: # Unique 'env-name' identifier for the following collection of configuration settings (e.g. dev, uat, demo, prod)
            # Shared settings common to Back-End and Front-End sub-packages
            aws-account-id: '123456789' # e.g. '123456789'
            aws-region: 'us-east-1' # e.g. 'us-east-1'
            env-type: 'dev' # e.g. 'dev' | 'pre-prod' | 'prod'; only 'dev' env-type can have AWS CloudFormation resources destroyed
            app-domain-name: 'demo.easy-genomics.mycompany.com' # e.g. demo.easy-genomics.myinstitution.org
            # The following Front-End Infrastructure settings will need to be pre-configured in AWS and defined when 'env-type' is 'pre-prod' or 'prod'.
            aws-hosted-zone-id: # Not required when env-type: 'dev', but must exist for the same app-domain-name if configured
            aws-certificate-arn: # Not required when env-type: 'dev', but must exist for the same app-domain-name if configured

            # Back-End specific settings
            back-end:
               test-user-email: 'demouser@easygenomics.com'
               test-user-password: # Demo User Password - must be minimum 8 chars long and contain: 1 number, 1 special char, 1 uppercase letter, 1 lowercase letter
               seqera-api-base-url: # Optional: Update for self-hosted Seqera API Base URL; if unspecified this defaults to 'https://api.cloud.seqera.io'
   ```

   - Please consult the
     [/packages/shared-lib/src/app/types/configuration.d.ts](https://github.com/twobulls/easy-genomics/blob/main/packages/shared-lib/src/app/types/configuration.d.ts)
     for more information regarding the configuration type definition.
   - Each configuration is validated at run-time, if a configuration is incomplete or invalid it will be ignored as part
     of the build and deployment.

3. Deploy the entire Easy Genomics solution to AWS using the following command.

   ```
   [easy-genomics]$ pnpm run build-and-deploy
   ```

   Once the deployment is completed, it will output the `ApplicationUrl` which can then be accessed from your web
   browser.

   ```
   [easy-genomics]$ pnpm run build-and-deploy
   ...

   Outputs:
   dev-main-front-end-stack.ApplicationUrl = https://abcdef12345.cloudfront.net
   dev-main-front-end-stack.HostingBucketName = {app-domain-name}
   ```

   - NOTE: If the `aws-hosted-zone-id` and/or the `aws-certificate-arn` are not defined in the `easy-genomics.yaml`, the
     `ApplicationUrl` returned will be the CloudFront Distribution URL.

   Finally, use the `${easy-genomics root-dir}/config/easy-genomics.yaml` file's configured`test-user-email` and
   `test-user-password` account details to log in into Easy Genomics to test the functionality.

   Once you have completed an initial deployment of the Back-End and Front-End application logic, you can subsequently
   use the `build-and-deploy` short-cut command from the `${easy-genomics root-dir}` directory to conveniently complete
   both Back-End and Front-End deployments in one command.

   ```
   e.g.
   [easy-genomics/packages/front-end]$ cd ../../
   [easy-genomics]$ pnpm run build-and-deploy             # Deploys both Back-End and Front-End logic using the existing easy-genomics.yaml settings
   ```

---

## Test Runners

### End-to-End Tests

End-to-End tests validates the entire application from start to finish by simulating real user scenarios. The tests are
written in TypeScript and use the Playwright library to automate a headless browser instance interacting with the
application.

End-to-End tests (`*.spec.e2e.ts`) are located in the `packages/front-end/test/e2e` directory and are executed using
[Playwright](https://playwright.dev/).

Run the following commands from the root directory of the project. The headless commands will run via a CLI only,
whereas the headed browser instance will open a browser window simulating user interaction with the application.

```bash
# The following commands are used to run the end-to-end tests against a local browser instance of Nuxt - you must first be
# running the Nuxt application locally using the `pnpm dev` command in a separate terminal.
$ pnpm `test-e2e-local` # headless
$ pnpm `test-e2e-local:headed`: # a headed browser instance ("UI mode")

# The following commands are used to run the end-to-end tests on an environment specified inn the `easy-genomics.yaml` file.
$ pnpm `test-e2e`  # headless
$ pnpm `test-e2e:headed ` # a headed browser instance ("UI mode")
```

## Contributions

### Branch Naming convention:

This project requires the branch name to follow the customized
[validate-branch-name](https://www.npmjs.com/package/validate-branch-name) regular expression:
`^(main|release){1}$|^(feat|fix|hotfix|infra|release|refactor|chore|docs)/.+$`, defined within the `.husky/pre-commit`
hook.

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
