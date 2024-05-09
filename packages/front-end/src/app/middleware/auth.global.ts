import { defineNuxtRouteMiddleware } from '#app';
import { Auth } from 'aws-amplify';

/**
 * @description Check auth status on every route change and redirect to login page if not authenticated
 */
export default defineNuxtRouteMiddleware(async (context) => {
  try {
    const user = await Auth.currentAuthenticatedUser();
    if (user && context.fullPath === '/login') {
      return navigateTo('/labs');
    }
    if (!user && context.fullPath !== '/login') {
      return navigateTo('/login');
    }
  } catch (e) {
    if (context.fullPath !== '/login') {
      return navigateTo('/login');
    }
  }
});
