<script setup lang="ts">
  const routeKey = ref(0);

  const { $api } = useNuxtApp();
  const { setCurrentUserOrg } = useUser($api);
  const hasInit = ref(false);

  onBeforeMount(async () => {
    await init();
  });

  /**
   * @description Initialize the app for authed users; set the current user's organization with
   * future scope to add user display details (name, email, etc.)
   */
  async function init() {
    await setCurrentUserOrg();
    hasInit.value = true;
  }

  watch(routeKey, () => {
    routeKey.value++;
  });
</script>

<template>
  <EGToasts class="top-[70px]" />
  <EGHeader :is-authed="true" key="routeKey" />
  <main class="mx-auto mt-12 px-4">
    <slot v-if="hasInit" />
  </main>
</template>

<style scoped lang="scss">
  main {
    max-width: var(--max-page-container-width-px);
  }
</style>
