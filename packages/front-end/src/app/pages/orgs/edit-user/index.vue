<script setup lang="ts">
  const $router = useRouter();

  if (!useUserStore().canManageOrgs()) {
    $router.push({ path: '/' });
  }
</script>

<template>
  <EGUserAccess />
</template>

<style scoped></style>
