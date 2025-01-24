<script setup lang="ts">
  import { WipSeqeraRunData } from '@FE/stores/run';
  import { Pipeline as SeqeraPipeline } from '@easy-genomics/shared-lib/src/app/types/nf-tower/nextflow-tower-api';

  const props = defineProps<{
    pipelineId: string;
  }>();
  const emit = defineEmits(['next-step', 'previous-step', 'step-validated']);

  const $route = useRoute();
  const runStore = useRunStore();
  const seqeraPipelinesStore = useSeqeraPipelinesStore();

  const labId = $route.params.labId as string;
  const seqeraRunTempId = $route.query.seqeraRunTempId as string;

  const wipSeqeraRun = computed<WipSeqeraRunData | undefined>(() => runStore.wipSeqeraRuns[seqeraRunTempId]);

  const pipeline = computed<SeqeraPipeline | null>(() => seqeraPipelinesStore.pipelines[props.pipelineId] ?? null);
</script>

<template>
  <EGRunFormUploadData
    :lab-id="labId"
    :sample-sheet-s3-url="wipSeqeraRun.sampleSheetS3Url"
    :pipeline-or-workflow-name="pipeline.name"
    :run-name="wipSeqeraRun.userPipelineRunName"
    :transaction-id="wipSeqeraRun.transactionId"
    :wip-run-update-function="runStore.updateWipSeqeraRun"
    :wip-run-temp-id="seqeraRunTempId"
    @next-step="emit('next-step')"
    @previous-step="emit('previous-step')"
    @step-validated="emit('step-validated')"
  />
</template>
