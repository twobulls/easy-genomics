<script setup lang="ts">
  import { useRunStore } from '@FE/stores';
  import { WorkflowParameter } from '@aws-sdk/client-omics';

  const props = defineProps<{
    schema: Record<string, WorkflowParameter>;
    params: object;
    // TODO: -> workflowId
    workflowId: string;
  }>();

  const $route = useRoute();
  const runStore = useRunStore();

  const omicsRunTempId = $route.query.omicsRunTempId as string;

  const wipOmicsRun = computed<WipOmicsRunData | undefined>(() => runStore.wipOmicsRuns[omicsRunTempId]);

  const labId = $route.params.labId as string;

  const selectedIndex = ref(0);
  const hasLaunched = ref(false);
  const resetKey = ref(0);

  const emit = defineEmits(['has-launched', 'reset-run-pipeline']);

  const items = ref([
    {
      disabled: false,
      key: 'details',
      label: 'Run Details',
    },
    {
      disabled: true,
      key: 'upload',
      label: 'Upload Data',
    },
    {
      disabled: true,
      key: 'parameters',
      label: 'Edit Parameters',
    },
    {
      disabled: true,
      key: 'review',
      label: 'Review Pipeline',
    },
  ]);

  const EGStepperTabsStyles = {
    base: 'focus:outline-none',
    list: {
      base: 'rounded-none mb-4 mt-0',
      padding: 'p-0',
      height: 'h-14',
      marker: {
        wrapper: 'focus:outline-none',
        base: 'absolute top-[0px] h-[4px]  rounded-none z-10',
        background: 'bg-primary',
        shadow: 'shadow-none',
      },
      size: {
        sm: 'text-lg',
      },
      tab: {
        base: '!text-base border-t-4 border-primary-muted rounded-none w-auto mr-4 inline-flex font-heading justify-start ui-focus-visible:outline-0 ui-focus-visible:ring-2 ui-focus-visible:ring-primary-500 ui-not-focus-visible:outline-none focus:outline-none disabled:cursor-not-allowed disabled:text-opacity-50 ',
        active: 'text-primary h-14',
        inactive: 'text-heading',
        height: 'h-14',
        padding: 'p-0',
      },
    },
  };

  const selected = computed({
    get() {
      return clampIndex(selectedIndex.value);
    },
    set(index) {
      if (!isStepValid(items.value[index].key)) {
        for (let i = index; i < items.value.length; i++) {
          setStepEnabled(items.value[i].key, false);
        }
      } else {
        enableSelectedItem(index);
        selectedIndex.value = index;
      }
    },
  });

  /**
   * Set the enabled state of a step in the stepper
   * @param step
   * @param isEnabled
   */
  function setStepEnabled(step: string, isEnabled: boolean) {
    const stepIndex = items.value.findIndex((item) => item.key === step);
    if (stepIndex > -1) {
      if (isEnabled) {
        items.value[stepIndex].disabled = false;
      } else {
        // If the step is disabled, disable all subsequent steps
        disableStepsFrom(stepIndex);
      }
    }
  }

  /**
   * Disable all steps from the given index
   * @param index
   */
  function disableStepsFrom(index: number) {
    for (let i = index; i < items.value.length; i++) {
      items.value[i].disabled = true;
    }
  }

  function enableSelectedItem(index: number) {
    const selectedItem = items.value.find((_, i) => i === index);
    if (selectedItem?.disabled) {
      selectedItem.disabled = false;
    }
  }

  function isStepValid(step: string) {
    const stepItem = items.value.find((item) => item.key === step);

    if (!stepItem) {
      return false;
    }

    return !stepItem.disabled;
  }

  function nextStep(val: string) {
    setStepEnabled(val, true);
    selected.value = Math.min(items.value.length - 1, selectedIndex.value + 1);
  }

  function clampIndex(index: number) {
    return Math.min(items.value.length - 1, Math.max(0, index));
  }

  function previousStep() {
    selected.value = clampIndex(selected.value - 1);
  }

  function disableAllSteps() {
    items.value.forEach((item) => {
      item.disabled = true;
    });
  }

  function handleLaunchSuccess() {
    hasLaunched.value = true;
    emit('has-launched');
  }

  function handleSubmitLaunchRequest() {
    disableAllSteps();
  }
</script>

<template>
  <div :key="resetKey">
    <UTabs v-model="selected" :items="items" :ui="EGStepperTabsStyles" class="UTabs">
      <template #default="{ item, index, selected }">
        <div class="relative flex items-center gap-2 truncate">
          <UIcon
            v-if="selectedIndex > index || hasLaunched"
            name="i-heroicons-check-20-solid"
            class="text-primary h-4 w-4 flex-shrink-0"
          />
          <span :class="selectedIndex > index || hasLaunched ? 'text-primary' : ''">{{ item.label }}</span>
          <span v-if="selected" class="bg-primary-500 dark:bg-primary-400 absolute -right-4 h-2 w-2 rounded-full" />
        </div>
      </template>

      <template #item="{ item, index }">
        <div v-if="!hasLaunched">
          <!-- Run Details -->
          <template v-if="items[selectedIndex].key === 'details'">
            <EGRunWorkflowFormRunDetails
              :pipeline-id="workflowId"
              @next-step="() => nextStep('upload')"
              @step-validated="setStepEnabled('upload', $event)"
            />
          </template>

          <!-- Upload Data -->
          <template v-if="items[selectedIndex].key === 'upload'">
            <EGRunWorkflowFormUploadData
              :pipeline-id="workflowId"
              @next-step="() => nextStep('parameters')"
              @previous-step="() => previousStep()"
              @step-validated="setStepEnabled('parameters', $event)"
            />
          </template>

          <template v-if="items[selectedIndex].key === 'parameters'">
            <EGRunWorkflowFormEditParameters
              :params="params"
              :schema="schema"
              :pipeline-id="workflowId"
              @next-step="() => nextStep('review')"
              @previous-step="() => previousStep()"
            />
          </template>

          <!-- Review Pipeline -->
          <template v-if="items[selectedIndex].key === 'review'">
            <EGRunWorkflowFormReviewPipeline
              :can-launch="true"
              :schema="props.schema"
              :params="wipOmicsRun?.params"
              :pipeline-id="workflowId"
              @submit-launch-request="handleSubmitLaunchRequest()"
              @has-launched="handleLaunchSuccess()"
              @previous-tab="() => previousStep()"
            />
          </template>
        </div>
      </template>
    </UTabs>

    <template v-if="hasLaunched">
      <EGEmptyDataCTA
        message="Your Workflow Run has Launched! Check on your progress via Runs."
        :primary-button-action="() => $router.push(`/labs/${labId}?tab=Lab+Runs`)"
        primary-button-label="Back to Runs"
        :secondary-button-action="() => emit('reset-run-pipeline')"
        secondary-button-label="Launch Another Workflow Run"
        img-src="/images/empty-state-launched.jpg"
      />
    </template>
  </div>
</template>
