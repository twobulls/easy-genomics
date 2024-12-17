<script setup lang="ts">
  const $router = useRouter();
  const $route = useRoute();

  if (!useUserStore().canManageOrgs()) {
    $router.push({ path: '/' });
  }
</script>

<template>
  <EGUserAccess :org-id="$route.params.orgId" :user-id="$route.params.userId" />
</template>

<style scoped></style>
