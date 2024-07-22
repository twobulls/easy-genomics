<script setup lang="ts">
  import { usePipelineRunStore } from '~/stores';
  const labName = usePipelineRunStore().labName;
</script>

<template>
  <EGPageHeader title="Run Pipeline" :description="labName">
    <!-- TODO: wire up Cancel Job -->
    <!--    <EGButton variant="secondary" label="Cancel job" @click="() => {}" />-->
  </EGPageHeader>
  <EGRunPipelineStepper />
</template>
