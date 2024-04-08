// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: false,
  modules: ['@nuxt/ui'],
  srcDir: 'src/app/',
  css: ['@/styles/main.scss'],
  runtimeConfig: {
    public: {
      AWS_REGION: process.env.AWS_REGION,
      AWS_USER_POOL_ID: process.env.AWS_USER_POOL_ID,
      AWS_CLIENT_ID: process.env.AWS_CLIENT_ID,
      BASE_API_URL: process.env.BASE_API_URL,
    },
  },
  vite: {
    define: {
      'window.global': {}, // required by Amplify
    },
  },
});
