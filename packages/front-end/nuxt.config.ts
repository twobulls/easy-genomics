// https://nuxt.com/docs/api/configuration/nuxt-config
import path from 'path';
import IconsResolver from 'unplugin-icons/resolver';
import Icons from 'unplugin-icons/vite';
import Components from 'unplugin-vue-components/vite';
import * as dotenv from 'dotenv';

/**
 * Read the following environmental variables from {easy-genomics root dir}/config/.env.nuxt file.
 */
dotenv.config({
  path: '../../config/.env.nuxt',
});

const awsRegion: string | undefined = process.env.AWS_REGION;
const envType: string | undefined = process.env.ENV_TYPE;
const awsApiGatewayUrl: string | undefined = process.env.AWS_API_GATEWAY_URL;
const awsCognitoUserPoolId: string | undefined = process.env.AWS_COGNITO_USER_POOL_ID;
const awsCognitoUserPoolClientId: string | undefined = process.env.AWS_COGNITO_USER_POOL_CLIENT_ID;

if (
  process.env.npm_lifecycle_script === 'nuxt dev' ||
  process.env.npm_lifecycle_script === 'nuxt generate' ||
  process.env.npm_lifecycle_script === 'nuxt build'
) {
  if (!awsRegion) {
    throw new Error('AWS_REGION undefined, please check the environment configuration');
  }
  if (!envType) {
    throw new Error('ENV_TYPE undefined, please check the environment configuration');
  }
  if (!awsApiGatewayUrl) {
    throw new Error('AWS_API_GATEWAY_URL undefined, please check the environment configuration');
  }
  if (!awsCognitoUserPoolId) {
    throw new Error('AWS_COGNITO_USER_POOL_ID undefined, please check the environment configuration');
  }
  if (!awsCognitoUserPoolClientId) {
    throw new Error('AWS_COGNITO_USER_POOL_CLIENT_ID undefined, please check the environment configuration');
  }
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
      BASE_API_URL: awsApiGatewayUrl?.replace(/\/+$/, ''), // Remove trailing slashes
      ENV_TYPE: envType || 'dev',
      GITHUB_RUN_NUMBER: process.env.GITHUB_RUN_NUMBER || 'Unknown',
    },
  },

  vite: {
    define: {
      'window.global': {}, // required by Amplify
    },
    resolve: {
      alias: {
        '@FE': path.resolve(__dirname, './src/app'),
      },
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
