<script setup lang="ts">
  const $route = useRoute();

  const orgId = $route.params.orgId;
</script>

<template>
  <EGOrgView :org-id="orgId" superuser />
</template>
