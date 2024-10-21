<script setup lang="ts">
  const $route = useRoute();

  const orgId = computed<string | null>(() => ($route.query.orgId as string) ?? null);
</script>

<template>
  <EGOrgsList v-if="orgId === null" superuser />

  <EGLabsList v-if="orgId !== null" superuser :org-id="orgId" />
</template>
