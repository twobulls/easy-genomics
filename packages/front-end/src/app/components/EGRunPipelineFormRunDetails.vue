<script setup lang="ts">
  import { Pipeline as SeqeraPipeline } from '@easy-genomics/shared-lib/src/app/types/nf-tower/nextflow-tower-api';

  const emit = defineEmits(['next-step', 'step-validated']);
  const props = defineProps<{
    pipelineId: string;
  }>();

  const $route = useRoute();
  const runStore = useRunStore();
  const seqeraPipelineStore = useSeqeraPipelinesStore();

  const seqeraRunTempId = $route.query.seqeraRunTempId as string;

  const wipSeqeraRun = computed<WipSeqeraRunData | undefined>(() => runStore.wipSeqeraRuns[seqeraRunTempId]);
  const pipeline = computed<SeqeraPipeline | undefined>(() => seqeraPipelineStore.pipelines[props.pipelineId]);
</script>

<template>
  <EGRunFormRunDetails
    pipeline-or-workflow="Pipeline"
    :pipeline-or-workflow-name="pipeline?.name"
    :initial-run-name="wipSeqeraRun?.runName || ''"
    :pipeline-or-workflow-description="pipeline?.description"
    :wip-run-update-function="runStore.updateWipSeqeraRun"
    :wip-run-temp-id="seqeraRunTempId"
    @next-step="emit('next-step')"
    @step-validated="emit('step-validated')"
  />
</template>
