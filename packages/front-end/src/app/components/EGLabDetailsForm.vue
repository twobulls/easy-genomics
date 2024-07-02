<script setup lang="ts">
  import {
    LabDetails,
    LabDetailsSchema,
    LabNameSchema,
    LabDescriptionSchema,
    NextFlowTowerAccessTokenSchema,
    NextFlowTowerWorkspaceIdSchema,
    LabDetailsFormModeEnum,
    LabDetailsFormMode,
    S3BucketSchema,
  } from '~/types/labs';
  import { AutoCompleteOptionsEnum } from '~/types/forms';
  import { FormError } from '#ui/types';
  import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
  import { ButtonSizeEnum, ButtonVariantEnum } from '~/types/buttons';
  import { useToastStore, useUiStore } from '~/stores';
  import { Schema } from 'zod';
  import {
    CreateLaboratory,
    CreateLaboratorySchema,
    LaboratorySchema,
    UpdateLaboratory,
    UpdateLaboratorySchema,
  } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/laboratory';

  const props = withDefaults(
    defineProps<{
      formMode?: LabDetailsFormMode;
    }>(),
    {
      formMode: LabDetailsFormModeEnum.enum.ReadOnly,
    },
  );

  const formMode = ref(props.formMode);

  const { MOCK_ORG_ID } = useRuntimeConfig().public;

  const { $api } = useNuxtApp();
  const $route = useRoute();
  const router = useRouter();

  const isLoadingFormData = ref(false);
  const canSubmit = ref(false);
  const isSubmittingFormData = ref(false);

  // Enable/disable fields default
  const isNameFieldDisabled = ref(true);
  const isDescriptionFieldDisabled = ref(true);
  const isNextFlowTowerWorkspaceIdFieldDisabled = ref(true);

  // Hide/show fields default
  const isNextFlowTowerAccessTokenFieldHidden = ref(true);
  const isS3BucketFieldHidden = ref(true);

  const defaultState: LabDetails = {
    Name: '',
    Description: '',
    NextFlowTowerAccessToken: '',
    NextFlowTowerWorkspaceId: '',
  };

  const state = ref({ ...defaultState } as Laboratory);

  /**
   * Edit Mode and Next Flow Tower Access Token Field
   *
   * Custom logic is required for managing the possible states of the Next Flow Tower Access Token field
   * when in Edit Mode.
   *
   * This is due to the value from the database being the encrypted token. The user should not be able
   * to toggle the password visibility of the field unless they have made a change to the field. This is
   * because they user will not be able to compare the encrypted value with the value previously set.
   */

  // Edit Mode
  // Store the lab details from the server to support the cancel button in Edit mode
  const uneditedLabDetails: Ref<Laboratory | undefined> = ref(undefined);

  // Edit Mode
  // Determine if the NextFlowTowerAccessToken field is being edited to assist with
  // the password field display state
  const isEditingNextFlowTowerAccessToken = ref(false);

  /**
   * Switches the form input fields disabled/hidden states based on the form mode.
   */
  function switchToFormMode(newFormMode: LabDetailsFormMode) {
    if (formMode.value !== newFormMode) {
      formMode.value = newFormMode;
    }

    if (newFormMode === LabDetailsFormModeEnum.enum.ReadOnly) {
      // disable fields
      isNameFieldDisabled.value = true;
      isDescriptionFieldDisabled.value = true;
      isNextFlowTowerWorkspaceIdFieldDisabled.value = true;

      // hide fields
      isNextFlowTowerAccessTokenFieldHidden.value = true;
      isS3BucketFieldHidden.value = true;
    } else if (newFormMode === LabDetailsFormModeEnum.enum.Create || newFormMode === LabDetailsFormModeEnum.enum.Edit) {
      // enable fields
      isNameFieldDisabled.value = false;
      isDescriptionFieldDisabled.value = false;
      isNextFlowTowerWorkspaceIdFieldDisabled.value = false;

      // show fields
      isNextFlowTowerAccessTokenFieldHidden.value = false;
      isS3BucketFieldHidden.value = false;
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
      const parseResult = LaboratorySchema.safeParse(res);

      if (parseResult.success) {
        const labDetails = parseResult.data as Laboratory;
        state.value = { ...state.value, ...labDetails };
        // Store the unedited lab details to support the cancel button in Edit mode
        uneditedLabDetails.value = { ...labDetails };
      } else {
        throw new Error('Failed to parse lab details');
      }
    } catch (error) {
      useToastStore().error(`Failed to retrieve lab details for lab: ${state.value.Name}`);
    } finally {
      isLoadingFormData.value = false;
    }
  }

  function handleCancelEdit() {
    state.value = { ...uneditedLabDetails.value! };
    isEditingNextFlowTowerAccessToken.value = false;
    canSubmit.value = false;
    switchToFormMode(LabDetailsFormModeEnum.enum.ReadOnly);
  }

  async function onSubmit() {
    if (formMode.value === LabDetailsFormModeEnum.enum.ReadOnly) return;

    try {
      isSubmittingFormData.value = true;

      if (formMode.value === LabDetailsFormModeEnum.enum.Create) {
        await handleCreateLab();
      } else if (formMode.value === LabDetailsFormModeEnum.enum.Edit) {
        await handleUpdateLabDetails();
      }
    } catch (error) {
      useToastStore().error(`Failed to ${formMode.value} lab: ${state.value.Name}`);
    } finally {
      isSubmittingFormData.value = false;
      useUiStore().setRequestPending(false);
    }
  }

  async function handleCreateLab() {
    useUiStore().setRequestPending(true);

    const lab = {
      ...state.value,
      OrganizationId: MOCK_ORG_ID,
      Status: 'Active',
    };

    const parseResult = CreateLaboratorySchema.safeParse(lab);
    if (!parseResult.success) {
      const message = 'Create lab failed to parse lab details';
      console.error(`${message}; parseResult: `, parseResult);
      throw new Error(message);
    }

    const newLab = parseResult.data as CreateLaboratory;

    await $api.labs.create(newLab);

    useToastStore().success(`Successfully created lab: ${newLab.Name}`);
    router.push({ path: '/labs' });
  }

  // Submits the values from state instead of the form event values to align create
  // and edit data types with those expected by and validated in the backend. The
  // types can have more properties than the form fields.
  // e.g, LaboratoryId or CreatedAt
  async function handleUpdateLabDetails() {
    useUiStore().setRequestPending(true);

    const parseResult = UpdateLaboratorySchema.safeParse(state.value);

    if (!parseResult.success) {
      const message = 'Update lab failed to parse lab details';
      console.error(`${message}; parseResult: `, parseResult);
      throw new Error(message);
    }

    const lab = parseResult.data as UpdateLaboratory;

    await $api.labs.update(lab);
    isEditingNextFlowTowerAccessToken.value = false;
    switchToFormMode(LabDetailsFormModeEnum.enum.ReadOnly);
    await getLabDetails();

    useToastStore().success(`Successfully updated lab: ${lab.Name}`);
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
    fieldValue: string | undefined,
  ): void {
    const parseResult = schema.safeParse(fieldValue);
    if (!parseResult.success) {
      const fieldErrors = parseResult.error.issues.map(({ message }) => ({ path: fieldName, message }));
      fieldErrors.forEach((error) => errors.push(error));
    }
  }

  const validate = (state: LabDetails): FormError[] => {
    const errors: FormError[] = [];

    maybeAddFieldValidationErrors(errors, LabNameSchema, 'Name', state.Name);
    maybeAddFieldValidationErrors(errors, LabDescriptionSchema, 'Description', state.Description);

    maybeAddFieldValidationErrors(
      errors,
      NextFlowTowerAccessTokenSchema,
      'NextFlowTowerAccessToken',
      state.NextFlowTowerAccessToken,
    );

    maybeAddFieldValidationErrors(
      errors,
      NextFlowTowerWorkspaceIdSchema,
      'NextFlowTowerWorkspaceId',
      state.NextFlowTowerWorkspaceId,
    );

    if (formMode.value === LabDetailsFormModeEnum.enum.Edit) {
      maybeAddFieldValidationErrors(errors, S3BucketSchema, 'S3Bucket', state.S3Bucket);
    }

    // Check if the form can be submitted based on the number of validation errors
    checkCanSubmitFormData(errors.length);

    return errors;
  };

  function checkCanSubmitFormData(validationErrorCount: number = 0) {
    const noValidationErrors = validationErrorCount === 0;
    if (formMode.value === LabDetailsFormModeEnum.enum.Create) {
      // In Create mode, the form can be submitted if there are no validation errors
      canSubmit.value = noValidationErrors;
    } else if (formMode.value === LabDetailsFormModeEnum.enum.Edit) {
      // In Edit mode, the form can be submitted if there are no validation errors and the form data has changed
      const dataChanged = formDataChanged();
      canSubmit.value = noValidationErrors && dataChanged;
    }
  }

  // Edit Mode: iterate over the keys of the state object and compare the value with the uneditedLabDetails
  // from the database. Returns true if there is a change, otherwise returns false.
  function formDataChanged(): boolean {
    if (formMode.value === LabDetailsFormModeEnum.enum.Edit) {
      const keys = Object.keys(state.value);
      for (const key of keys) {
        const valuesMatch = state.value[key] === uneditedLabDetails.value[key];
        // Special handling for NextFlowTowerAccessToken field to assist with the password field display state
        if (key === 'NextFlowTowerAccessToken') {
          isEditingNextFlowTowerAccessToken.value = !valuesMatch;
        }
        if (!valuesMatch) {
          return true;
        }
      }
    }
    return false;
  }
