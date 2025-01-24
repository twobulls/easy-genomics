<script setup lang="ts">
  import { WipOmicsRunData } from '@FE/stores/run';
  import { WorkflowListItem as OmicsWorkflow } from '@aws-sdk/client-omics';

  const props = defineProps<{
    workflowId: string;
  }>();
  const emit = defineEmits(['next-step', 'previous-step', 'step-validated']);

  const $route = useRoute();
  const runStore = useRunStore();
  const omicsWorkflowsStore = useOmicsWorkflowsStore();

  const labId = $route.params.labId as string;
  const omicsRunTempId = $route.query.omicsRunTempId as string;

  const wipOmicsRun = computed<WipOmicsRunData | undefined>(() => runStore.wipOmicsRuns[omicsRunTempId]);

  const workflow = computed<OmicsWorkflow | null>(() => omicsWorkflowsStore.workflows[props.workflowId] ?? null);
</script>

<template>
  <EGRunFormUploadData
    :lab-id="labId"
    :sample-sheet-s3-url="wipOmicsRun.sampleSheetS3Url"
    :pipeline-or-workflow-name="workflow.name"
    :run-name="wipOmicsRun.runName"
    :transaction-id="wipOmicsRun.transactionId"
    :wip-run-update-function="runStore.updateWipOmicsRun"
    :wip-run-temp-id="omicsRunTempId"
    @next-step="emit('next-step')"
    @previous-step="emit('previous-step')"
    @step-validated="emit('step-validated')"
  />
</template>
