<script setup lang="ts">
  import { FormError } from '#ui/types';
  import { z } from 'zod';
  import { maybeAddFieldValidationErrors } from '@FE/utils/form-utils';
  import { ButtonSizeEnum } from '@FE/types/buttons';
  import { RunType } from '@easy-genomics/shared-lib/src/app/types/base-entity';

  const emit = defineEmits(['next-step', 'step-validated']);
  const props = defineProps<{
    platform: RunType;
    wipRunTempId: string;
    pipelineOrWorkflowName: string;
    pipelineOrWorkflowDescription: string;
  }>();

  const { platformToPipelineOrWorkflow, platformToWipRunUpdateFunction, getWipRunForPlatform } = useMultiplatform();

  /**
   * Seqera API spec
   * https://cloud.seqera.io/openapi/seqera-api-latest.yml
   */

  /**
   * The user enters the runName to identify the pipeline run.
   * Max run name length must be dynamic as it is combined with,
   * + The pipeline name (variable length)
   * + Date stamp (yyyymmdd - 8-characters)
   * + A 15-character random hexadecimal string (15-characters)
   * + Each part separated by an underscore (2-characters)
   * With the final pipeline run name being a max of 80-characters
   * e.g. User enters 'community-showcase' and the following name is generated,
   * viralrecon-illumina_community-showcase_20240712_5686910e783b4b2
   */
  const MAX_RUN_NAME_LENGTH = 50;
  const runNameSchema = z
    .string()
    .trim()
    .min(1, 'Pipeline run name must be at least 1 character')
    .max(MAX_RUN_NAME_LENGTH, `Pipeline run name must be ${MAX_RUN_NAME_LENGTH} characters or less`);

  const formStateSchema = z.object({
    runName: runNameSchema,
  });
  type FormState = z.infer<typeof formStateSchema>;

  const formState = reactive<FormState>({
    runName: '',
  });

  const canProceed = ref(false);

  const runNameCharCount = computed(() => formState.runName.length);

  const pipelineOrWorkflow = computed<string>(() => platformToPipelineOrWorkflow(props.platform));

  const wipRunUpdateFunction = computed<Function>(() => platformToWipRunUpdateFunction(props.platform));

  const wipRun = computed<WipRun>(() => getWipRunForPlatform(props.platform, props.wipRunTempId));

  // when the wipRun is loaded and has a runName value, fill it into the box
  watch(
    wipRun,
    (val) => {
      if (val.runName) formState.runName = val.runName;
      validate(formState);
    },
    { immediate: true },
  );

  function validate(currentState: FormState): FormError[] {
    const errors: FormError[] = [];

    maybeAddFieldValidationErrors(errors, runNameSchema, 'runName', currentState.runName);

    canProceed.value = errors.length === 0;

    return errors;
  }

  /**
   * Converts the user input value to one supported by the Seqera API.
   *
   * Allows only alphanumeric characters, hyphens, and underscores.
   * Removes any other characters and replaces multiple hyphens and underscores with a single instance.
   * Removes any leading non-alphabetic characters.
   * Replaces sequences of hyphens and underscores with the first character of the sequence. e.g.
   * 'example-_run-name_-test' -> 'example-run-name_test'
   *
   * @param {string} input - The input string to extract the run name from.
   * @returns {string} - The supported run name extracted from the input string.
   */
  function getSupportedRunName(value: string): string {
    return value
      .replace(/[^a-zA-Z0-9-_]+/g, '')
      .replace(/[-_]+/g, (match) => match.charAt(0))
      .replace(/([-_])\1+/g, '$1')
      .replace(/^[^a-zA-Z]+/, '');
  }

  function onRunNameInput(_event: InputEvent) {
    // satinize name in-place in the text box
    formState.runName = getSupportedRunName(formState.runName);
    // write to wipRun
    wipRunUpdateFunction.value(props.wipRunTempId, { runName: formState.runName });
  }

  function onSubmit() {
    emit('next-step');
  }

  watch(canProceed, (val) => {
    emit('step-validated', val);
  });
</script>

<template>
  <UForm :schema="formStateSchema" :state="formState" :validate="validate" @submit="onSubmit">
    <EGCard>
      <EGText tag="small" class="mb-4">Step 01</EGText>
      <EGText tag="h4" class="mb-0">Run Details</EGText>
      <UDivider class="py-4" />
      <EGFormGroup :label="pipelineOrWorkflow" name="pipelineName">
        <EGInput :model-value="props.pipelineOrWorkflowName" :disabled="true" />
      </EGFormGroup>

      <EGFormGroup
        label="Run Name"
        hint="(Only alphanumeric characters, hyphens, and underscores. First character must be a letter.)"
        name="runName"
        eager-validation
        required
      >
        <EGInput
          v-model="formState.runName"
          placeholder="Enter a name to identify this pipeline run"
          @input.prevent="onRunNameInput"
          autofocus
        />
        <EGCharacterCounter :value="runNameCharCount" :max="MAX_RUN_NAME_LENGTH" />
      </EGFormGroup>

      <EGFormGroup label="Description" name="pipelineDescription">
        <EGTextArea :model-value="props.pipelineOrWorkflowDescription" :disabled="true" />
      </EGFormGroup>
    </EGCard>

    <div class="flex justify-end pt-4">
      <EGButton :disabled="!canProceed" :size="ButtonSizeEnum.enum.sm" type="submit" label="Save & Continue" />
    </div>
  </UForm>
</template>
