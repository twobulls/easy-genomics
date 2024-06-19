<script setup lang="ts">
import { LabDetailsForm, LabDetailsFormSchema, LabNameSchema, LabDescriptionSchema, LabNextFlowTowerAccessTokenSchema, LabNextFlowTowerWorkspaceIdSchema, FormModeEnum, LabDetailsSchema } from '~/types/labs';
import { FormError, FormSubmitEvent } from '#ui/types';
import { CreateLaboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
import { ButtonSizeEnum, ButtonVariantEnum } from '~/types/buttons';
import { useToastStore, useUiStore } from '~/stores/stores';
import { Schema } from 'zod';

type InputProps = {
  formMode?: FormModeEnum;
}

const props: InputProps = withDefaults(defineProps(), {
  formMode: FormModeEnum.enum.Create,
})

const { MOCK_ORG_ID } = useRuntimeConfig().public;

const { $api } = useNuxtApp();
const $route = useRoute();
const router = useRouter();

const isLoadingFormData = ref(false);
const canSubmit = ref(false);

const defaultState: LabDetailsForm = {
  Name: '',
  Description: '',
  NextFlowTowerAccessToken: '',
  NextFlowTowerWorkspaceId: '',
}

const state: LabDetailsForm = reactive(defaultState)

onMounted(async () => {
  if (props.formMode === FormModeEnum.enum.Edit || props.formMode === FormModeEnum.enum.ReadOnly) {
    await getLabDetails();
  }
})

async function getLabDetails() {
  try {
    isLoadingFormData.value = true;
    const res = await $api.labs.getLabDetails($route.params.id);

    // TODO: determine how to handle the encoded NextFlowTowerAccessToken from the server
    // - it is longer than 128-characters, so fails parsing using the LabNextFlowTowerAccessTokenSchema
    // - how to decode it?
    // - what if anything to display in the form? e.g. show the last 4-characters like a credit card?
    res.NextFlowTowerAccessToken = 'token-has-been-replaced';

    const parseResult = LabDetailsSchema.safeParse(res);
    if (parseResult.success) {
      console.log('getLabDetails; parseResult.data:', parseResult.data);
      Object.assign(state, parseResult.data);
    } else {
      console.error('getLabDetails; parseResult:', parseResult);
      const fieldErrors = parseResult.error.issues.map(({ message }) => ({ message }))
      console.log('getLabDetails; fieldErrors:', fieldErrors);
    }
  } catch (error) {
    useToastStore().error(`Failed to retrieve lab details for lab: ${state.Name}`);
  } finally {
    isLoadingFormData.value = false;
  }
}

async function onSubmit(event: FormSubmitEvent<LabDetailsForm>) {
  if (props.formMode === FormModeEnum.enum.ReadOnly) return;

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
  <USkeleton v-if="isLoadingFormData" class="min-h-96 w-full" />
  <UForm v-else :validate="validate" :schema="LabDetailsFormSchema" :state="state" @submit="onSubmit">
    <EGCard>
      <EGFormGroup label="Lab Name" name="Name">
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
    <div v-if="props.formMode !== FormModeEnum.enum.ReadOnly" class="flex space-x-2 mt-6">
      <EGButton :disabled="!canSubmit" :loading="useUiStore().isRequestPending" :size="ButtonSizeEnum.enum.sm"
        type="submit" label="Create Lab" />
      <EGButton :size="ButtonSizeEnum.enum.sm" :variant="ButtonVariantEnum.enum.secondary"
        :disabled="useUiStore().isRequestPending" label="Cancel" name="cancel" @click="$router.go(-1)" />
    </div>
  </UForm>
</template>
