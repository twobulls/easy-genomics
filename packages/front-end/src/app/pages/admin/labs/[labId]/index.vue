<script setup lang="ts">
  const $route = useRoute();

  const labId = $route.params.labId as string;
  const initialTab = $route.params.tab as string;
</script>

<template>
  <EGLabView :lab-id="labId" :initial-tab="initialTab" />
</template>
