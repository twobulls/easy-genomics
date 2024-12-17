<script setup lang="ts">
  const $route = useRoute();
</script>

<template>
  <EGUserAccess :org-id="$route.params.orgId" :user-id="$route.params.userId" :org-admin="false" />
</template>
