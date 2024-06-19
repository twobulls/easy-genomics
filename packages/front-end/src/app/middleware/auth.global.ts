import { defineNuxtRouteMiddleware } from '#app';
import { Auth } from 'aws-amplify';
const baseURL = window.location.origin;

/**
 * @description Check auth status on every route change and redirect to signIn page if not authenticated
 */
export default defineNuxtRouteMiddleware(async (context) => {
  const url = new URL(context.fullPath, baseURL);

  if (url.pathname === '/reset-password') {
    const token = url.searchParams.get('forgot-password');

    // If the 'forgot-password' query parameter is missing or empty, redirect to '/'
    if (!token) {
      return navigateTo('/');
    }
  }

  if (!['/forgot-password', '/reset-password'].includes(url.pathname)) {
    try {
      const user = await Auth.currentAuthenticatedUser();

      if (user && url.pathname === '/signin') {
        return navigateTo('/labs');
      }
      if (!user && context.fullPath !== '/signin') {
        return navigateTo('/signin');
      }
    } catch (e) {
      if (context.fullPath !== '/signin') {
        return navigateTo('/signin');
      }
    }
  }
});
