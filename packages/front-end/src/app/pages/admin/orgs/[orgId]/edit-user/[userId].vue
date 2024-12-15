<script setup lang="ts">
  const $route = useRoute();

  const orgId = $route.params.orgId;
  const userId = $route.params.userId;
</script>

<template>
  <EGUserAccess :org-id="orgId" :user-id="userId" />
</template>
