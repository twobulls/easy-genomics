// https://nuxt.com/docs/api/configuration/nuxt-config
import IconsResolver from 'unplugin-icons/resolver';
import Icons from 'unplugin-icons/vite';
import Components from 'unplugin-vue-components/vite';
import { ConfigurationSettings } from '@easy-genomics/shared-lib/src/app/types/configuration';
import {
  findConfiguration,
  getStackEnvName,
  loadConfigurations,
} from '@easy-genomics/shared-lib/src/app/utils/configuration';
import { join } from 'path';

let awsRegion: string | undefined;
let awsCognitoUserPoolId: string | undefined;
let awsCognitoUserPoolClientId: string | undefined;
let awsBaseApiUrl: string | undefined;
let mockOrgId: string | undefined; // TODO: Remove once custom User Authorization logic retrieves OrgIds

if (process.env.CI_CD === 'true') {
  console.log('Loading Front-End Nuxt environment settings for CI/CD Pipeline...');

  // CI/CD Pipeline uses ENV parameters
  awsRegion = process.env.AWS_REGION;
  awsCognitoUserPoolId = process.env.AWS_COGNITO_USER_POOL_ID;
  awsCognitoUserPoolClientId = process.env.AWS_COGNITO_CLIENT_ID;
  awsBaseApiUrl = process.env.AWS_BASE_API_URL;
  mockOrgId = process.env.MOCK_ORG_ID; // TODO: Remove once custom User Authorization logic retrieves OrgIds
} else {
  console.log('Loading Front-End Nuxt easy-genomics.yaml settings...');

  // Load configuration settings for each environment
  const configurations: { [p: string]: ConfigurationSettings }[] = loadConfigurations(
    join(__dirname, '../../config/easy-genomics.yaml')
  );
  if (configurations.length === 0) {
    throw new Error('Easy Genomics Configuration(s) missing / invalid, please update: easy-genomics.yaml');
  }

  // Try to retrieve optional command argument: --stack {env-name}
  const STACK_ENV_NAME: string | undefined = getStackEnvName();
  if (configurations.length > 1 && !STACK_ENV_NAME) {
    throw new Error('Multiple configurations found in easy-genomics.yaml, please specify argument: --stack {env-name}');
  }

  const configuration: { [p: string]: ConfigurationSettings } =
    configurations.length > 1 ? findConfiguration(STACK_ENV_NAME!, configurations) : configurations.shift()!;
  const configSettings = Object.values(configuration).shift();
  if (!configSettings) {
    throw new Error('Easy Genomics Configuration(s) missing / invalid, please update: easy-genomics.yaml');
  }

  awsRegion = configSettings['aws-region'];
  awsCognitoUserPoolId = configSettings['front-end']['aws-cognito-user-pool-id'];
  awsCognitoUserPoolClientId = configSettings['front-end']['aws-cognito-client-id'];
  awsBaseApiUrl = configSettings['front-end']['base-api-url'];
  mockOrgId = configSettings['front-end']['mock-org-id']; // TODO: Remove once custom User Authorization logic retrieves OrgIds
}

// @ts-ignore
export default defineNuxtConfig({
  colorMode: {
    preference: 'light',
  },

  devtools: { enabled: true },

  modules: ['@nuxt/ui', '@pinia/nuxt'],

  srcDir: 'src/app/',

  css: ['@/styles/main.scss'],

  ssr: false,

  build: {
    loaders: {
      scss: {
        additionalData: '@import "@/styles/helpers.scss";', // FIXME
      },
    },
  },

  runtimeConfig: {
    public: {
      AWS_REGION: awsRegion,
      AWS_USER_POOL_ID: awsCognitoUserPoolId,
      AWS_CLIENT_ID: awsCognitoUserPoolClientId,
      BASE_API_URL: awsBaseApiUrl,
      MOCK_ORG_ID: mockOrgId, // TODO: Remove once custom User Authorization logic retrieves OrgIds
    },
  },

  vite: {
    define: {
      'window.global': {}, // required by Amplify
    },
    plugins: [
      Components({
        resolvers: [IconsResolver({ prefix: 'Icon' })],
      }),
      Icons({
        scale: 1.2,
      }),
    ],
  },

  // autoimport Iconfiy icon packages as custom components
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag: string) => tag.startsWith('Icon-'),
      },
    },
  },
});