</script>

<template>
  <USkeleton v-if="isLoadingFormData" class="min-h-96 w-full" />
  <UForm v-else :validate="validate" :schema="LabDetailsSchema" :state="state" @submit="onSubmit">
    <EGCard>
      <!-- Lab Name -->
      <EGFormGroup label="Lab Name" name="Name" eager-validation>
        <EGInput
          v-model="state.Name"
          :disabled="isNameFieldDisabled"
          placeholder="Enter lab name (required and must be unique)"
          required
          autofocus
        />
      </EGFormGroup>

      <!-- Lab Description -->
      <EGFormGroup label="Lab Description" name="Description" eager-validation>
        <EGTextArea
          v-model="state.Description"
          :disabled="isDescriptionFieldDisabled"
          placeholder="Describe your lab and what runs should be launched by Lab users."
        />
      </EGFormGroup>

      <!-- Next Flow Tower Workspace ID -->
      <EGFormGroup label="Workspace ID" name="NextFlowTowerWorkspaceId" eager-validation>
        <EGInput v-model="state.NextFlowTowerWorkspaceId" :disabled="isNextFlowTowerWorkspaceIdFieldDisabled" />
      </EGFormGroup>

      <!-- Next Flow Tower Access Token -->
      <EGFormGroup
        v-if="!isNextFlowTowerAccessTokenFieldHidden"
        label="Personal Access Token"
        name="NextFlowTowerAccessToken"
        eager-validation
      >
        <!-- Next Flow Tower Access Token: Create  Mode -->
        <EGPasswordInput
          v-if="formMode === LabDetailsFormModeEnum.enum.Create"
          v-model="state.NextFlowTowerAccessToken"
          :password="true"
          :autocomplete="AutoCompleteOptionsEnum.enum.Off"
        />
        <!-- Next Flow Tower Access Token: Edit  Mode -->
        <EGPasswordInput
          v-if="formMode === LabDetailsFormModeEnum.enum.Edit"
          v-model="state.NextFlowTowerAccessToken"
          :select-on-focus="true"
          :password="true"
          :show-toggle-password-button="isEditingNextFlowTowerAccessToken"
          :autocomplete="AutoCompleteOptionsEnum.enum.Off"
          eager-validation
        />
      </EGFormGroup>

      <!-- S3 Bucket -->
      <EGFormGroup v-if="!isS3BucketFieldHidden" label="S3 Bucket" name="S3Bucket" eager-validation>
        <EGInput v-model="state.S3Bucket" />
      </EGFormGroup>
    </EGCard>

    <!-- Form Buttons: Create Mode -->
    <div v-if="formMode === LabDetailsFormModeEnum.enum.Create" class="mt-6 flex space-x-2">
      <EGButton
        :disabled="!canSubmit"
        :loading="isSubmittingFormData"
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

    <!-- Form Buttons: Read Mode -->
    <div v-if="formMode === LabDetailsFormModeEnum.enum.ReadOnly" class="mt-6 flex space-x-2">
      <EGButton
        :size="ButtonSizeEnum.enum.sm"
        type="submit"
        label="Edit"
        @click="switchToFormMode(LabDetailsFormModeEnum.enum.Edit)"
      />
    </div>

    <!-- Form Buttons: Edit Mode -->
    <div v-if="formMode === LabDetailsFormModeEnum.enum.Edit" class="mt-6 flex space-x-2">
      <EGButton
        :disabled="!canSubmit"
        :loading="isSubmittingFormData"
        :size="ButtonSizeEnum.enum.sm"
        type="submit"
        label="Save Changes"
      />
      <EGButton
        :size="ButtonSizeEnum.enum.sm"
        :variant="ButtonVariantEnum.enum.secondary"
        :disabled="isSubmittingFormData"
        label="Cancel"
        name="cancel"
        @click="handleCancelEdit"
      />
    </div>
  </UForm>
</template>
