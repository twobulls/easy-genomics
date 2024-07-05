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

This project is organized as a mono-repo that consists of the following sub-projects:

- `packages/back-end`: contains back-end application-logic, data integrations with AWS HealthOmics / NextFlow Tower, and
  back-end infrastructure
- `packages/front-end`: contains front-end application-logic, styling, and front-end infrastructure
- `packages/shared-lib`: contains shared code, object type-definitions, infrastructure constructs shared between the
  `back-end` and `front-end` sub-projects

In addition to the sub-project structure, the `back-end` application logic is further organized into the following
sub-components for logical separation to make it easier to maintain and enhance:

- `easy-genomics`: contains this web application's specific logic
- `aws-healthomics`: contains AWS HealthOmics specific logic
- `nf-tower`: contains NextFlow Tower specific logic

## Quick Start

The following steps provide a quick start local development guide:

1. Clone this Github Repository to your local machine:

   ```
   $ git clone https://github.com/twobulls/easy-genomics.git
   ```

2. Change directory into the Easy Genomics project root directory:

   ```
   $ cd easy-genomics
   [easy-genomics]$
   ```

3. Run `pnpm projen install` to install the dependencies defined in the `.projenrc.ts` file to the latest versions:

   ```
   [easy-genomics]$ pnpm projen install
   ```

4. Run `pnpm projen` to synthesize the project files and dependency changes:

   ```
   [easy-genomics]$ pnpm projen
   ```

5. Configure your local machine AWS CLI credentials:

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

6. Copy the `/config/easy-genomics.example.yaml` as `/config/easy-genomics.yaml` and edit its settings for your
   deployment environment. To add new environments add configuration following the example template.

   - Please consult the
     [/packages/shared-lib/src/app/types/configuration.d.ts](https://github.com/twobulls/easy-genomics/blob/main/packages/shared-lib/src/app/types/configuration.d.ts)
     for more information regarding the configuration type definition.
   - NOTE: Each configuration is validated at run-time, if a configuration is incomplete or invalid it will be ignored
     as part of the build and deployment.

   ```
   e.g.

   easy-genomics:
      configurations:
         - dev:
            aws-account-id:
            aws-region:
            env-type: dev # e.g. dev | pre-prod | prod
            application-url: dev.easygenomics.myinstitution.org # e.g. dev.easygenomics.org

            # Back-End specific settings
            back-end:
               system-admin-email: admin@myinstitution.org # e.g. sysadmin@easygenomics.org

            # Front-End specific settings
               front-end:
                  # The following Front-End Infrastructure settings will need to be pre-configured in AWS.
                  aws-hosted-zone-id:
                  aws-hosted-zone-name:
                  aws-certificate-arn:

                  # The following Front-End Web UI / Nuxt Config settings will need to be sourced from the Back-End deployment.
                  aws-cognito-user-pool-id:
                  aws-cognito-client-id:
                  base-api-url:
                  mock-org-id:
         - prod:
            ...
   ```

7. Within the root directory, run `pnpm run bootstrap-all` to bootstrap CDK for the Back-End & Front-End stacks for the
   configured AWS Account ID & Region.

   - If you have multiple configurations in the `/config/easy-genomics.yaml` file, this command will bootstrap each
     valid configuration.

   ```
   [easy-genomics]$ pnpm run bootstrap-all
   ```

8. If you only have one configuration in the `/config/easy-genomics.yaml`, you can use the following convenience
   commands to:

   - Build the entire application:
     ```
     [easy-genomics]$ pnpm run build-all
     ```
   - Build and deploy the entire application:
     ```
     [easy-genomics]$ pnpm run deploy-all
     ```
     - HINT: Comment out additional configurations in the `/config/easy-genomics.yaml` to make use of these convenience
       commands.

   However, if you have multiple configurations in the `/config/easy-genomics.yaml`, you will require the following
   steps:

   1. Change directory to the `/packages/back-end` directory.
      ```
      [easy-genomics]$ cd packages/back-end
      ```
   2. Run `pnpm run build`.
      ```
      [easy-genomics/packages/back-end]$ pnpm run build
      ```
   3. Run `pnpm run deploy {env-name}-main-back-end-stack`.

      ```
      e.g. where {env-name} = prod

      [easy-genomics/packages/back-end]$ pnpm run deploy prod-main-back-end-stack
      ```

   4. Change directory to the `/packages/front-end` directory.
      ```
      [easy-genomics/packages/front-end]$ cd ../front-end
      ```
   5. Run `pnpm run nuxt-prepare --stack {env-name}`.
      ```
      [easy-genomics/packages/front-end]$ pnpm run nuxt-prepare
      ```
   6. Run `pnpm run build`.
      ```
      [easy-genomics/packages/front-end]$ pnpm run build
      ```
   7. Run `pnpm run nuxt-generate --stack {env-name}`.

      ```
      e.g. where {env-name} = prod

      [easy-genomics/packages/front-end]$ pnpm run nuxt-generate --stack prod
      ```

   8. Run `pnpm run deploy {env-name}-main-front-end-stack`.

      ```
      e.g. where {env-name} = prod

      [easy-genomics/packages/front-end]$ pnpm run deploy prod-main-front-end-stack
      ```

## Contributions

### Branch Naming convention:

This project requires the branch name to follow the customized
[validate-branch-name](https://www.npmjs.com/package/validate-branch-name) regular expression:
`^(main|release){1}$|^(feat|fix|hotfix|release|refactor|chore|docs)/.+$`, defined within the `.husky/pre-commit` hook.

Format: `<Branch Type>/<Summary>`

where `<Branch Type>`:

- `feat`
- `fix`
- `hotfix`
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
|                +--> Branch Type: feat, fix, hotfix, release, refactor, chore, docs.
|
+-------> Create new branch from current branch.
```

```
git branch -m "fix/EG-XXX_fix_something_&_something_else"
^-----------^  ^-^ ^-----------------------------------^
|              |   |
|              |   +-> Summary in present tense with JIRA ticket prefix when possible.
|              |
|              +--> Branch Type: feat, fix, hotfix, release, refactor, chore, docs.
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
