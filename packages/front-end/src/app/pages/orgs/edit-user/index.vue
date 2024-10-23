<script setup lang="ts">
  const $router = useRouter();

  if (!useUserStore().canManageOrgs()) {
    $router.push({ path: '/' });
  }
</script>

<template>
  <EGUserAccess :org-admin="useUserStore().isOrgAdmin(useUserStore().currentOrgId)" />
</template>

<style scoped></style>
