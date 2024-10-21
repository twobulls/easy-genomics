<script setup lang="ts">
  const $route = useRoute();
</script>

<template>
  <EGLabView :lab-id="$route.params.labId" :initial-tab="$route.query.tab" />
</template>
