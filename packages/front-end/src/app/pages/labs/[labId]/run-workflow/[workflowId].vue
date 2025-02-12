<script setup lang="ts">
  import { ReadWorkflow } from '@easy-genomics/shared-lib/src/app/types/aws-healthomics/aws-healthomics-api';
  import { useRunStore } from '@FE/stores';
  import { WipOmicsRunData } from '@FE/stores/run';
  import { ButtonVariantEnum } from '@FE/types/buttons';
  import { WorkflowParameter } from '@aws-sdk/client-omics';
  import { v4 as uuidv4 } from 'uuid';

  const { $api } = useNuxtApp();
  const $router = useRouter();
  const $route = useRoute();
  const runStore = useRunStore();
  const omicsWorkflowsStore = useOmicsWorkflowsStore();
  const uiStore = useUiStore();

  const labId = $route.params.labId as string;

  // check permissions to be on this page
  if (!useUserStore().canViewLab(labId)) {
    $router.push('/labs');
  }

  // set a new omicsRunTempId if not provided
  if (!$route.query.omicsRunTempId) {
    $router.push({ query: { omicsRunTempId: uuidv4() } });
  }

  const omicsRunTempId = computed<string>(() => $route.query.omicsRunTempId as string);

  const wipOmicsRun = computed<WipOmicsRunData | undefined>(() => runStore.wipOmicsRuns[omicsRunTempId.value]);

  const workflowId = $route.params.workflowId as string;

  const workflow = computed<ReadWorkflow | null>(() => omicsWorkflowsStore.workflows[workflowId]);

  const hasLaunched = ref<boolean>(false);
  const exitConfirmed = ref<boolean>(false);
  const nextRoute = ref<string | null>(null);

  const labName = computed<string>(() => useLabsStore().labs[labId].Name);

  const schema = computed<Record<string, WorkflowParameter> | null>(() => workflow.value?.parameterTemplate ?? null);

  const resetStepperKey = ref(0);

  const loading = computed<boolean>(() => uiStore.isRequestPending('loadOmicsWorkflow'));

  onBeforeMount(loadWorkflow);
  onMounted(initializeWorkflowData);

  /**
   * Intercept any navigation away from the page (including the browser back button) and present the modal
   */
  onBeforeRouteLeave((to, from, next) => {
    if (hasLaunched.value) {
      // if the pipeline has launched no need to confirm cancel
      next(true);
    } else if (!nextRoute.value) {
      // if there's currently no nextRoute, don't navigate yet and show the confirm cancel dialog
      nextRoute.value = to.path;
      next(false);
    } else if (!exitConfirmed.value) {
      // don't go if exit hasn't been confirmed
      next(false);
    } else {
      // go if exit confirmed
      next(true);
    }
  });

  async function loadWorkflow(): Promise<void> {
    // the store will contain the minimal workflow objects (only some basic fields, not everything) from the list call
    // this will overwrite the current workflow with the full workflow details for all the child components to use
    uiStore.setRequestPending('loadOmicsWorkflow');
    try {
      omicsWorkflowsStore.workflows[workflowId] = await $api.omicsWorkflows.get(labId, workflowId);
    } finally {
      uiStore.setRequestComplete('loadOmicsWorkflow');
    }
  }

  function confirmCancel() {
    exitConfirmed.value = true;
    delete runStore.wipOmicsRuns[omicsRunTempId.value];
    $router.push(nextRoute.value!);
  }

  /**
   * Reads the workflow details, schema, and parameters from the API and initializes the pipeline run store
   */
  async function initializeWorkflowData() {
    runStore.updateWipOmicsRun(omicsRunTempId.value, {
      laboratoryId: labId!,
      workflowId: workflowId!,
      workflowName: workflow.value?.name,
      transactionId: omicsRunTempId.value,
    });

    // initialize params if they aren't present already
    if (!runStore.wipOmicsRuns[omicsRunTempId.value].params) {
      runStore.updateWipOmicsRun(omicsRunTempId.value, {
        params: {},
      });
    }
  }

  /**
   * Resets the pipeline run:
   * - clears some store values
   * - re-initializes the schema + prefills params
   * - re-mounts the stepper to reset it to initial state
   */
  function resetRunPipeline() {
    $router.push({ query: { seqeraRunTempId: uuidv4() } });

    // without this short delay, initializeWorkflowData sets wip data for the old seqeraRunTempId, because the route
    // change doesn't complete in time
    setTimeout(() => {
      initializeWorkflowData();
      resetStepperKey.value++;
    }, 100);
  }
</script>

<template>
  <EGPageHeader
    title="Run Workflow"
    :description="labName"
    :show-back="!hasLaunched"
    :back-action="() => (nextRoute = `/labs/${labId}?tab=HealthOmics+Workflows`)"
    back-button-label="Exit Run"
  />

  <template v-if="loading">
    <EGLoadingSpinner />
  </template>

  <template v-else>
    <EGRunWorkflowStepper
      @has-launched="hasLaunched = true"
      :schema="schema"
      :params="wipOmicsRun?.params"
      @reset-run-pipeline="resetRunPipeline()"
      :key="resetStepperKey"
      :workflow-id="workflowId"
      :lab-name="labName"
    />

    <EGDialog
      action-label="Cancel Workflow Run"
      :action-variant="ButtonVariantEnum.enum.destructive"
      @action-triggered="confirmCancel"
      primary-message="Are you sure you would like to cancel?"
      secondary-message="Any changes made or files uploaded will not be saved."
      :model-value="!!nextRoute"
      @update:modelValue="nextRoute = null"
    />
  </template>
</template>
