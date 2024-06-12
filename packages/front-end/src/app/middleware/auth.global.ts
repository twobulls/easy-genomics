import { defineNuxtRouteMiddleware } from '#app';
import { Auth } from 'aws-amplify';

/**
 * @description Check auth status on every route change and redirect to signIn page if not authenticated
 */
export default defineNuxtRouteMiddleware(async (context) => {
  if (context.fullPath !== '/forgot-password') {
    try {
      const user = await Auth.currentAuthenticatedUser();

      if (user && context.fullPath === '/sign-in') {
        return navigateTo('/labs');
      }
      if (!user && context.fullPath !== '/sign-in') {
        // if (!user && ['/sign-in', '/forgot-password'].includes(context.fullPath)) {
        return navigateTo('/sign-in');
      }
    } catch (e) {
      if (context.fullPath !== '/sign-in') {
        return navigateTo('/sign-in');
      }
    }
  }
});
