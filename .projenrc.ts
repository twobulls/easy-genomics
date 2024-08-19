import { awscdk, javascript, typescript } from 'projen';
import {
  ArrowParens,
  HTMLWhitespaceSensitivity,
  JestOptions,
  PrettierOptions,
  ProseWrap,
  QuoteProps,
  TrailingComma,
  TypescriptConfigExtends,
  TypescriptConfigOptions,
} from 'projen/lib/javascript';
import { pathsToModuleNameMapper } from 'ts-jest';
import { setupProjectFolders } from './projenrc/easy-genomics-project-setup';
import { GithubActionsCICDRelease } from './projenrc/github-actions-cicd-release';
import { Husky } from './projenrc/husky';
import { Nx } from './projenrc/nx';
import { PnpmWorkspace } from './projenrc/pnpm';
import { VscodeSettings } from './projenrc/vscode';

const defaultReleaseBranch = 'main';
const cdkVersion = '2.124.0';
const nodeVersion = '20.15.0';
const pnpmVersion = '9.6.0';
const authorName = 'DEPT Agency';
const copyrightOwner = authorName;
const copyrightPeriod = `${new Date().getFullYear()}`;

const prettierOptions: PrettierOptions = {
  settings: {
    printWidth: 120,
    tabWidth: 2,
    singleQuote: true,
    semi: true,
    trailingComma: TrailingComma.ALL,
    arrowParens: ArrowParens.ALWAYS,
    bracketSpacing: true,
    htmlWhitespaceSensitivity: HTMLWhitespaceSensitivity.IGNORE,
    proseWrap: ProseWrap.ALWAYS,
    quoteProps: QuoteProps.PRESERVE,
    useTabs: false,
    vueIndentScriptAndStyle: true,
    bracketSameLine: false,
    plugins: ['prettier-plugin-tailwindcss'],
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
    // noUnusedLocals: false,
  },
  include: ['packages/back-end/src/**/*.ts', 'packages/front-end/src/**/*.ts', 'packages/shared-lib/src/**/*.ts'],
  exclude: [],
};

const jestOptions: JestOptions = {
  jestConfig: {
    // Add all the special paths to let Jest resolve them properly
    moduleNameMapper: {
      ...pathsToModuleNameMapper(tsConfigOptions.compilerOptions?.paths!, {
        prefix: '<rootDir>/',
      }),
    },
    coveragePathIgnorePatterns: ['/node_modules/'],
  },
  junitReporting: false,
  extraCliOptions: ['--detectOpenHandles'],
};

const eslintGlobalRules = {
  // below rules are downgraded or disabled so as not to conflict with equivalent Prettier rules
  'no-unused-vars': 'warn',
  '@typescript-eslint/no-unused-vars': ['warn'],
  'semi': ['warn', 'always'],
  'comma-dangle': ['warn', 'always-multiline'],
  'space-before-function-paren': 'off',
  'no-console': 'off',
  'arrow-parens': 'warn',
  'no-new': 'warn',
  'no-empty': 'warn',
  'prettier/prettier': 'warn',
  'require-await': 'warn',
  'array-callback-return': 'warn',
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
  githubOptions: {
    pullRequestLintOptions: {
      semanticTitle: true,
      semanticTitleOptions: {
        types: ['feat', 'fix', 'hotfix', 'release', 'refactor', 'chore', 'docs', 'infra'],
      },
    },
  },
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
    '@typescript-eslint/eslint-plugin@^7',
    '@typescript-eslint/parser@^7',
    'aws-cdk-lib',
    'aws-sdk-client-mock',
    'aws-sdk-client-mock-jest',
    'cz-conventional-changelog',
    'eslint',
    'eslint-plugin-prettier',
    'husky',
    'lint-staged',
    'validate-branch-name',
    'prettier',
  ],
});
if (root.eslint) {
  root.eslint.addRules({
    eslintGlobalRules,
    overrides: {
      'files': ['packages/shared-lib/**'],
      'rules': {
        'import/no-extraneous-dependencies': 'off',
      },
    },
  });
  root.eslint.addPlugins('prettier');
  root.eslint.addExtends('plugin:prettier/recommended');
}
root.removeScript('build'); // Remove default root build script - use Back-End & Front-End 'build-and-deploy' script instead
root.removeScript('deploy'); // Remove default root deploy script - use Back-End & Front-End 'build-and-deploy' script instead
root.addScripts({
  // Development convenience scripts
  ['build-back-end']: 'pnpm nx run-many --targets=build --projects=@easy-genomics/shared-lib,@easy-genomics/back-end --verbose=true',
  ['build-front-end']: 'pnpm nx run-many --targets=build --projects=@easy-genomics/shared-lib,@easy-genomics/front-end --verbose=true',
  // CI/CD convenience scripts
  ['cicd-build-deploy-back-end']:
    'export CI_CD=true && pnpm nx run-many --targets=build-and-deploy --projects=@easy-genomics/shared-lib,@easy-genomics/back-end --verbose=true',
  ['cicd-build-deploy-front-end']:
    'export CI_CD=true && pnpm nx run-many --targets=build-and-deploy --projects=@easy-genomics/shared-lib,@easy-genomics/front-end --verbose=true',
  ['prepare']: 'husky || true', // Enable Husky each time projen is synthesized
  ['projen']: 'pnpm dlx projen; nx reset', // Clear NX cache each time projen is synthesized to avoid cache disk-space overconsumption
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
  deps: ['@nestjs/config', 'aws-cdk', 'aws-cdk-lib', 'aws-lambda', 'js-yaml', 'uuid', 'zod'],
  devDeps: ['@types/aws-lambda', '@types/js-yaml', '@types/uuid', 'aws-cdk-lib', 'openapi-typescript'],
});

