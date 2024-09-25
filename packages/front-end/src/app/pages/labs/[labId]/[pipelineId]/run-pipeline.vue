<script setup lang="ts">
  import { usePipelineRunStore } from '@FE/stores';
  import { ButtonVariantEnum } from '@FE/types/buttons';

  const { $api } = useNuxtApp();
  const $router = useRouter();
  const $route = useRoute();
  const labName = usePipelineRunStore().labName;

  const hasLaunched = ref<boolean>(false);
  const exitConfirmed = ref<boolean>(false);
  const nextRoute = ref<string | null>(null);
  const schema = ref({});

  onBeforeMount(async () => {
    await initializePipelineData();
  });

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

  /**
   * Reads the pipeline schema and parameters from the API and initializes the pipeline run store
   */
  async function initializePipelineData() {
    const res = await $api.pipelines.readPipelineSchema($route.params.pipelineId, $route.params.labId);
    schema.value = JSON.parse(res.schema);
    usePipelineRunStore().setParams(JSON.parse(<string>res.params));
  }

  function confirmCancel() {
    exitConfirmed.value = true;
    $router.push(nextRoute.value!);
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
  }
</script>

<template>
  <EGPageHeader
    title="Run Pipeline"
    :description="labName"
    :show-back-button="!hasLaunched"
    :back-action="() => (nextRoute = `/labs/${useLabsStore().labId}?tab=Pipelines`)"
    back-button-label="Exit Run"
  />
  <EGRunPipelineStepper
    @has-launched="hasLaunched = true"
    :schema="schema"
    :params="usePipelineRunStore().params"
    @reset-run-pipeline="resetRunPipeline()"
  />
  <EGDialog
    action-label="Cancel Pipeline Run"
    :action-variant="ButtonVariantEnum.enum.destructive"
    @action-triggered="confirmCancel"
    primary-message="Are you sure you would like to cancel?"
    secondary-message="Any changes made or files uploaded will not be saved."
    :model-value="!!nextRoute"
    @update:modelValue="nextRoute = null"
  />
</template>
