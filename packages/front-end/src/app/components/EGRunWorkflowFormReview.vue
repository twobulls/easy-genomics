<script setup lang="ts">
  import { useRunStore, useToastStore, useLabsStore } from '@FE/stores';
  import { ButtonSizeEnum } from '@FE/types/buttons';

  const props = defineProps<{
    schema: object;
    params: object;

    labId: string;
    omicsRunTempId: string;
    s3Bucket: string;
    s3Path: string;
    runName: string;
    transactionId: string;
    workflowId: string;
    workflowName: string;
  }>();

  const { $api } = useNuxtApp();

  const runStore = useRunStore();

  const labName = useLabsStore().labs[props.labId].Name;
  const isLaunchingRun = ref(false);
  const emit = defineEmits(['submit-launch-request', 'submit-launch-request-error', 'has-launched', 'previous-tab']);

  const schema = JSON.parse(JSON.stringify(props.schema));

  function withoutEmptyFields(o: object): object {
    const r = {};

    for (const key in o) {
      if (!!o[key]) {
        r[key] = o[key];
      }
    }

    return r;
  }

  async function launchRun() {
    emit('submit-launch-request');

    try {
      isLaunchingRun.value = true;
      if (props.workflowId === undefined) {
        throw new Error('pipeline id not found in wip run config');
      }

      const startOmicsRes = await $api.omicsRuns.createExecution(
        props.labId,
        props.workflowId,
        props.runName,
        withoutEmptyFields(props.params),
      );

      if (!startOmicsRes) {
        throw new Error('Failed to create workflow run. Response is empty.');
      }

      if (!startOmicsRes.id) {
        throw new Error('Workflow Run ID is missing in the response');
      }

      try {
        const labRunRequest = {
          'LaboratoryId': props.labId,
          'RunId': props.transactionId,
          'RunName': props.runName,
          'Platform': 'AWS HealthOmics',
          'Status': 'SUBMITTED',
          'WorkflowName': props.workflowName,
          'ExternalRunId': startOmicsRes.id,
          'InputS3Url': props.params.input.substring(0, props.params.input.lastIndexOf('/')),
          'OutputS3Url': props.params.outdir,
          'SampleSheetS3Url': props.params.input,
          'Settings': JSON.stringify(props.params),
        };
        await $api.labs.createLabRun(labRunRequest);
      } catch (error) {
        console.error('Error launching workflow:', error);
        throw error;
      }

      delete runStore.wipOmicsRuns[props.omicsRunTempId];
      emit('has-launched');
    } catch (error) {
      useToastStore().error('Error launching run: ' + error);
      console.error('Error launching workflow:', error);
      emit('submit-launch-request-error');
    } finally {
      isLaunchingRun.value = false;
    }
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
          <dt class="w-48 text-black">Workflow</dt>
          <dd class="text-muted text-left">{{ props.workflowName }}</dd>
        </div>
        <div class="text-md flex border-b px-4 py-4">
          <dt class="w-48 text-black">Laboratory</dt>
          <dd class="text-muted text-left">{{ labName }}</dd>
        </div>
        <div class="text-md flex px-4 py-4">
          <dt class="w-48 text-black">Run Name</dt>
          <dd class="text-muted text-left">{{ props.runName }}</dd>
        </div>
      </dl>
    </section>
  </EGCard>
  <EGCard>
    <EGText tag="h4" class="text-muted">Selected Workflow Parameters</EGText>
    <section class="stroke-light flex flex-col bg-white text-left">
      <dl>
        <div
          v-for="(property, propertyKey, index) in schema"
          :key="`property-${propertyKey}`"
          class="property-row grid grid-cols-[auto_1fr] gap-x-4 border-b bg-white px-4 py-4 last:border-0 dark:bg-gray-800"
        >
          <dt class="w-56 whitespace-pre-wrap break-words font-medium text-black">{{ propertyKey }}</dt>
          <dd class="text-muted whitespace-pre-wrap break-words">{{ params[propertyKey] }}</dd>
        </div>
      </dl>
    </section>
  </EGCard>

  <div class="mt-6 flex justify-between">
    <EGButton :size="ButtonSizeEnum.enum.sm" variant="secondary" label="Previous step" @click="emit('previous-tab')" />
    <EGButton :loading="isLaunchingRun" :size="ButtonSizeEnum.enum.sm" @click="launchRun" label="Launch Workflow Run" />
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
