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
  const schema = ref('');

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

  function handleDialogAction() {
    exitConfirmed.value = true;
    isDialogOpen.value = false;
    backNavigationInProgress.value = true;
    $router.go(-1);
    backNavigationInProgress.value = false;
  }

  function handleExitRun() {
    isDialogOpen.value = true;
  }

  onBeforeMount(async () => {
    const res = await $api.pipelines.readPipelineSchema($route.params.pipelineId, $route.params.labId);
    schema.value = JSON.parse(res.schema);
    usePipelineRunStore().setParams(JSON.parse(<string>res.params));
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
  <EGRunPipelineStepper @has-launched="hasLaunched = true" :schema="schema" :params="usePipelineRunStore().params" />
  <EGDialog
    action-label="Cancel Pipeline Run"
    :action-variant="ButtonVariantEnum.enum.destructive"
    @action-triggered="handleDialogAction"
    primary-message="Are you sure you would like to cancel?"
    secondary-message="Any changes made or files uploaded will not be saved."
    v-model="isDialogOpen"
  />
</template>
