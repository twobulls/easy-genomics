<script setup lang="ts">
  const $router = useRouter();
  const $route = useRoute();

  const orgId = $route.params.orgId as string;
  const userId = $route.params.userId as string;

  if (!useUserStore().canManageOrg(orgId)) {
    $router.push({ path: '/' });
  }
</script>

<template>
  <EGUserAccess :org-id="orgId" :user-id="userId" />
</template>

<style scoped></style>
