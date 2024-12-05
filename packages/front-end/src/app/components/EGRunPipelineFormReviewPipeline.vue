<script setup lang="ts">
  import { useRunStore, useToastStore, useLabsStore } from '@FE/stores';
  import { CreateWorkflowLaunchRequest } from '@/packages/shared-lib/src/app/types/nf-tower/nextflow-tower-api';
  import EGAccordion from '@FE/components/EGAccordion.vue';
  import { ButtonSizeEnum } from '@FE/types/buttons';

  const props = defineProps<{
    canLaunch?: boolean;
    schema: object;
    params: object;
  }>();

  const { $api } = useNuxtApp();
  const $route = useRoute();

  const runStore = useRunStore();

  const labId = $route.params.labId as string;
  const labName = useLabsStore().labs[labId].Name;
  const nextFlowRunTempId = $route.query.nextFlowRunTempId as string;
  const isLaunchingRun = ref(false);
  const emit = defineEmits(['submit-launch-request', 'has-launched', 'previous-tab']);

  const remountAccordionKey = ref(0);
  const areAccordionsOpen = ref(true);

  const wipNextFlowRun = computed<WipNextFlowRunData | undefined>(() => runStore.wipNextFlowRuns[nextFlowRunTempId]);

  const paramsText = JSON.stringify(props.params);
  const schema = JSON.parse(JSON.stringify(props.schema));

  async function launchRun() {
    emit('submit-launch-request');

    try {
      isLaunchingRun.value = true;
      const pipelineId = wipNextFlowRun.value?.pipelineId;
      if (pipelineId === undefined) {
        throw new Error('pipeline id not found in wip run config');
      }

      const launchDetails = await $api.nextFlowPipelines.readPipelineLaunchDetails(pipelineId, labId);

      const workDir: string = `s3://${wipNextFlowRun.value?.s3Bucket}/${wipNextFlowRun.value?.s3Path}/work`;
      const launchRequest: CreateWorkflowLaunchRequest = {
        launch: {
          computeEnvId: launchDetails.launch?.computeEnv?.id,
          runName: wipNextFlowRun.value?.userPipelineRunName,
          pipeline: launchDetails.launch?.pipeline,
          revision: launchDetails.launch?.revision,
          configProfiles: launchDetails.launch?.configProfiles,
          workDir: workDir,
          paramsText: paramsText,
        },
      };
      await $api.nextFlowRuns.createPipelineRun(labId, launchRequest);
      delete runStore.wipNextFlowRuns[nextFlowRunTempId];
      emit('has-launched');
    } catch (error) {
      useToastStore().error('We weren’t able to complete this step. Please check your connection and try again later');
      console.error('Error launching workflow:', error);
    } finally {
      isLaunchingRun.value = false;
    }
  }

  const accordionItems = computed(() => {
    return Object.keys(schema.definitions).map((sectionName) => {
      const section = schema.definitions[sectionName];
      return {
        label: section.title,
        defaultOpen: true,
        content: {
          section,
          sectionName,
          properties: section.properties,
        },
      };
    });
  });

  // there's no apparent 'open/close' UAccordion method to tap into, so instead
  // we toggle the open state of each accordion it and re-initialize the
  // accordion component with this updated state
  function toggleAccordions() {
    areAccordionsOpen.value = !areAccordionsOpen.value;

    accordionItems.value.forEach((item) => {
      item.defaultOpen = areAccordionsOpen.value;
    });

    remountAccordionKey.value++;
  }
</script>

<template>
  <EGCard class="mb-6">
    <EGText tag="small" class="mb-4">Step 04</EGText>
    <EGText tag="h4" class="mb-0">Run Details</EGText>
    <UDivider class="py-4" />
    <section class="stroke-light flex flex-col bg-white">
      <dl>
        <div class="text-md flex border-b px-4 py-4">
          <dt class="w-48 text-black">Pipeline</dt>
          <dd class="text-muted text-left">{{ wipNextFlowRun?.pipelineName }}</dd>
        </div>
        <div class="text-md flex border-b px-4 py-4">
          <dt class="w-48 text-black">Laboratory</dt>
          <dd class="text-muted text-left">{{ labName }}</dd>
        </div>
        <div class="text-md flex px-4 py-4">
          <dt class="w-48 text-black">Run Name</dt>
          <dd class="text-muted text-left">{{ wipNextFlowRun?.userPipelineRunName }}</dd>
        </div>
      </dl>
    </section>
  </EGCard>

  <EGCard>
    <div class="mb-4 flex items-center justify-between">
      <EGText tag="h4" class="text-muted">Selected Workflow Parameters</EGText>
      <EGButton
        variant="secondary"
        :label="areAccordionsOpen ? 'Collapse All' : 'Expand All'"
        @click="toggleAccordions"
      />
    </div>
    <EGAccordion :items="accordionItems" :key="remountAccordionKey">
      <template #item="{ item, open }">
        <section class="stroke-light flex flex-col bg-white text-left">
          <dl>
            <div
              v-for="(property, propertyKey, index) in item.content.properties"
              :key="`property-${propertyKey}`"
              class="property-row grid grid-cols-[auto_1fr] gap-x-4 border-b bg-white px-4 py-4 last:border-0 dark:bg-gray-800"
            >
              <dt class="w-56 whitespace-pre-wrap break-words font-medium text-black">{{ propertyKey }}</dt>
              <dd class="text-muted whitespace-pre-wrap break-words">{{ params[propertyKey] }}</dd>
            </div>
          </dl>
        </section>
      </template>
    </EGAccordion>
  </EGCard>

  <div class="mt-6 flex justify-between">
    <EGButton :size="ButtonSizeEnum.enum.sm" variant="secondary" label="Previous step" @click="emit('previous-tab')" />
    <EGButton
      :disabled="!canLaunch"
      :loading="isLaunchingRun"
      :size="ButtonSizeEnum.enum.sm"
      @click="launchRun"
      label="Launch Workflow Run"
    />
  </div>
</template>

<style scoped>
  .property-row {
    &:last-child {
      border-bottom: none;
      margin-bottom: 16px;
    }
  }
</style>
