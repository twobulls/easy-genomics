// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@nuxtjs/tailwindcss'],
  srcDir: 'src/app/',
  tailwindcss: {
    // cssPath: ['~/assets/css/tailwind.css', { injectionPosition: 'last' }],
  },
});