// Defines the Easy Genomics 'back-end' subproject
const backEndApp = new awscdk.AwsCdkTypeScriptApp({
  parent: root,
  name: '@easy-genomics/back-end',
  outdir: './packages/back-end',
  cdkVersion: cdkVersion,
  defaultReleaseBranch: defaultReleaseBranch,
  docgen: false,
  eslint: true,
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
    '@aws-crypto/client-node',
    '@aws-crypto/decrypt-node',
    '@aws-crypto/encrypt-node',
    '@aws-sdk/client-cognito-identity-provider',
    '@aws-sdk/client-dynamodb',
    '@aws-sdk/client-ses',
    '@aws-sdk/client-ssm',
    '@aws-sdk/client-sso-oidc',
    '@aws-sdk/client-sts',
    '@aws-sdk/client-s3',
    '@aws-sdk/lib-dynamodb',
    '@aws-sdk/s3-request-presigner',
    '@aws-sdk/types',
    '@aws-sdk/util-dynamodb',
    '@easy-genomics/shared-lib@workspace:*',
    'aws-lambda',
    'base64-js',
    'dotenv',
    'jsonwebtoken',
    'uuid',
  ],
  devDeps: [
    '@aws-sdk/types',
    '@types/aws-lambda',
    '@types/jsonwebtoken',
    '@types/node',
    '@types/uuid',
    'aws-sdk-client-mock',
    'prettier',
    'eslint-plugin-prettier',
  ],
});
backEndApp.addScripts({
  ['build']: 'pnpm dlx projen compile && pnpm dlx projen test && pnpm dlx projen build',
  ['deploy']: 'pnpm cdk bootstrap && pnpm dlx projen deploy',
  ['build-and-deploy']: 'pnpm -w run build-back-end && pnpm run deploy',  // Run root build-back-end script to inc shared-lib
});
if (backEndApp.eslint) {
  backEndApp.eslint.addRules(eslintGlobalRules);
  backEndApp.eslint.addExtends('plugin:prettier/recommended');
  backEndApp.eslint.addPlugins('prettier');
}
// Defines the Easy Genomics 'front-end' subproject
const frontEndApp = new awscdk.AwsCdkTypeScriptApp({
  parent: root,
  name: '@easy-genomics/front-end',
  outdir: './packages/front-end',
  cdkVersion: cdkVersion,
  defaultReleaseBranch: defaultReleaseBranch,
  docgen: false,
  eslint: true,
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
  tsconfig: {
    ...tsConfigOptions,
    extends: TypescriptConfigExtends.fromPaths(['./.nuxt/tsconfig.json']),
    compilerOptions: {
      'lib': ['DOM', 'ESNext'],
      rootDir: '.',
      types: ['vue'],
      verbatimModuleSyntax: false,
    },
    'include': ['.nuxt/**/*.d.ts', 'auto-imports.d.ts', 'components.d.ts', '**/*.ts', '**/*d.ts', '**/*.vue'],
  },
  deps: [
    '@aws-amplify/ui-vue@3.1.30',
    '@aws-sdk/s3-request-presigner',
    '@aws-sdk/util-format-url',
    '@easy-genomics/shared-lib@workspace:*',
    '@nuxt/ui',
    '@pinia-plugin-persistedstate/nuxt',
    '@pinia/nuxt',
    '@smithy/types',
    '@smithy/url-parser',
    'aws-amplify@5.3.18',
    'axios',
    'class-variance-authority',
    'clsx',
    'date-fns',
    'dotenv',
    'jwt-decode',
    'lint-staged',
    'nuxt',
    'pinia',
    'prettier-plugin-tailwindcss',
    'sass',
    'tailwindcss',
    'tailwind-merge',
    'unplugin-icons',
    'unplugin-vue-components',
    'uuid',
    'zod',
  ],
  devDeps: [
    '@aws-sdk/types',
    '@nuxt/types',
    '@nuxtjs/eslint-config-typescript',
    '@types/node',
    '@types/uuid',
    '@typescript-eslint/parser',
    'eslint-plugin-prettier',
    'eslint-plugin-vue',
    'kill-port',
    'lint-staged',
    'prettier',
    'typed-openapi',
    'vue-eslint-parser',
  ],
});
frontEndApp.addScripts({
  ['build']: 'pnpm run nuxt-prepare && pnpm run nuxt-generate && pnpm dlx projen compile && pnpm dlx projen test && pnpm dlx projen build',
  ['deploy']: 'pnpm cdk bootstrap && pnpm dlx projen deploy',
  ['build-and-deploy']: 'pnpm -w run build-front-end && pnpm run deploy', // Run root build-front-end script to inc shared-lib
  ['nuxt-build']: 'nuxt build',
  ['nuxt-dev']: 'pnpm kill-port 3000; nuxt dev',
  ['nuxt-generate']: 'nuxt generate', // Required to create front-end/.nuxt/tsconfig.json
  ['nuxt-prepare']: 'nuxt prepare',
  ['nuxt-preview']: 'nuxt preview',
  ['nuxt-postinstall']: 'nuxt prepare',
  ['pre-commit']: 'lint-staged',
  ['nftower-spec-to-zod']: "pnpm typed-openapi ../shared-lib/src/app/types/nf-tower/seqera-api-latest.yml -r 'zod'",
});
frontEndApp.addFields({
  'lint-staged': {
    '{**/*,*}.{js,ts}': ['eslint --fix'],
    '{**/*,*}.{js,ts,vue,scss,json,md,html,mdx}': ['prettier --write'],
  },
});
if (frontEndApp.eslint) {
  frontEndApp.eslint.addRules({ ...eslintGlobalRules });
  frontEndApp.eslint.addExtends(
    '@nuxtjs/eslint-config-typescript',
    'plugin:prettier/recommended',
    'plugin:vue/vue3-recommended',
  );
  frontEndApp.eslint.addPlugins('eslint-plugin-vue', 'prettier', 'vue');
}

new PnpmWorkspace(root);
new VscodeSettings(root);
new Nx(root);
new Husky(root);
new GithubActionsCICDRelease(root, { environment: 'quality', pnpmVersion: pnpmVersion });
new GithubActionsCICDRelease(root, { environment: 'sandbox', pnpmVersion: pnpmVersion, onPushBranch: 'infra/*' });

// Provision templated project folders structure with README.md descriptions.
setupProjectFolders(root);

root.package.addField('packageManager', `pnpm@${pnpmVersion}`);
root.gitignore.addPatterns(
  '*.bkp',
  '*.dtmp',
  '.env',
  '.env.*',
  '.idea',
  '.DS_Store',
  'test-reports/*',
  '.nuxt',
  '.output',
  'dist',
  'config/easy-genomics.yaml',
  'packages/back-end/cdk.context.json',
);
root.synth();
