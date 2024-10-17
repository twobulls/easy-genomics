<script setup lang="ts">
  const $router = useRouter();
  const $route = useRoute();

  // require superuser for admin page
  if (!useUserStore().isSuperuser) {
    $router.push('/');
  }

  const orgId = $route.params.orgId;
</script>

<template>
  <EGAdminAlert />

  <EGOrgView admin :org-id="orgId" />
</template>
