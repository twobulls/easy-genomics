<script setup lang="ts">
  const $router = useRouter();

  if (!useUserStore().canManageOrgs()) {
    $router.push({ path: '/' });
  }
</script>

<template>
  <EGUserAccess :org-admin="useUserStore().isOrgAdmin()" />
</template>

<style scoped></style>
