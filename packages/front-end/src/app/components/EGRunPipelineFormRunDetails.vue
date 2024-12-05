<script setup lang="ts">
  import { FormError } from '#ui/types';
  import { z } from 'zod';
  import { maybeAddFieldValidationErrors } from '@FE/utils/form-utils';
  import { ButtonSizeEnum } from '@FE/types/buttons';
  import { useRunStore } from '@FE/stores';

  const emit = defineEmits(['next-step', 'step-validated']);

  const $route = useRoute();
  const runStore = useRunStore();

  const nextFlowRunTempId = $route.query.nextFlowRunTempId as string;

  const wipNextFlowRun = computed<WipSeqeraRunData | undefined>(() => runStore.wipSeqeraRuns[nextFlowRunTempId]);

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
  const MAX_TOTAL_LENGTH = 80;
  const MAX_RUN_NAME_LENGTH = 50;

  const runNameSchema = z
    .string()
    .trim()
    .min(1, 'Pipeline run name must be at least 1 character')
    .max(MAX_RUN_NAME_LENGTH, `Pipeline run name must be ${MAX_RUN_NAME_LENGTH} characters or less`);

  const formStateSchema = z.object({
    pipelineDescription: z.string(), // Seqera API spec doesn't define a max length for pipeline description
    pipelineName: z.string(), // Seqera API spec doesn't define a max length for pipeline name a.k.a action name e.g. nf-core-viralrecon
    runName: runNameSchema,
  });
  type FormState = z.infer<typeof formStateSchema>;

  const formState = reactive<FormState>({
    pipelineDescription: wipNextFlowRun.value?.pipelineDescription || '',
    pipelineName: wipNextFlowRun.value?.pipelineName || '',
    runName: '',
  });

  const canProceed = ref(false);
  const isSubmittingFormData = ref(false);
  const runNameCharCount = computed(() => formState.runName.length);

  // Trims white space, replaces spaces between words with hyphens, and enforces a max of one hyphen in a row
  // e.g. 'some custom name' -> 'some-custom-name'
  function getSafeRunName(runName: string): string {
    return runName.trim().replace(/\s+/g, '-').replace(/-+/g, '-');
  }

  /**
   * Initialization to pre-fill the run name with the user's pipeline run name if previously set and validate
   */
  onBeforeMount(async () => {
    formState.runName = wipNextFlowRun.value?.userPipelineRunName || '';
    formState.pipelineDescription = wipNextFlowRun.value?.pipelineDescription || '';
    validate(formState);
  });

  function validate(currentState: FormState): FormError[] {
    const errors: FormError[] = [];

    try {
      maybeAddFieldValidationErrors(errors, runNameSchema, 'runName', currentState.runName);
    } catch (error) {
      console.error('Error validating run details form:', error);
    }

    canProceed.value = errors.length === 0;

    return errors;
  }

  function onSubmit() {
    const safeRunName = getSafeRunName(formState.runName);
    useRunStore().updateWipSeqeraRun(nextFlowRunTempId, { userPipelineRunName: safeRunName });
    emit('next-step');
  }

  /**
   * Converts the user input value to one supported by the Next Flow Tower API.
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

  function handleRunNameInput(event: InputEvent) {
    const target = event.target as HTMLInputElement;
    const inputName = target.value;
    const supportedName = getSupportedRunName(inputName);
    target.value = supportedName;
    formState.runName = supportedName;
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
      <EGFormGroup label="Pipeline" name="pipelineName">
        <EGInput v-model="formState.pipelineName" :disabled="true" />
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
          @input.prevent="handleRunNameInput"
          autofocus
        />
        <EGCharacterCounter :value="runNameCharCount" :max="MAX_RUN_NAME_LENGTH" />
      </EGFormGroup>

      <EGFormGroup label="Description" name="pipelineDescription">
        <EGTextArea v-model="formState.pipelineDescription" :disabled="true" />
      </EGFormGroup>
    </EGCard>
    <div class="flex justify-end pt-4">
      <EGButton
        :disabled="!canProceed"
        :loading="isSubmittingFormData"
        :size="ButtonSizeEnum.enum.sm"
        type="submit"
        label="Save & Continue"
      />
    </div>
  </UForm>
</template>
