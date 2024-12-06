<script setup lang="ts">
  import { ReadWorkflow } from '@easy-genomics/shared-lib/src/app/types/aws-healthomics/aws-healthomics-api';
  import { useRunStore } from '@FE/stores';
  import { WipOmicsRunData } from '@FE/stores/run';
  import { ButtonVariantEnum } from '@FE/types/buttons';

  const { $api } = useNuxtApp();
  const $router = useRouter();
  const $route = useRoute();
  const runStore = useRunStore();

  const omicsRunTempId = $route.query.omicsRunTempId as string;

  const wipOmicsRun = computed<WipOmicsRunData | undefined>(() => runStore.wipOmicsRuns[omicsRunTempId]);

  const labId = $route.params.labId as string;
  const workflowId = $route.params.workflowId as string;
  const workflow = ref<ReadWorkflow | null>(null);

  const hasLaunched = ref<boolean>(false);
  const exitConfirmed = ref<boolean>(false);
  const nextRoute = ref<string | null>(null);

  const labName = computed<string>(() => useLabsStore().labs[labId].Name);

  // check permissions to be on this page
  if (!useUserStore().canViewLab(labId)) {
    $router.push('/labs');
  }

  onBeforeMount(loadWorkflow);

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
    workflow.value = await $api.omicsWorkflows.get(labId, workflowId);
  }

  function confirmCancel() {
    exitConfirmed.value = true;
    delete runStore.wipOmicsRuns[omicsRunTempId];
    $router.push(nextRoute.value!);
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

  <div>wipOmicsRun</div>
  <div>{{ JSON.stringify(wipOmicsRun, null, 2) }}</div>

  <div>workflow</div>
  <div>{{ JSON.stringify(workflow, null, 2) }}</div>

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
