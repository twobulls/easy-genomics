<script setup lang="ts">
  const routeKey = ref(0);

  const { $api } = useNuxtApp();
  const { setUserOrg } = useAuth($api);

  onBeforeMount(async () => {
    await init();
  });

  /**
   * @description Initialize the app for authed users
   */
  async function init() {
    await setUserOrg();
  }

  watch(routeKey, () => {
    routeKey.value++;
  });
</script>

<template>
  <EGToasts class="top-[70px]" />
  <EGHeader :is-authed="true" key="routeKey" />
  <main class="mx-auto mt-12 px-4">
    <slot />
  </main>
</template>

<style scoped lang="scss">
  main {
    max-width: var(--max-page-container-width-px);
  }
</style>
