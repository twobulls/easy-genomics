<script setup lang="ts">
  // TODO: this should have the org id as a url param
  const $router = useRouter();

  if (!useUserStore().canManageOrgs()) {
    $router.push({ path: '/' });
  }
</script>

<template>
  <EGUserAccess />
</template>

<style scoped></style>
