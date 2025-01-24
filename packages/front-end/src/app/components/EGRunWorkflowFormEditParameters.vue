<script setup lang="ts">
  import { ButtonSizeEnum } from '@FE/types/buttons';

  const props = defineProps<{
    schema: object;
    params: object;

    sampleSheetS3Url: string;
    s3Bucket: string;
    s3Path: string;
    wipRunUpdateFunction: Function;
    wipRunTempId: string;
  }>();

  const emit = defineEmits(['next-step', 'previous-step', 'step-validated']);

  const localProps = reactive({
    schema: props.schema,
    params: {
      ...props.params,
      input: props.sampleSheetS3Url,
      outdir: `s3://${props.s3Bucket}/${props.s3Path}/results`,
    },
  });

  watch(
    // watches for input changes in the local params object and updates the store with the new value
    () => localProps.params,
    (val) => {
      if (val) {
        props.wipRunUpdateFunction(props.wipRunTempId, { params: val });
      }
    },
    { deep: true },
  );
</script>

<template>
  <div class="flex">
    <div class="mr-4 w-1/4">
      <EGCard>
        <EGText tag="small" class="mb-4">Step 03</EGText>
        <EGText tag="h4" class="mb-0">Edit Parameters</EGText>
      </EGCard>
    </div>
    <div class="w-3/4">
      <EGCard>
        <!-- <EGInput name="input" v-model="runStore.wipSeqeraRuns[seqeraRunTempId].sampleSheetS3Url" /> -->
        <div v-for="param in props.schema">
          {{ param }}
        </div>
      </EGCard>

      <div class="mt-6 flex justify-between">
        <EGButton
          :size="ButtonSizeEnum.enum.sm"
          variant="secondary"
          label="Previous step"
          @click="emit('previous-step')"
        />
        <EGButton :size="ButtonSizeEnum.enum.sm" type="submit" label="Save & Continue" @click="emit('next-step')" />
      </div>
    </div>
  </div>
</template>
