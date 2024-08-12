import { defineNuxtRouteMiddleware } from '#app';

export default defineNuxtRouteMiddleware((to, from) => {
  const uiStore = useUiStore();

  // bypass if tab query param is present in both routes to preserve the "page back" behaviour
  if (to.query && 'tab' in to.query && from.query && 'tab' in from.query) {
    return;
  }

  // Only set previous route if navigating away from the current page
  if (to.path !== from.path) {
    uiStore.setPreviousPageRoute(from.fullPath);
  }
});
