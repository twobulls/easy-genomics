<script setup lang="ts">
  const $route = useRoute();

  const orgId = computed<string | null>(() => ($route.query.orgId as string) ?? null);
</script>

<template>
  <EGAdminAlert />

  <EGLabsList
    v-if="orgId === null"
    superuser
    @click-org="(org) => $router.push({ path: '/labs', query: { orgId: org.OrganizationId } })"
  />

  <EGLabsList v-if="orgId !== null" superuser :org-id="orgId" />
</template>
