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
3. Run `pnpm projen` to synthesize the project files and dependency changes:
   ```
   [easy-genomics]$ pnpm projen
   ```
4. Run `pnpm projen upgrade` to upgrade the dependencies defined in the `.projenrc.ts` file to the latest versions:
   ```
   [easy-genomics]$ pnpm projen upgrade
   ```
5. Configure your local machine AWS CLI credentials:
   ```
   [easy-genomics]$ aws configure
   AWS Access Key ID [****************PXCF]:
   AWS Secret Access Key [****************mipR]:
   Default region name [us-east-1]:
   Default output format [None]:
   ```
6. Copy `/config/easy-genomics.example.yaml` as `config/easy-genomics.yaml` and edit its settings for your deployment
   environment. To add new environments add configuration following the example template.

7. Run `pnpm bootstrap-all` to bootstrap CDK for configured AWS Account ID & Region:
   ```
   [easy-genomics]$ pnpm bootstrap-all
   ```
8. Run `pnpm build-all` to build the entire Easy Genomics web application, which will run eslint, tests, and build for
   each of the sub-projects:
   ```
   [easy-genomics]$ pnpm build-all
   ```
9. Run `pnpm test-all` to test the entire Easy Genomics web application, which will run eslint, compilation, and tests
   for each of the sub-projects:
   ```
   [easy-genomics]$ pnpm test-all
   ```
10. Run `pnpm deploy-all` to deploy the entire Easy Genomics web application to the configured AWS Account & Region:
    ```
    [easy-genomics]$ pnpm deploy-all
    ```
11. If you wish to only focus development on either the `back-end` or `front-end` sub-project you are able to do so by
    the following commands which will automatically include the `shared-lib` dependency:

```
[easy-genomics]$ pnpm boostrap-back-end   // Boostraps the back-end sub-project to the configured AWS Account & Region

[easy-genomics]$ pnpm build-back-end      // Executes eslint, tests, and builds the back-end sub-project with the shared-lib dependency

[easy-genomics]$ pnpm deploy-back-end     // Executes tests, builds, and deploys the back-end resources to the configured AWS Account & Region


[easy-genomics]$ pnpm boostrap-front-end  // Boostraps the front-end sub-project to the configured AWS Account & Region

[easy-genomics]$ pnpm build-front-end     // Executes eslint, tests, builds, and generates static site contents for the front-end sub-project with the shared-lib dependency

[easy-genomics]$ pnpm deploy-front-end    // Executes tests, builds, generates static site contents, and deploys the front-end resources to the AWS Account & Region
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
