<script setup lang="ts">
  const $router = useRouter();

  if (!useUserStore().canManageOrgs()) {
    $router.push({ path: '/' });
  }
</script>

<template>
  <EGOrgsList :superuser="false" @click-org="(org) => $router.push({ path: '/orgs/' + org.OrganizationId })" />
</template>
