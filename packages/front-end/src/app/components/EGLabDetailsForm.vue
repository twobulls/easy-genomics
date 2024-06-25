<script setup lang="ts">
  import {
    LabDetailsInput,
    LabDetailsInputSchema,
    LabNameSchema,
    LabDescriptionSchema,
    NextFlowTowerAccessTokenInputSchema,
    NextFlowTowerWorkspaceIdInputSchema,
    LabDetailsFormModeEnum,
    LabDetailsSchema,
  } from '~/types/labs';
  import { FormError, FormSubmitEvent } from '#ui/types';
  import { CreateLaboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
  import { ButtonSizeEnum, ButtonVariantEnum } from '~/types/buttons';
  import { useToastStore, useUiStore } from '~/stores';
  import { Schema } from 'zod';

  const props = withDefaults(
    defineProps<{
      formMode?: LabDetailsFormModeEnum;
    }>(),
    {
      formMode: LabDetailsFormModeEnum.enum.ReadOnly,
    }
  );

  const formMode = ref(props.formMode);

  const { MOCK_ORG_ID } = useRuntimeConfig().public;

  const { $api } = useNuxtApp();
  const $route = useRoute();
  const router = useRouter();

  const isLoadingFormData = ref(false);
  const canSubmit = ref(false);

  // Enable/disable fields default
  const isNameFieldDisabled = ref(true);
  const isDescriptionFieldDisabled = ref(true);
  const isNextFlowTowerWorkspaceIdFieldDisabled = ref(true);

  // Hide/show fields default
  const isNextFlowTowerAccessTokenFieldHidden = ref(true);

  const defaultState: LabDetailsInput = {
    Name: '',
    Description: '',
    NextFlowTowerAccessToken: '',
    NextFlowTowerWorkspaceId: '',
  };

  const state = ref({ ...defaultState });

  /**
   * Switches the form input fields disabled/hidden states based on the form mode.
   */
  function switchToFormMode(newFormMode: LabDetailsFormModeEnum) {
    if (formMode.value !== newFormMode) {
      formMode.value = newFormMode;
    }

    if (newFormMode === LabDetailsFormModeEnum.enum.Create || newFormMode === LabDetailsFormModeEnum.enum.Edit) {
      isNameFieldDisabled.value = false;
      isDescriptionFieldDisabled.value = false;
      isNextFlowTowerWorkspaceIdFieldDisabled.value = false;
      isNextFlowTowerAccessTokenFieldHidden.value = false;
    }
  }

  onMounted(async () => {
    if (formMode.value !== LabDetailsFormModeEnum.enum.Create) {
      await getLabDetails();
    }
    switchToFormMode(formMode.value);
  });

  async function getLabDetails() {
    try {
      isLoadingFormData.value = true;
      const res = await $api.labs.getLabDetails($route.params.id);
      const parseResult = LabDetailsSchema.safeParse(res);

      if (parseResult.success) {
        state.value = { ...state.value, ...parseResult.data };
      } else {
        throw new Error('Failed to parse lab details');
      }
    } catch (error) {
      useToastStore().error(`Failed to retrieve lab details for lab: ${state.Name}`);
    } finally {
      isLoadingFormData.value = false;
    }
  }

  async function onSubmit(event: FormSubmitEvent<LabDetailsInput>) {
    if (formMode.value === LabDetailsFormModeEnum.enum.ReadOnly) return;

    try {
      const formParseResult = LabDetailsInputSchema.safeParse(event.data);
      if (!formParseResult.success) {
        throw new Error('Form data is invalid');
      }

      if (formMode.value === LabDetailsFormModeEnum.enum.Create) {
        await handleCreateLab(formParseResult.data);
      } else if (formMode.value === LabDetailsFormModeEnum.enum.Edit) {
        await handleUpdateLabDetails(formParseResult.data);
      }
    } catch (error) {
      useToastStore().error(`Failed to ${formMode.value} lab: ${state.Name}`);
    } finally {
      useUiStore().setRequestPending(false);
    }
  }

  async function handleCreateLab(labDetails: LabDetailsInput) {
    useUiStore().setRequestPending(true);

    const lab = {
      ...labDetails,
      OrganizationId: MOCK_ORG_ID,
      Status: 'Active',
    } as CreateLaboratory;

    await $api.labs.create(lab);

    useToastStore().success(`Successfully created lab: ${lab.Name}`);
    router.push({ path: '/labs' });
  }

  // TODO: EG-506: [FE] Editing Lab Details
  async function handleUpdateLabDetails(labDetails: LabDetailsInput) {
    console.log('TODO: implement handleUpdateLabDetails; labDetails:', labDetails);
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
  function maybeAddFieldValidationErrors(
    errors: FormError[],
    schema: Schema,
    fieldName: string,
    fieldValue: string | undefined
  ): void {
    const parseResult = schema.safeParse(fieldValue);
    if (!parseResult.success) {
      const fieldErrors = parseResult.error.issues.map(({ message }) => ({ path: fieldName, message }));
      fieldErrors.forEach((error) => errors.push(error));
    }
  }

  const validate = (state: LabDetailsInput): FormError[] => {
    const errors: FormError[] = [];

    maybeAddFieldValidationErrors(errors, LabNameSchema, 'Name', state.Name);
    maybeAddFieldValidationErrors(errors, LabDescriptionSchema, 'Description', state.Description);
    maybeAddFieldValidationErrors(
      errors,
      NextFlowTowerAccessTokenInputSchema,
      'NextFlowTowerAccessToken',
      state.NextFlowTowerAccessToken
    );
    maybeAddFieldValidationErrors(
      errors,
      NextFlowTowerWorkspaceIdInputSchema,
      'NextFlowTowerWorkspaceId',
      state.NextFlowTowerWorkspaceId
    );

    // Update the canSubmit flag based on the number of errors
    canSubmit.value = errors.length === 0;

    return errors;
  };
</script>

<template>
  <USkeleton v-if="isLoadingFormData" class="min-h-96 w-full" />
  <UForm v-else :validate="validate" :schema="LabDetailsInputSchema" :state="state" @submit="onSubmit">
    <EGCard>
      <EGFormGroup label="Lab Name" name="Name" eager-validation>
        <EGInput
          v-model="state.Name"
          :disabled="isNameFieldDisabled"
          placeholder="Enter lab name (required and must be unique)"
          required
          autofocus
        />
      </EGFormGroup>
      <EGFormGroup label="Lab Description" name="Description">
        <EGTextArea
          v-model="state.Description"
          :disabled="isDescriptionFieldDisabled"
          placeholder="Describe your lab and what runs should be launched by Lab users."
        />
      </EGFormGroup>
      <EGFormGroup
        v-if="!isNextFlowTowerAccessTokenFieldHidden"
        label="Personal Access Token"
        name="NextFlowTowerAccessToken"
      >
        <EGPasswordInput
          v-model="state.NextFlowTowerAccessToken"
          :password="true"
          :disabled="formMode === LabDetailsFormModeEnum.enum.ReadOnly"
        />
      </EGFormGroup>
      <EGFormGroup label="Workspace ID" name="NextFlowTowerWorkspaceId">
        <EGInput v-model="state.NextFlowTowerWorkspaceId" :disabled="isNextFlowTowerWorkspaceIdFieldDisabled" />
      </EGFormGroup>
    </EGCard>
    <div v-if="formMode !== LabDetailsFormModeEnum.enum.ReadOnly" class="mt-6 flex space-x-2">
      <EGButton
        :disabled="!canSubmit"
        :loading="useUiStore().isRequestPending"
        :size="ButtonSizeEnum.enum.sm"
        type="submit"
        label="Create Lab"
      />
      <EGButton
        :size="ButtonSizeEnum.enum.sm"
        :variant="ButtonVariantEnum.enum.secondary"
        :disabled="useUiStore().isRequestPending"
        label="Cancel"
        name="cancel"
        @click="$router.go(-1)"
      />
    </div>
  </UForm>
</template>
