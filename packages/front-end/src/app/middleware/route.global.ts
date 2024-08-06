import { defineNuxtRouteMiddleware } from '#app';

export default defineNuxtRouteMiddleware((to, from) => {
  const uiStore = useUiStore();

  // bypass if tab query param is present in both routes to preserve the "page back" behaviour
  if (to.query && 'tab' in to.query && from.query && 'tab' in from.query) {
    return;
  }

  uiStore.setPreviousPageRoute(from.fullPath);
});
