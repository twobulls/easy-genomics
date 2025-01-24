<script setup lang="ts">
  import { WorkflowListItem as OmicsWorkflow } from '@aws-sdk/client-omics';

  const emit = defineEmits(['next-step', 'step-validated']);
  const props = defineProps<{
    workflowId: string;
  }>();

  const $route = useRoute();
  const runStore = useRunStore();
  const omicsWorkflowsStore = useOmicsWorkflowsStore();

  const omicsRunTempId = $route.query.omicsRunTempId as string;

  const wipOmicsRun = computed<WipOmicsRunData | undefined>(() => runStore.wipOmicsRuns[omicsRunTempId]);
  const workflow = computed<OmicsWorkflow | undefined>(() => omicsWorkflowsStore.workflows[props.workflowId]);
</script>

<template>
  <EGRunFormRunDetails
    pipeline-or-workflow="Workflow"
    :pipeline-or-workflow-name="workflow?.name"
    :initial-run-name="wipOmicsRun?.runName || ''"
    :pipeline-or-workflow-description="workflow?.description || ''"
    :wip-run-update-function="runStore.updateWipOmicsRun"
    :wip-run-temp-id="omicsRunTempId"
    @next-step="emit('next-step')"
    @step-validated="emit('step-validated')"
  />
</template>
