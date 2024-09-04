// https://nuxt.com/docs/api/configuration/nuxt-config
import path from 'path';
import IconsResolver from 'unplugin-icons/resolver';
import Icons from 'unplugin-icons/vite';
import Components from 'unplugin-vue-components/vite';
import { loadNuxtSettings } from './env.nuxt.config';

// Loads the Nuxt Settings from ../../config/env.nuxt file
loadNuxtSettings();

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
      AWS_REGION: process.env.AWS_REGION,
      AWS_USER_POOL_ID: process.env.AWS_COGNITO_USER_POOL_ID,
      AWS_CLIENT_ID: process.env.AWS_COGNITO_USER_POOL_CLIENT_ID,
      BASE_API_URL: process.env.AWS_API_GATEWAY_URL?.replace(/\/+$/, ''), // Remove trailing slashes
      ENV_TYPE: process.env.ENV_TYPE || 'dev',
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
