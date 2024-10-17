<script setup lang="ts">
  import { ButtonSizeEnum } from '@FE/types/buttons';
  import { useWorkflowStore, useToastStore } from '@FE/stores';
  import { CreateWorkflowLaunchRequest } from '@/packages/shared-lib/src/app/types/nf-tower/nextflow-tower-api';

  const props = defineProps<{
    canLaunch?: boolean;
    schema: object;
    params: object;
  }>();

  const { $api } = useNuxtApp();
  const $route = useRoute();

  const workflowStore = useWorkflowStore();

  const labId = $route.params.labId as string;
  const labName = useLabsStore().labs[labId].Name;
  const workflowTempId = $route.query.workflowTempId as string;
  const isLaunchingWorkflow = ref(false);
  const emit = defineEmits(['launch-workflow', 'has-launched', 'previous-tab']);

  const wipWorkflow = computed<WipWorkflowData | undefined>(() => workflowStore.wipWorkflows[workflowTempId]);

  const paramsText = JSON.stringify(props.params);
  const schema = JSON.parse(JSON.stringify(props.schema));

  async function launchWorkflow() {
    try {
      isLaunchingWorkflow.value = true;
      const pipelineId = wipWorkflow.value?.pipelineId;
      if (pipelineId === undefined) {
        throw new Error('pipeline id not found in wip workflow config');
      }

      const launchDetails = await $api.pipelines.readPipelineLaunchDetails(pipelineId, labId);

      const workDir: string = `s3://${wipWorkflow.value?.s3Bucket}/${wipWorkflow.value?.s3Path}/work`;
      const launchRequest: CreateWorkflowLaunchRequest = {
        launch: {
          computeEnvId: launchDetails.launch?.computeEnv?.id,
          runName: wipWorkflow.value?.userPipelineRunName,
          pipeline: launchDetails.launch?.pipeline,
          revision: launchDetails.launch?.revision,
          configProfiles: launchDetails.launch?.configProfiles,
          workDir: workDir,
          paramsText: paramsText,
        },
      };
      await $api.workflows.createPipelineRun(labId, launchRequest);
      delete workflowStore.wipWorkflows[workflowTempId];
      emit('has-launched');
    } catch (error) {
      useToastStore().error('We weren’t able to complete this step. Please check your connection and try again later');
      console.error('Error launching workflow:', error);
    } finally {
      isLaunchingWorkflow.value = false;
    }
  }
</script>

<template>
  <EGCard>
    <EGText tag="small" class="mb-4">Step 04</EGText>
    <EGText tag="h4" class="mb-0">Run Details</EGText>
    <UDivider class="py-4" />
    <section class="stroke-light flex flex-col bg-white">
      <dl>
        <div class="flex border-b px-4 py-4 text-sm">
          <dt class="w-[200px] font-medium text-black">Pipeline</dt>
          <dd class="text-muted text-left">{{ wipWorkflow?.pipelineName }}</dd>
        </div>
        <div class="flex border-b px-4 py-4 text-sm">
          <dt class="w-[200px] font-medium text-black">Laboratory</dt>
          <dd class="text-muted text-left">{{ labName }}</dd>
        </div>
        <div class="flex px-4 py-4 text-sm">
          <dt class="w-[200px] font-medium text-black">Run Name</dt>
          <dd class="text-muted text-left">{{ wipWorkflow?.userPipelineRunName }}</dd>
        </div>
      </dl>
    </section>
    <div v-for="(section, sectionName) in schema.definitions" :key="`section-${sectionName}`">
      <EGText tag="h4" class="mb-0">{{ section.title }}</EGText>
      <UDivider class="py-4" />
      <section class="stroke-light flex flex-col bg-white">
        <dl>
          <div v-for="(property, propertyKey) in section.properties" :key="`property-${propertyKey}`">
            <div class="flex border-b px-4 py-4 text-sm">
              <dt class="w-[200px] font-medium text-black">{{ propertyKey }}</dt>
              <dd class="text-muted text-left">{{ params[propertyKey] }}</dd>
            </div>
          </div>
        </dl>
      </section>
    </div>
  </EGCard>

  <div class="mt-6 flex justify-between">
    <EGButton :size="ButtonSizeEnum.enum.sm" variant="secondary" label="Previous step" @click="emit('previous-tab')" />
    <EGButton
      :disabled="!canLaunch"
      :loading="isLaunchingWorkflow"
      :size="ButtonSizeEnum.enum.sm"
      @click="() => launchWorkflow()"
      label="Launch Workflow Run"
    />
  </div>
</template>
