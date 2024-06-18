<script setup lang="ts">
import { LabDetailsForm, LabDetailsFormSchema, LabNameSchema, LabDescriptionSchema, LabNextFlowTowerAccessTokenSchema, LabNextFlowTowerWorkspaceIdSchema, FormModeEnum } from '~/types/labs';
import { FormError, FormSubmitEvent } from '#ui/types';
import { CreateLaboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
import { ButtonSizeEnum, ButtonVariantEnum } from '~/types/buttons';
import { useToastStore, useUiStore } from '~/stores/stores';
import { Schema } from 'zod';

const props = withDefaults(defineProps<{
  formMode?: FormModeEnum;
}>(), {
  formMode: FormModeEnum.enum.ReadOnly,
})

const { MOCK_ORG_ID } = useRuntimeConfig().public;
const { $api } = useNuxtApp();
const router = useRouter();

const canSubmit = ref(false);

const state: LabDetailsForm = reactive({
  Name: '',
  Description: '',
  NextFlowTowerAccessToken: '',
  NextFlowTowerWorkspaceId: '',
})

async function onSubmit(event: FormSubmitEvent<LabDetailsForm>) {
  try {
    const formParseResult = LabDetailsFormSchema.safeParse(event.data);
    if (!formParseResult.success) {
      console.error('Form data is invalid; formParseResult', formParseResult);
      throw new Error('Form data is invalid')
    }

    if (props.formMode === FormModeEnum.enum.Create) {
      await handleCreateLab(formParseResult.data);
    } else if (props.formMode === FormModeEnum.enum.Edit) {
      await handleUpdateLabDetails(formParseResult.data);
    }
  } catch (error) {
    useToastStore().error(`Failed to ${props.formMode} lab: ${state.Name}`);
  } finally {
    useUiStore().setRequestPending(false);
  }
}

async function handleCreateLab(labDetails: LabDetailsForm) {
  console.log(`handleCreateLab; labDetails:`, labDetails)

  useUiStore().setRequestPending(true);

  const lab = {
    ...labDetails,
    OrganizationId: MOCK_ORG_ID,
    Status: 'Active'
  } as CreateLaboratory

  await $api.labs.create(lab);

  useToastStore().success(`Successfully created lab: ${lab.Name}`);
  router.push({ path: '/labs' });
}

async function handleUpdateLabDetails(labDetails: LabDetailsForm) {
  console.log('TODO: implement handleUpdateLabDetails; labDetails:', labDetails)
}

/**
 * Validates a single field value against a given schema and adds any resulting validation errors to the provided errors array.
 * This function is used to validate individual fields in the form, allowing for custom validation logic per field.
 * 
 * @param errors - The array to which any discovered validation errors will be added.
 * @param schema - The Zod schema against which the field value will be validated.
 * @param fieldName - The name of the field being validated. Used to associate errors with specific form fields.
 * @param fieldValue - The value of the field being validated. Can be undefined, in which case the schema determines validity.
 */
function maybeAddFieldValidationErrors(errors: FormError[], schema: Schema, fieldName: string, fieldValue: string | undefined): void {
  const parseResult = schema.safeParse(fieldValue)
  if (!parseResult.success) {
    const fieldErrors = parseResult.error.issues.map(({ message }) => ({ path: fieldName, message }))
    fieldErrors.forEach(error => errors.push(error))
  }
}

const validate = (state: LabDetailsForm): FormError[] => {
  const errors: FormError[] = []

  maybeAddFieldValidationErrors(errors, LabNameSchema, 'Name', state.Name)
  maybeAddFieldValidationErrors(errors, LabDescriptionSchema, 'Description', state.Description)
  maybeAddFieldValidationErrors(errors, LabNextFlowTowerAccessTokenSchema, 'NextFlowTowerAccessToken', state.NextFlowTowerAccessToken)
  maybeAddFieldValidationErrors(errors, LabNextFlowTowerWorkspaceIdSchema, 'NextFlowTowerWorkspaceId', state.NextFlowTowerWorkspaceId)

  canSubmit.value = errors.length === 0

  return errors
}
</script>

<template>
  <UForm :validate="validate" :schema="LabDetailsFormSchema" :state="state" @submit="onSubmit">
    <EGCard>
      <EGFormGroup label="Lab Name*" name="Name">
        <EGInput v-model="state.Name" :disabled="props.formMode === FormModeEnum.enum.ReadOnly"
          placeholder="Enter lab name (required and must be unique)" required autofocus />
      </EGFormGroup>
      <EGFormGroup label="Lab Description" name="Description">
        <EGTextArea v-model="state.Description" :disabled="props.formMode === FormModeEnum.enum.ReadOnly"
          placeholder="Describe your lab and what runs should be launched by Lab users." />
      </EGFormGroup>
      <EGFormGroup label="Personal Access Token" name="NextFlowTowerAccessToken">
        <EGPasswordInput v-model="state.NextFlowTowerAccessToken" :password="true"
          :disabled="props.formMode === FormModeEnum.enum.ReadOnly" />
      </EGFormGroup>
      <EGFormGroup label="Workspace ID" name="NextFlowTowerWorkspaceId">
        <EGInput v-model="state.NextFlowTowerWorkspaceId" :disabled="props.formMode === FormModeEnum.enum.ReadOnly" />
      </EGFormGroup>
    </EGCard>
    <div class="flex space-x-2 mt-6">
      <EGButton :disabled="!canSubmit" :loading="useUiStore().isRequestPending" :size="ButtonSizeEnum.enum.sm"
        type="submit" label="Create Lab" />
      <EGButton :size="ButtonSizeEnum.enum.sm" :variant="ButtonVariantEnum.enum.secondary"
        :disabled="useUiStore().isRequestPending" label="Cancel" name="cancel" @click="$router.go(-1)" />
    </div>
  </UForm>
</template>
