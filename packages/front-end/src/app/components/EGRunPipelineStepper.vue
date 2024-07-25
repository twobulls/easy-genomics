<script setup lang="ts">
  import { usePipelineRunStore } from '~/stores';
  import { ButtonSizeEnum } from '~/types/buttons';

  const $route = useRoute();
  const router = useRouter();

  const labId = usePipelineRunStore().labId;
  const labName = usePipelineRunStore().labName;
  const pipelineId = usePipelineRunStore().pipelineId;
  const pipelineName = usePipelineRunStore().pipelineName;
  const pipelineDescription = usePipelineRunStore().pipelineDescription;

  const selectedIndex = ref(0);
  const hasLaunched = ref(false);

  const emit = defineEmits<{
    (event: 'has-launched');
  }>();

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
      const index = items.value.findIndex((item) => item.label === $route.query.tab);
      return clampIndex(index);
    },
    set(index) {
      if (!isStepValid(items.value[index].key)) {
        for (let i = index; i < items.value.length; i++) {
          setStepEnabled(items.value[i].key, false);
        }
      } else {
        enableSelectedItem(index);
        setTabQueryParam(index);
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
        // If the step is disabled, we need to disable all subsequent steps
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
    nextTab();
  }

  function clampIndex(index: number) {
    return Math.min(items.value.length - 1, Math.max(0, index));
  }

  function nextTab() {
    selected.value = Math.min(items.value.length - 1, selectedIndex.value + 1);
  }

  function previousTab() {
    selected.value = clampIndex(selected.value - 1);
  }

  function handleLaunchSuccess() {
    hasLaunched.value = true;
    emit('has-launched');
  }

  // Update the URL query when the selected tab changes.
  // Adding/overwriting the tab query parameter with the selected tab label.
  // e.g. tab=Edit+Parameters
  // http://localhost:3000/labs/bbac4190-0446-4db4-a084-cfdbc8102297/run-pipeline?tab=Edit+Parameters
  function setTabQueryParam(index: number) {
    const clampedIndex = clampIndex(index);
    const item = items.value.find((_, i) => i === clampedIndex);
    if (item) {
      const query = { ...$route.query, tab: items.value[clampedIndex].label };
      router.replace({ query });
    }
  }

  function resetRunPipeline() {
    hasLaunched.value = false;
    selected.value = 0;
    disableStepsFrom(0);
    usePipelineRunStore().setUserPipelineRunName('');
  }
</script>

<template>
  <UTabs v-model="selected" :items="items" :ui="EGStepperTabsStyles" class="UTabs">
    <template #default="{ item, index, selected }">
      <div class="relative flex items-center gap-2 truncate">
        <UIcon
          v-if="selectedIndex > index || hasLaunched"
          name="i-heroicons-check-20-solid"
          class="text-primary h-4 w-4 flex-shrink-0"
        />
        <span :class="selectedIndex > index ? 'text-primary' : ''">{{ item.label }}</span>
        <span v-if="selected" class="bg-primary-500 dark:bg-primary-400 absolute -right-4 h-2 w-2 rounded-full" />
      </div>
    </template>

    <template #item="{ item, index }">
      <EGCard v-if="!hasLaunched">
        <!-- Header -->
        <EGText tag="small" class="mb-4">Step 0{{ selectedIndex + 1 }}</EGText>
        <EGText tag="h4" class="mb-0">{{ items[selectedIndex].label }}</EGText>
        <UDivider class="py-4" />

        <!-- Run Details -->
        <template v-if="items[selectedIndex].key === 'details'">
          <EGRunPipelineFormRunDetails
            :labId="labId"
            :labName="labName"
            :pipelineId="pipelineId"
            :pipelineName="pipelineName"
            :pipelineDescription="pipelineDescription"
            @next-tab="() => nextTab()"
            @step-validated="setStepEnabled('upload', $event)"
          />
        </template>

        <!-- Upload Data -->
        <template v-if="items[selectedIndex].key === 'upload'">
          Upload Placeholder
          <div class="mt-12 flex justify-between">
            <EGButton
              :size="ButtonSizeEnum.enum.sm"
              variant="secondary"
              label="Previous step"
              @click="() => previousTab()"
            />
            <EGButton @click="() => nextStep('parameters')" label="Save & Continue" />
          </div>
        </template>

        <!-- Edit Parameters -->
        <template v-if="items[selectedIndex].key === 'parameters'">
          Edit Parameters Placeholder
          <div class="mt-12 flex justify-between">
            <EGButton
              :size="ButtonSizeEnum.enum.sm"
              variant="secondary"
              label="Previous step"
              @click="() => previousTab()"
            />
            <EGButton @click="() => nextStep('review')" label="Save & Continue" />
          </div>
        </template>

        <!-- Review Pipeline -->
        <template v-if="items[selectedIndex].key === 'review'">
          <EGRunPipelineFormReviewPipeline
            :labId="labId"
            :labName="labName"
            :pipelineName="usePipelineRunStore().pipelineName"
            :userPipelineRunName="usePipelineRunStore().userPipelineRunName"
            @has-launched="handleLaunchSuccess()"
            :can-launch="true"
            @previous-tab="() => previousTab()"
          />
        </template>
      </EGCard>
    </template>
  </UTabs>

  <template v-if="hasLaunched">
    <!-- Launch successful -->
    <EGEmptyDataCTA
      message="Your Workflow Run has Launched! Check on your progress via Runs."
      :primary-button-action="() => $router.go(-1)"
      primary-button-label="Back to Pipelines"
      :secondary-button-action="() => resetRunPipeline()"
      secondary-button-label="Launch Another Workflow Run"
      img-src="/images/empty-state-launched.jpg"
    />
  </template>
</template>
