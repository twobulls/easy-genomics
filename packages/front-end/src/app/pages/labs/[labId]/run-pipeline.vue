<script setup lang="ts">
  import { usePipelineRunStore } from '~/stores';
  const labName = usePipelineRunStore().getLabName;
</script>

<template>
  <EGPageHeader title="Run Pipeline" :description="labName" />
  <EGRunPipelineStepper />
</template>
