<script setup lang="ts">
  import { usePipelineRunStore } from '~/stores';
  import { ButtonVariantEnum } from '~/types/buttons';

  const { $api } = useNuxtApp();
  const $router = useRouter();
  const $route = useRoute();
  const labName = usePipelineRunStore().labName;

  const isDialogOpen = ref(false);
  const hasLaunched = ref(false);
  const exitConfirmed = ref(false);
  const backNavigationInProgress = ref(false);
  const nextRoute = ref(null);
  const schema = ref({});
  const resetStepperKey = ref(0);

  onBeforeMount(async () => {
    await initializePipelineData();
  });

  /**
   * Intercept any navigation away from the page (including the browser back button) and present the modal
   */
  onBeforeRouteLeave((to, from, next) => {
    if (hasLaunched.value) next(true);
    else if (!exitConfirmed.value) {
      handleExitRun();
      nextRoute.value = to.path;
      next(false);
    } else {
      next(true);
    }
  });

  /**
   * Reads the pipeline schema and parameters from the API and initializes the pipeline run store
   */
  async function initializePipelineData() {
    const res = await $api.pipelines.readPipelineSchema($route.params.pipelineId, $route.params.labId);
    schema.value = JSON.parse(res.schema);
    usePipelineRunStore().setParams(JSON.parse(<string>res.params));
  }

  function handleDialogAction() {
    exitConfirmed.value = true;
    isDialogOpen.value = false;
    backNavigationInProgress.value = true;
    $router.replace(useUiStore().previousPageRoute);
    backNavigationInProgress.value = false;
  }

  function handleExitRun() {
    isDialogOpen.value = true;
  }

  /**
   * Resets the pipeline run workflow:
   * - clears some store values
   * - re-initializes the schema + prefills params
   * - re-mounts the stepper to reset it to initial state
   */
  function resetRunPipeline() {
    usePipelineRunStore().setUserPipelineRunName('');
    usePipelineRunStore().setParams({});
    initializePipelineData();
    resetStepperKey.value++;
  }

  watch([isDialogOpen, backNavigationInProgress], ([dialogOpen, navigatingBack]) => {
    if (dialogOpen) {
      nextRoute.value = null;
      return; // If the dialog is still open, return and don't execute the routing logic
    }
    if (!navigatingBack && nextRoute.value && isDialogOpen.value) {
      $router.push(nextRoute.value);
      nextRoute.value = null;
    }
  });
</script>

<template>
  <EGPageHeader
    title="Run Pipeline"
    :description="labName"
    :show-back-button="!hasLaunched"
    :back-button-action="handleExitRun"
    back-button-label="Exit Run"
  />
  <EGRunPipelineStepper
    @has-launched="hasLaunched = true"
    :schema="schema"
    :params="usePipelineRunStore().params"
    @reset-run-pipeline="resetRunPipeline()"
    :key="resetStepperKey"
  />
  <EGDialog
    action-label="Cancel Pipeline Run"
    :action-variant="ButtonVariantEnum.enum.destructive"
    @action-triggered="handleDialogAction"
    primary-message="Are you sure you would like to cancel?"
    secondary-message="Any changes made or files uploaded will not be saved."
    v-model="isDialogOpen"
  />
</template>
