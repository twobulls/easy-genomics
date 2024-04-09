import { Amplify, Auth } from 'aws-amplify';
import { useRuntimeConfig } from 'nuxt/app';

export default defineNuxtPlugin(() => {
  const { AWS_REGION, AWS_IDENTITY_POOL_ID, AWS_USER_POOL_ID, AWS_CLIENT_ID } = useRuntimeConfig().public;

  Amplify.configure({
    Auth: {
      region: AWS_REGION,
      identityPoolId: AWS_IDENTITY_POOL_ID,
      userPoolId: AWS_USER_POOL_ID,
      userPoolWebClientId: AWS_CLIENT_ID,
    },
  });

  return {
    provide: {
      auth: Auth,
    },
  };
});
