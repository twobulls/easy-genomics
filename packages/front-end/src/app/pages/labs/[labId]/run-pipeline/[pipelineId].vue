<script setup lang="ts">
  import { useRunStore } from '@FE/stores';
  import { ButtonVariantEnum } from '@FE/types/buttons';
  import { v4 as uuidv4 } from 'uuid';

  const { $api } = useNuxtApp();
  const $router = useRouter();
  const $route = useRoute();
  const runStore = useRunStore();

  // set a new seqeraRunTempId if not provided
  if (!$route.query.seqeraRunTempId) {
    $router.push({ query: { seqeraRunTempId: uuidv4() } });
  }

  const seqeraRunTempId = computed<string>(() => $route.query.seqeraRunTempId as string);

  const wipSeqeraRun = computed<WipSeqeraRunData | undefined>(() => runStore.wipSeqeraRuns[seqeraRunTempId.value]);

  const labId = $route.params.labId as string;
  const pipelineId = $route.params.pipelineId as string;

  const hasLaunched = ref<boolean>(false);
  const exitConfirmed = ref<boolean>(false);
  const nextRoute = ref<string | null>(null);
  const schema = ref({});
  const resetStepperKey = ref(0);

  const labName = computed<string>(() => useLabsStore().labs[labId].Name);

  // check permissions to be on this page
  if (!useUserStore().canViewLab(labId)) {
    $router.push('/labs');
  }

  onBeforeMount(initializePipelineData);

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
    runStore.updateWipSeqeraRun(seqeraRunTempId.value, {
      laboratoryId: labId,
      pipelineId: pipelineId,
      transactionId: seqeraRunTempId.value,
    });

    const res = await $api.seqeraPipelines.readPipelineSchema(pipelineId, labId);
    const originalSchema = JSON.parse(res.schema);

    const definitions = originalSchema.$defs || originalSchema.definitions;

    // Filter Schema to exclude any sections that do not have any visible parameters for user input
    const filteredDefinitions = Object.keys(definitions)
      .flatMap((key) => {
        const section = definitions[key];
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
      $defs: filteredDefinitions,
    };
    if (res.params) {
      runStore.updateWipSeqeraRun(seqeraRunTempId.value, { params: JSON.parse(res.params) });
    }
  }

  function confirmCancel() {
    exitConfirmed.value = true;
    delete runStore.wipSeqeraRuns[seqeraRunTempId.value];
    $router.push(nextRoute.value!);
  }

  /**
   * Resets the pipeline run:
   * - clears some store values
   * - re-initializes the schema + prefills params
   * - re-mounts the stepper to reset it to initial state
   */
  function resetRunPipeline() {
    $router.push({ query: { seqeraRunTempId: uuidv4() } });

    // without this short delay, initializePipelineData sets wip data for the old seqeraRunTempId, because the route
    // change doesn't complete in time
    setTimeout(() => {
      initializePipelineData();
      resetStepperKey.value++;
    }, 100);
  }
</script>

<template>
  <EGPageHeader
    title="Run Pipeline"
    :description="labName"
    :show-back="!hasLaunched"
    :back-action="() => (nextRoute = `/labs/${labId}?tab=Seqera+Pipelines`)"
    back-button-label="Exit Run"
  />
  <EGRunPipelineStepper
    @has-launched="hasLaunched = true"
    :schema="schema"
    :params="wipSeqeraRun?.params"
    @reset-run-pipeline="resetRunPipeline()"
    :key="resetStepperKey"
    :pipeline-id="pipelineId"
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
