// https://nuxt.com/docs/api/configuration/nuxt-config
import IconsResolver from 'unplugin-icons/resolver';
import Icons from 'unplugin-icons/vite';
import Components from 'unplugin-vue-components/vite';

export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: false,
  modules: ['@nuxt/ui'],
  srcDir: 'src/app/',
  css: ['@/styles/main.scss'],
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
      AWS_USER_POOL_ID: process.env.AWS_USER_POOL_ID,
      AWS_CLIENT_ID: process.env.AWS_CLIENT_ID,
      BASE_API_URL: process.env.BASE_API_URL,
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
        isCustomElement: (tag) => tag.startsWith('Icon-'),
      },
    },
  },
});
