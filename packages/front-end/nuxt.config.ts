// https://nuxt.com/docs/api/configuration/nuxt-config
import IconsResolver from 'unplugin-icons/resolver';
import Icons from 'unplugin-icons/vite';
import Components from 'unplugin-vue-components/vite';
import { ConfigurationSettings } from '@easy-genomics/shared-lib/src/app/types/configuration';
import { loadConfigurations } from '@easy-genomics/shared-lib/src/app/utils/configuration';
import { join } from 'path';

if (process.argv.length !== 5 || process.argv[3] !== '--stack' || process.argv[4].trim() === '') {
  throw new Error('NuxtConfig Setup Error: Missing required arguments --stack {env-name}');
}
const stackName: string = process.argv[4].trim();

// Load configuration settings for each environment
const configurations: { [p: string]: ConfigurationSettings }[] = loadConfigurations(
  join(__dirname, '../../config/easy-genomics.yaml')
);
if (configurations.length === 0) {
  throw new Error('Easy Genomics Configuration(s) missing / invalid');
}

const configuration: { [p: string]: ConfigurationSettings } | undefined = configurations
  .filter((c: { [p: string]: ConfigurationSettings }) => Object.keys(c).shift() === stackName)
  .shift();
if (!configuration) {
  throw new Error(`Easy Genomics Configuration Settings for "${stackName}" stack not found`);
}

const envName: string | undefined = Object.keys(configuration).shift();
const configSettings: ConfigurationSettings | undefined = Object.values(configuration).shift();

if (!envName || !configSettings) {
  throw new Error(`Easy Genomics Configuration Settings for "${stackName}" stack undefined`);
}

export default defineNuxtConfig({
  colorMode: {
    preference: 'light',
  },

  devtools: { enabled: true },

  modules: ['@nuxt/ui'],

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
      AWS_REGION: configSettings['aws-region'],
      AWS_USER_POOL_ID: configSettings['front-end']['aws-cognito-user-pool-id'],
      AWS_CLIENT_ID: configSettings['front-end']['aws-cognito-client-id'],
      BASE_API_URL: configSettings['front-end']['base-api-url'],
      MOCK_ORG_ID: configSettings['front-end']['mock-org-id'],
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
