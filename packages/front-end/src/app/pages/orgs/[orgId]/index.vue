<script setup lang="ts">
  const $router = useRouter();
  const $route = useRoute();

  const userStore = useUserStore();

  const orgId = $route.params.orgId as string;

  if (!userStore.canManageOrg(orgId)) {
    $router.push({ path: '/' });
  }
</script>

<template>
  <EGOrgView :org-id="orgId" :org-admin="userStore.isOrgAdminForOrg(orgId)" />
</template>
