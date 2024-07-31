<script setup lang="ts">
  import { ButtonSizeEnum } from '~/types/buttons';

  const props = defineProps<{
    canLaunch?: boolean;
    labId: string;
    labName: string;
    params: object;
    pipelineName: string;
    userPipelineRunName: string;
  }>();

  const { $api } = useNuxtApp();
  const isLaunchingWorkflow = ref(false);
  const emit = defineEmits(['next-tab', 'launch-workflow', 'has-launched', 'previous-tab']);

  function onSubmit() {
    emit('launch-workflow');
  }

  async function launchWorkflow() {
    try {
      isLaunchingWorkflow.value = true;
      const launchDetails = await $api.pipelines.readPipelineLaunchDetails(
        usePipelineRunStore().pipelineId,
        props.labId,
      );
      launchDetails.paramsText = JSON.parse(props.params);
      if (launchDetails.launch) {
        launchDetails.launch.runName = props.userPipelineRunName;
      }
      await $api.workflows.createPipelineRun(props.labId, launchDetails);
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
