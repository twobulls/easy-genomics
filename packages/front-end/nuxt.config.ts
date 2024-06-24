// https://nuxt.com/docs/api/configuration/nuxt-config
import IconsResolver from 'unplugin-icons/resolver';
import Icons from 'unplugin-icons/vite';
import Components from 'unplugin-vue-components/vite';

import { envConfig } from './config/env-config';

let awsRegion;
let awsCognitoUserPoolId;
let awsCognitoUserPoolClientId;
let awsBaseApiUrl;
let mockOrgId;

if (envConfig) {
  awsRegion = envConfig['aws-region'];
  awsCognitoUserPoolId = envConfig['front-end']['aws-cognito-user-pool-id'];
  awsCognitoUserPoolClientId = envConfig['front-end']['aws-cognito-client-id'];
  awsBaseApiUrl = envConfig['front-end']['base-api-url'];
  mockOrgId = envConfig['front-end']['mock-org-id']; // TODO: Remove once custom User Authorization logic retrieves OrgIds
} else {
  // Handle the error. Throw an exception or use default values, for example:
  throw Error('Configuration is undefined. Please ensure that the configuration is correctly setup.');
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
      BASE_API_URL: awsBaseApiUrl,
      ENV_TYPE: process.env.envType || 'dev',
      GITHUB_RUN_NUMBER: process.env.GITHUB_RUN_NUMBER || 'Unknown',
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
