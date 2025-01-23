<script setup lang="ts">
  import { FormError } from '#ui/types';
  import { z } from 'zod';
  import { maybeAddFieldValidationErrors } from '@FE/utils/form-utils';
  import { ButtonSizeEnum } from '@FE/types/buttons';
  import { useRunStore } from '@FE/stores';
  import { WorkflowListItem as OmicsWorkflow } from '@aws-sdk/client-omics';

  const emit = defineEmits(['next-step', 'step-validated']);
  const props = defineProps<{
    workflowId: string;
  }>();

  const $route = useRoute();
  const runStore = useRunStore();
  const omicsWorkflowsStore = useOmicsWorkflowsStore();

  const omicsRunTempId = $route.query.omicsRunTempId as string;

  const wipOmicsRun = computed<WipOmicsRunData | undefined>(() => runStore.wipOmicsRuns[omicsRunTempId]);
  const workflow = computed<OmicsWorkflow | undefined>(() => omicsWorkflowsStore.workflows[props.workflowId]);

  const MAX_RUN_NAME_LENGTH = 50;

  const runNameSchema = z
    .string()
    .trim()
    .min(1, 'Workflow run name must be at least 1 character')
    .max(MAX_RUN_NAME_LENGTH, `Workflow run name must be ${MAX_RUN_NAME_LENGTH} characters or less`);

  const formStateSchema = z.object({
    runName: runNameSchema,
  });
  type FormState = z.infer<typeof formStateSchema>;

  const formState = reactive<FormState>({
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
    formState.runName = wipOmicsRun.value?.runName || '';
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
    runStore.updateWipOmicsRun(omicsRunTempId, { runName: safeRunName });
    emit('next-step');
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
      <EGFormGroup label="Workflow" name="workflowName">
        <EGInput :model-value="workflow?.name" :disabled="true" />
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
          placeholder="Enter a name to identify this workflow run"
          @input.prevent="handleRunNameInput"
          autofocus
        />
        <EGCharacterCounter :value="runNameCharCount" :max="MAX_RUN_NAME_LENGTH" />
      </EGFormGroup>

      <EGFormGroup label="Description" name="workflowDescription">
        <EGTextArea :model-value="workflow?.description" :disabled="true" />
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
