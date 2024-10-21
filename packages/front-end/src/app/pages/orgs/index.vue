<script setup lang="ts">
  const $router = useRouter();

  if (!useUserStore().canManageOrgs()) {
    $router.push({ path: '/' });
  }
</script>

<template>
  <EGOrgsList :superuser="false" />
</template>
