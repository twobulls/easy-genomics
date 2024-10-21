<script setup lang="ts">
  const $route = useRoute();

  const orgId = $route.params.orgId;
</script>

<template>
  <EGAdminAlert />

  <EGOrgView :org-id="orgId" />
</template>
