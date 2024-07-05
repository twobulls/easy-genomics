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
const pnpmVersion = '9.4.0';
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
  });
  root.eslint.addPlugins('prettier');
  root.eslint.addExtends('plugin:prettier/recommended');
}
root.removeScript('build');
root.removeScript('deploy');
root.addScripts({
  // Development convenience scripts
  ['bootstrap-all']:
    'pnpm nx run-many --targets=bootstrap --projects=@easy-genomics/back-end,@easy-genomics/front-end --verbose',
  ['build-all']: 'pnpm run build-back-end && pnpm run build-front-end',
  ['deploy-all']: 'pnpm run deploy-back-end && pnpm run deploy-front-end',
  ['build-back-end']: 'pnpm nx run-many --targets=test,build --projects=@easy-genomics/back-end --verbose',
  ['build-front-end']:
    'pnpm nx run-many --targets=test,nuxt-prepare,build,nuxt-generate --projects=@easy-genomics/front-end --verbose',
  ['deploy-back-end']: 'pnpm nx run-many --targets=test,build,deploy --projects=@easy-genomics/back-end --verbose',
  ['deploy-front-end']:
    'pnpm nx run-many --targets=test,nuxt-prepare,build,nuxt-generate,deploy --projects=@easy-genomics/front-end --verbose',
  // CI/CD convenience scripts
  ['cicd-test-back-end']:
    'pnpm nx run-many --targets=cicd-test-back-end --projects=@easy-genomics/shared-lib,@easy-genomics/back-end --verbose',
  ['cicd-bootstrap-back-end']:
    'pnpm nx run-many --targets=cicd-bootstrap-back-end --project=@easy-genomics/back-end --verbose',
  ['cicd-build-deploy-back-end']:
    'pnpm nx run-many --targets=cicd-build-deploy-back-end --projects=@easy-genomics/shared-lib,@easy-genomics/back-end --verbose',
  ['cicd-test-front-end']:
    'pnpm nx run-many --targets=cicd-test-front-end --projects=@easy-genomics/front-end --verbose',
  ['cicd-bootstrap-front-end']:
    'pnpm nx run-many --targets=cicd-bootstrap-back-end --project=@easy-genomics/front-end --verbose',
  ['cicd-build-deploy-front-end']:
    'pnpm nx run-many --targets=cicd-build-deploy-front-end --projects=@easy-genomics/shared-lib,@easy-genomics/front-end --verbose',
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
    '@aws-sdk/types',
    '@aws-sdk/util-dynamodb',
    '@easy-genomics/shared-lib@workspace:*',
    'aws-lambda',
    'aws-sdk',
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
  ['bootstrap']: 'pnpm cdk bootstrap',
  ['cicd-test-back-end']: 'export CI_CD=true; pnpm run test',
  ['cicd-bootstrap-back-end']: 'export CI_CD=true; pnpm cdk bootstrap',
  ['cicd-build-deploy-back-end']: 'export CI_CD=true; pnpm cdk bootstrap; pnpm run build; pnpm run deploy',
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
    '@easy-genomics/shared-lib@workspace:*',
    '@nuxt/ui',
    '@pinia/nuxt',
    'aws-amplify@5.3.18',
    'aws-sdk',
    'class-variance-authority',
    'dotenv',
    'jwt-decode',
    'nuxt',
    'pinia',
    '@pinia-plugin-persistedstate/nuxt',
    'prettier-plugin-tailwindcss',
    'sass',
    'tailwindcss',
    'unplugin-icons',
    'unplugin-vue-components',
    'uuid',
    'zod',
    'lint-staged',
  ],
  devDeps: [
    '@aws-sdk/types',
    '@nuxtjs/eslint-config-typescript',
    '@typescript-eslint/parser',
    '@nuxt/types',
    '@types/node',
    '@types/uuid',
    'eslint-plugin-vue',
    'kill-port',
    'lint-staged',
    'vue-eslint-parser',
    'prettier',
    'eslint-plugin-prettier',
  ],
});
frontEndApp.addScripts({
  ['bootstrap']: 'pnpm cdk bootstrap',
  ['cicd-test-front-end']: 'export CI_CD=true; pnpm run test',
  ['cicd-bootstrap-front-end']: 'export CI_CD=true; pnpm cdk bootstrap',
  ['cicd-build-deploy-front-end']:
    'export CI_CD=true; pnpm run nuxt-prepare; pnpm run build; pnpm run nuxt-generate; pnpm run deploy',
  ['nuxt-build']: 'nuxt build',
  ['nuxt-dev']: 'pnpm kill-port 3000 && nuxt dev',
  ['nuxt-generate']: 'nuxt generate',
  ['nuxt-prepare']: 'nuxt prepare',
  ['nuxt-preview']: 'nuxt preview',
  ['nuxt-postinstall']: 'nuxt prepare',
  ['pre-commit']: 'lint-staged',
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
