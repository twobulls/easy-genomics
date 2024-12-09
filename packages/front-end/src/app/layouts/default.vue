<script setup lang="ts">
  const routeKey = ref(0);

  const { $api } = useNuxtApp();
  const { setCurrentUserDataFromToken } = useUser($api);
  const hasInit = ref(false);

  /**
   * @description Initialize the app for authed users; set the current user's organization with
   * future scope to add user display details (name, email, etc.)
   */
  onBeforeMount(async () => {
    await setCurrentUserDataFromToken();
    hasInit.value = true;
  });

  watch(routeKey, () => {
    routeKey.value++;
  });
</script>

<template>
  <EGToasts class="top-[70px]" />
  <EGHeader :is-authed="true" key="routeKey" />
  <main class="mx-auto mb-4 mt-6 px-4">
    <slot v-if="hasInit" />
  </main>
</template>

<style scoped lang="scss">
  main {
    max-width: var(--max-page-container-width-px);
  }
</style>
