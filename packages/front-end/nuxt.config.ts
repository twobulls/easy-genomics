// https://nuxt.com/docs/api/configuration/nuxt-config
import { join } from 'path';
import { ConfigurationSettings } from '@easy-genomics/shared-lib/src/app/types/configuration';
import {
  findConfiguration,
  getStackEnvName,
  loadConfigurations,
} from '@easy-genomics/shared-lib/src/app/utils/configuration';
import IconsResolver from 'unplugin-icons/resolver';
import Icons from 'unplugin-icons/vite';
import Components from 'unplugin-vue-components/vite';

let awsRegion: string | undefined;
let awsApiGatewayUrl: string | undefined;
let awsCognitoUserPoolId: string | undefined;
let awsCognitoUserPoolClientId: string | undefined;

if (process.env.CI_CD === 'true') {
  console.log('Loading Front-End Nuxt environment settings for CI/CD Pipeline...');

  // CI/CD Pipeline uses ENV parameters
  awsRegion = process.env.AWS_REGION;
  awsApiGatewayUrl = process.env.AWS_API_GATEWAY_URL;
  awsCognitoUserPoolId = process.env.AWS_COGNITO_USER_POOL_ID;
  awsCognitoUserPoolClientId = process.env.AWS_COGNITO_CLIENT_ID;
} else {
  console.log('Loading Front-End Nuxt easy-genomics.yaml settings...');

  // Load configuration settings for each environment
  const configurations: { [p: string]: ConfigurationSettings }[] = loadConfigurations(
    join(__dirname, '../../config/easy-genomics.yaml'),
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
  awsApiGatewayUrl = configSettings['front-end']['aws-api-gateway-url'];
  awsCognitoUserPoolId = configSettings['front-end']['aws-cognito-user-pool-id'];
  awsCognitoUserPoolClientId = configSettings['front-end']['aws-cognito-user-pool-client-id'];
}

// @ts-ignore
export default defineNuxtConfig({
  colorMode: {
    preference: 'light',
  },

  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@pinia/nuxt', '@pinia/nuxt', '@pinia-plugin-persistedstate/nuxt'],
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
      BASE_API_URL: awsApiGatewayUrl.replace(/\/+$/, ''), // Remove trailing slashes
      ENV_TYPE: process.env.envType || 'dev',
      GITHUB_RUN_NUMBER: process.env.GITHUB_RUN_NUMBER || 'Unknown',
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

  compatibilityDate: '2024-07-26',
});
