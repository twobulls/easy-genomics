<script setup lang="ts">
  import {
    CreateWorkflowLaunchRequest,
    DescribePipelineLaunchResponse,
  } from '@easy-genomics/shared-lib/src/app/types/nf-tower/nextflow-tower-api';
  import { ButtonSizeEnum } from '~/types/buttons';

  const props = defineProps<{
    labId: string;
    labName: string;
    pipelineName: string;
    userPipelineRunName: string;
    canLaunch?: boolean;
  }>();

  const { $api } = useNuxtApp();
  const isLaunchingWorkflow = ref(false);
  const emit = defineEmits(['next-tab', 'launch-workflow', 'has-launched', 'previous-tab']);

  // TODO: wire up full pipeline once backend is ready
  // function onSubmit() {
  //   usePipelineRunStore().setUserPipelineRunName(formState.runName);
  //   emit('next-tab');
  // }

  // TODO: temporarily skip full pipeline and submit job
  function onSubmit() {
    emit('launch-workflow');
  }

  async function launchWorkflow() {
    try {
      isLaunchingWorkflow.value = true;
      const launchDetails: DescribePipelineLaunchResponse = await $api.pipelines.readPipelineLaunchDetails(
        usePipelineRunStore().pipelineId,
        props.labId,
      );
      launchDetails.launch.runName = props.userPipelineRunName;
      const res = await $api.workflows.createPipelineRun(props.labId, launchDetails as CreateWorkflowLaunchRequest);
      console.log('Pipeline run launched with response details:', res);
      emit('has-launched');
    } catch (error) {
      console.error('Error launching workflow:', error);
    } finally {
      isLaunchingWorkflow.value = false;
    }
  }
</script>

<template>
  <section class="stroke-light flex flex-col bg-white">
    <dl class="mt-4">
      <div class="flex border-b px-4 py-4 text-sm">
        <dt class="w-[200px] font-medium text-black">Pipeline</dt>
        <dd class="text-muted text-left">{{ pipelineName }}</dd>
      </div>
      <div class="flex border-b px-4 py-4 text-sm">
        <dt class="w-[200px] font-medium text-black">Laboratory</dt>
        <dd class="text-muted text-left">{{ labName }}</dd>
      </div>
      <div class="flex px-4 py-4 text-sm">
        <dt class="w-[200px] font-medium text-black">Run Name</dt>
        <dd class="text-muted text-left">{{ userPipelineRunName }}</dd>
      </div>
    </dl>
  </section>

  <div class="mt-12 flex justify-between">
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
