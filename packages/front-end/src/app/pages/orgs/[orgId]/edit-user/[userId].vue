<script setup lang="ts">
  // TODO: this should have the org id as a url param
  const $router = useRouter();

  if (!useUserStore().canManageOrgs()) {
    $router.push({ path: '/' });
  }
</script>

<template>
  <EGUserAccess :org-admin="useUserStore().isOrgAdmin()" />
</template>

<style scoped></style>
