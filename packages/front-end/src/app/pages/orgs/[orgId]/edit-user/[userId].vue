<script setup lang="ts">
  const $router = useRouter();
  const $route = useRoute();

  if (!useUserStore().canManageOrgs()) {
    $router.push({ path: '/' });
  }

  const orgId = $route.params.orgId;
  const userId = $route.params.userId;
</script>

<template>
  <EGUserAccess :org-id="orgId" :user-id="userId" />
</template>

<style scoped></style>
