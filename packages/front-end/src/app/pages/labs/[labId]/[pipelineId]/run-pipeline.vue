<script setup lang="ts">
  import { useWorkflowStore } from '@FE/stores';
  import { ButtonVariantEnum } from '@FE/types/buttons';

  const { $api } = useNuxtApp();
  const $router = useRouter();
  const $route = useRoute();

  const workflowTempId = $route.query.workflowTempId as string;

  const labId = $route.params.labId as string;
  const pipelineId = $route.params.pipelineId as string;
  const labName = useWorkflowStore().workflows[labId][pipelineId];

  const hasLaunched = ref<boolean>(false);
  const exitConfirmed = ref<boolean>(false);
  const nextRoute = ref<string | null>(null);
  const schema = ref({});
  const resetStepperKey = ref(0);

  // check permissions to be on this page
  if (!useUserStore().canViewLab(useUserStore().currentOrgId, labId)) {
    $router.push('/labs');
  }

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
    const res = await $api.pipelines.readPipelineSchema(pipelineId, labId);
    const originalSchema = JSON.parse(res.schema);

    // Filter Schema to exclude any sections that do not have any visible parameters for user input
    const filteredDefinitions = Object.keys(originalSchema.definitions)
      .flatMap((key) => {
        const section = originalSchema.definitions[key];
        const hasAllHiddenSettings: boolean = Object.values(section.properties).every((x) => x?.hidden === true);
        if (!hasAllHiddenSettings) {
          return {
            [key]: section,
          };
        }
      })
      .filter((_) => _)
      .reduce((acc, cur) => ({ ...acc, [Object.keys(cur)[0]]: Object.values(cur)[0] }), {});

    schema.value = {
      ...originalSchema,
      definitions: filteredDefinitions,
    };
    useWorkflowStore().updateWipPipelineRun(workflowTempId, { pipelineDescription: schema.value.description });
    if (res.params) {
      useWorkflowStore().updateWipPipelineRun(workflowTempId, { params: JSON.parse(res.params) });
    }
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
    useWorkflowStore().updateWipPipelineRun(workflowTempId, {
      userPipelineRunName: '',
      pipelineDescription: '',
      params: {},
    });
    initializePipelineData();
    resetStepperKey.value++;
  }
</script>

<template>
  <EGPageHeader
    title="Run Pipeline"
    :description="labName"
    :show-back-button="!hasLaunched"
    :back-action="() => (nextRoute = `/labs/${labId}?tab=Pipelines`)"
    back-button-label="Exit Run"
  />
  <EGRunPipelineStepper
    @has-launched="hasLaunched = true"
    :schema="schema"
    :params="useWorkflowStore().wipWorkflows[workflowTempId].params"
    @reset-run-pipeline="resetRunPipeline()"
    :key="resetStepperKey"
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
