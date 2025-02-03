<script setup lang="ts">
  const $router = useRouter();

  if (!useUserStore().canManageAnyOrgs()) {
    $router.push({ path: '/' });
  }
</script>

<template>
  <EGOrgsList @click-org="(org) => $router.push({ path: '/orgs/' + org.OrganizationId })" />
</template>
