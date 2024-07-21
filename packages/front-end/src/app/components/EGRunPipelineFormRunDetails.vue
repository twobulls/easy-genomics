<script setup lang="ts">
  import { FormError } from '#ui/types';
  import { z } from 'zod';
  import { maybeAddFieldValidationErrors } from '~/utils/form-utils';
  import { ButtonSizeEnum } from '~/types/buttons';
  import { usePipelineRunStore } from '~/stores';

  const props = defineProps<{
    pipelineName: string;
    pipelineDescription: string;
  }>();

  const { $api } = useNuxtApp();
  const emit = defineEmits(['next-tab']);

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
  const maxRunNameLength = ref(MAX_TOTAL_LENGTH - props.pipelineName.length - 8 - 15 - 2);

  const runNameSchema = z
    .string()
    .trim()
    .min(1, 'Pipeline run name must be at least 1 character')
    .max(maxRunNameLength.value, `Pipeline run name must be ${maxRunNameLength.value} characters or less`);

  const formStateSchema = z.object({
    pipelineDescription: z.string().default(''), // Seqera API spec doesn't define a max length for pipeline description
    pipelineName: z.string(), // Seqera API spec doesn't define a max length for pipeline name a.k.a action name e.g. nf-core-viralrecon
    runName: runNameSchema,
  });
  type FormState = z.infer<typeof formStateSchema>;

  const formState = reactive<FormState>({
    pipelineDescription: props.pipelineDescription,
    pipelineName: props.pipelineName,
    runName: '',
  });

  const canProceed = ref(false);
  const isSubmittingFormData = ref(false);
  const runNameCharCount = computed(() => formState.runName.length);

  /**
   * Pre-fill the run name with the user's pipeline run name if it exists.
   *
   */
  onBeforeMount(async () => {
    formState.runName = usePipelineRunStore().userPipelineRunName;
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

  // TODO: wire up full pipeline once backend is ready
  // function onSubmit() {
  //   usePipelineRunStore().setUserPipelineRunName(formState.runName);
  //   emit('next-tab');
  // }

  // TODO: temporarily skip full pipeline and submit job
  function onSubmit() {
    usePipelineRunStore().setUserPipelineRunName(formState.runName);
    emit('next-tab');
  }
</script>

<template>
  <UForm :schema="formStateSchema" :state="formState" :validate="validate" @submit="onSubmit">
    <EGFormGroup label="Pipeline" name="pipelineName">
      <EGInput v-model="formState.pipelineName" :disabled="true" />
    </EGFormGroup>

    <EGFormGroup label="Run Name" name="runName" eager-validation>
      <EGInput v-model="formState.runName" placeholder="Enter a name to identify this pipeline run" autofocus />
      <EGCharacterCounter :value="runNameCharCount" :max="maxRunNameLength" />
    </EGFormGroup>

    <EGFormGroup label="Description" name="pipelineDescription">
      <EGTextArea v-model="formState.pipelineDescription" :disabled="true" />
    </EGFormGroup>

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
