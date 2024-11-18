<script setup lang="ts">
  const $router = useRouter();
  const $route = useRoute();

  if (!useUserStore().canManageOrgs(useUserStore().currentOrgId)) {
    $router.push({ path: '/' });
  }

  const orgId = $route.params.orgId;
</script>

<template>
  <EGOrgView :org-id="orgId" />
</template>
