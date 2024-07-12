<script setup lang="ts">
  const $route = useRoute();
  const labName = $route.query.labName;
</script>

<template>
  <EGPageHeader title="Run Pipeline" :description="labName" />
  <EGRunPipelineStepper />
</template>
