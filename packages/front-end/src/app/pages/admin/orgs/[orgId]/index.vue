<script setup lang="ts">
  const $route = useRoute();

  const orgId = $route.params.orgId;
</script>

<template>
  <EGOrgView admin :org-id="orgId" />
</template>
