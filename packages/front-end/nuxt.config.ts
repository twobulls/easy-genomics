// https://nuxt.com/docs/api/configuration/nuxt-config
import path from 'path';
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
  experimental: {
    watcher: 'parcel', // 'chokidar' or 'parcel' are also options
  },
  modules: ['@nuxt/ui', '@pinia/nuxt', '@pinia/nuxt', 'pinia-plugin-persistedstate/nuxt', '@vueuse/nuxt', '@nuxt/icon'],
  srcDir: 'src/app/',
  css: ['@/styles/main.scss'],
  ssr: false,

  build: {
    loaders: {
      scss: {
        // Replace additionalData with the new syntax
        additionalData: '@use "@/styles/helpers" as *;', // Update this to match your @use import
      },
    },
  },

  // Nuxt Icon Options
  icon: {
    resolver: 'local',
    clientBundle: {
      scan: true,
      collections: ['heroicons'], // Changed from object to array
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

  piniaPluginPersistedstate: {
    storage: 'localStorage',
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
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@/styles/helpers" as *;',
        },
      },
    },
    plugins: [],
  },

  compatibilityDate: '2024-07-26',
});
