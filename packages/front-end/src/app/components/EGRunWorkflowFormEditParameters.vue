<script setup lang="ts">
  import { ButtonSizeEnum } from '@FE/types/buttons';
  import { WipOmicsRunData } from '@FE/stores/run';

  const props = defineProps<{
    schema: object;
    params: object;

    sampleSheetS3Url: string;
    s3Bucket: string;
    s3Path: string;
    omicsRunTempId: string;
  }>();

  const emit = defineEmits(['next-step', 'previous-step', 'step-validated']);

  const runStore = useRunStore();

  const wipOmicsRun = computed<WipOmicsRunData | undefined>(() => runStore.wipOmicsRuns[props.omicsRunTempId]);

  type SchemaItem = {
    name: string;
    description: string;
    optional: boolean;
  };

  const orderedSchema = computed<SchemaItem[]>(() =>
    Object.keys(props.schema)
      .map((fieldName) => ({
        name: fieldName,
        ...props.schema[fieldName],
      }))
      .sort((fieldA, fieldB) => {
        // list mandatory fields first
        if (fieldA.optional !== true && fieldB.optional === true) return -1;
        if (fieldA.optional === true && fieldB.optional !== true) return 1;

        return 0;
      }),
  );

  // all schema fields with empty string as default
  const paramDefaults: { [key: string]: '' } = Object.fromEntries(
    Object.keys(props.schema).map((fieldName) => [fieldName, '']),
  );

  function generatedParamFields(): { input?: string; outdir?: string } {
    const r: any = {};
    if (!!wipOmicsRun.value?.sampleSheetS3Url) r.input = wipOmicsRun.value?.sampleSheetS3Url;
    if (!!wipOmicsRun.value?.s3Bucket && !!wipOmicsRun.value?.s3Path)
      r.outdir = `s3://${wipOmicsRun.value?.s3Bucket}/${wipOmicsRun.value?.s3Path}/results`;

    return r;
  }

  const localProps = reactive({
    schema: props.schema,
    params: {
      // initialize all fields with empty string as default
      ...paramDefaults,
      // initialize input and output values with default values
      ...generatedParamFields(),
      // finally overwrite with any existing values
      ...props.params,
    },
  });
  // save the updated parameters to the store too
  runStore.updateWipOmicsRun(props.omicsRunTempId, {
    params: localProps.params,
  });

  watch(
    // watches for input changes in the local params object and updates the store with the new value
    () => localProps.params,
    (val) => {
      if (val) {
        runStore.updateWipOmicsRun(props.omicsRunTempId, { params: val });
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
        <div v-for="schemaField in orderedSchema" class="mb-6">
          <EGParametersStringField
            :name="schemaField.name"
            :details="{
              description: schemaField.description,
            }"
            v-model="localProps.params[schemaField.name]"
          />
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
