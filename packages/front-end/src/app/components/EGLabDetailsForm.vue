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
  } from '@FE/types/labs';
  import { AutoCompleteOptionsEnum } from '@FE/types/forms';
  import { FormError } from '#ui/types';
  import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
  import { ButtonSizeEnum, ButtonVariantEnum } from '@FE/types/buttons';
  import { useToastStore, useUiStore } from '@FE/stores';
  import useUserStore from '@FE/stores/user';
  import { maybeAddFieldValidationErrors } from '@FE/utils/form-utils';
  import {
    CreateLaboratory,
    CreateLaboratorySchema,
    ReadLaboratorySchema,
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

  const { $api } = useNuxtApp();
  const $route = useRoute();
  const router = useRouter();

  const labId: string = $route.params.labId as string;

  const formMode = ref(props.formMode);
  const s3Directories = ref([]);
  const isLoadingBuckets = ref(false);
  const isLoadingFormData = ref(false);
  const canSubmit = ref(false);
  const isSubmittingFormData = ref(false);

  // Enable/disable fields default
  const isNameFieldDisabled = ref(true);
  const isDescriptionFieldDisabled = ref(true);
  const isNextFlowTowerWorkspaceIdFieldDisabled = ref(true);

  // Hide/show fields default
  const isNextFlowTowerAccessTokenFieldHidden = ref(true);

  const defaultState: LabDetails = {
    Name: '',
    Description: '',
    NextFlowTowerAccessToken: '',
    NextFlowTowerWorkspaceId: '',
    S3Bucket: '',
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
    } else if (newFormMode === LabDetailsFormModeEnum.enum.Create || newFormMode === LabDetailsFormModeEnum.enum.Edit) {
      // enable fields
      isNameFieldDisabled.value = false;
      isDescriptionFieldDisabled.value = false;
      isNextFlowTowerWorkspaceIdFieldDisabled.value = false;

      // show fields
      isNextFlowTowerAccessTokenFieldHidden.value = false;
    }
  }

  onMounted(async () => {
    await getS3Buckets();

    if (formMode.value !== LabDetailsFormModeEnum.enum.Create) {
      await getLabDetails();
    }
    switchToFormMode(formMode.value);
  });

  /**
   * Stores the currently selected S3 bucket.
   *
   * - The getter checks if there are any S3 directories available.
   *   - If no directories are available, it returns 'No S3 Buckets found'.
   *   - Otherwise, it returns a matched bucket; if none found, a call to action
   *     is displayed.
   *
   * - The setter updates the application's state with the new S3 bucket value.
   */
  const selectedS3Bucket = computed({
    get() {
      if (isLoadingBuckets.value) {
        return 'Retrieving S3 Buckets...';
      } else if (!s3Directories.value.length && !isLoadingBuckets.value) {
        return 'No S3 Buckets found';
      }
      const matchedBucket = s3Directories.value.find((dir) => dir === state.value.S3Bucket);
      return matchedBucket || undefined;
    },
    set(newValue) {
      state.value.S3Bucket = newValue;
    },
  });

  const isS3BucketSelected = computed(() => selectedS3Bucket.value);

  async function getS3Buckets() {
    try {
      isLoadingBuckets.value = true;
      s3Directories.value = await $api.infra.s3Buckets().then((res) => res.map((bucket) => bucket.Name));
    } catch (error) {
      useToastStore().error('Failed to retrieve S3 buckets');
    } finally {
      isLoadingBuckets.value = false;
    }
  }

  /**
   * Retrieves the lab details from the server and sets the form state.
   */
  async function getLabDetails() {
    try {
      isLoadingFormData.value = true;
      const res = await $api.labs.labDetails($route.params.labId);
      const parseResult = ReadLaboratorySchema.safeParse(res);

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

  /**
   * Cancel current edit operation.
   *
   * It resets the state value to the original unedited lab details,  turns off the editing mode for the Nextflow Tower
   * access token, disables the submit button, and switches the form mode to read-only.
   *
   * @return {void}
   */
  function handleCancelEdit() {
    state.value = { ...uneditedLabDetails.value! };
    isEditingNextFlowTowerAccessToken.value = false;
    canSubmit.value = false;
    switchToFormMode(LabDetailsFormModeEnum.enum.ReadOnly);
  }

  /**
   * Handles form submission for various lab detail modes such as Create and Edit.
   *
   * This method will not perform any actions if the form mode is set to ReadOnly.
   * It manages the process state and triggers appropriate form handlers based on the current form mode.
   *
   * @return {Promise<void>} A promise that resolves when the form submission process is complete.
   */
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
      useToastStore().error(`Invalid Workspace ID or Personal Access Token. Please try again.`);
    } finally {
      isSubmittingFormData.value = false;
      useUiStore().setRequestPending(false);
    }
  }

  async function handleCreateLab() {
    useUiStore().setRequestPending(true);

    const lab: CreateLaboratory = {
      ...state.value,
      OrganizationId: useUserStore().currentOrgId,
      Status: 'Active',
    };

    const parseResult = CreateLaboratorySchema.safeParse(lab);
    if (!parseResult.success) {
      const message = 'Create lab failed to parse lab details';
      console.error(`${message}; parseResult: `, parseResult);
      throw new Error(message);
    }

    const newLab = parseResult.data as CreateLaboratory;

    const res = await $api.labs.create(newLab);
    if (!res) {
      useToastStore().error(`Failed to verify details for ${state.value.Name}`);
    }

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

    const lab: UpdateLaboratory = parseResult.data;

    const res = await $api.labs.update(labId, lab);
    if (!res) {
      useToastStore().error(`Failed to verify details for ${state.value.Name}`);
    }

    isEditingNextFlowTowerAccessToken.value = false;
    switchToFormMode(LabDetailsFormModeEnum.enum.ReadOnly);
    await getLabDetails();

    useToastStore().success(`${lab.Name} successfully updated`);
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

    checkCanSubmitFormData(errors.length);

    return errors;
  };

  /**
   * Checks if the form can be submitted based on the number of validation errors.
   * @param validationErrorCount
   */
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

  /**
   * Determines if the form data has changed from the original lab details.
   * @returns {boolean} True if the form data has changed, otherwise false.
   */
  function formDataChanged(): boolean {
    if (formMode.value === LabDetailsFormModeEnum.enum.Edit) {
      for (const key of Object.keys(state.value)) {
        if (state.value[key] !== uneditedLabDetails.value?.[key]) {
          // Special handling to assist with the password field display state
          if (key === 'NextFlowTowerAccessToken') {
            isEditingNextFlowTowerAccessToken.value = true;
          }
          return true;
        }
      }
    }
    return false;
  }

  watch(
    state,
    (newState) => {
      validate(newState);
    },
    { deep: true },
  );
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

      <EGFormGroup
        v-if="useUserStore().isOrgAdmin(useUserStore().currentOrgId)"
        label="Default S3 bucket directory"
        name="DefaultS3BucketDirectory"
      >
        <EGSelect
          :options="s3Directories"
          v-model="selectedS3Bucket"
          :disabled="isNextFlowTowerWorkspaceIdFieldDisabled"
          placeholder="Please select an S3 bucket from the list below"
          searchable-placeholder="Search existing S3 buckets..."
        />
      </EGFormGroup>

      <!-- Next Flow Tower Workspace ID -->
      <EGFormGroup label="Workspace ID" name="NextFlowTowerWorkspaceId" eager-validation>
        <EGInput
          v-model="state.NextFlowTowerWorkspaceId"
          placeholder="Defaults to the Next Flow Tower personal workspace if not specified."
          :disabled="isNextFlowTowerWorkspaceIdFieldDisabled"
        />
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
          placeholder="Add or update the Next Flow Tower personal access token. Note: A previously set token will never be shown."
          :show-toggle-password-button="isEditingNextFlowTowerAccessToken"
          :autocomplete="AutoCompleteOptionsEnum.enum.Off"
          eager-validation
        />
      </EGFormGroup>
    </EGCard>

    <!-- Form Buttons: Create Mode -->
    <div v-if="formMode === LabDetailsFormModeEnum.enum.Create" class="mt-6 flex space-x-2">
      <EGButton
        :disabled="!canSubmit || !isS3BucketSelected"
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
        @click="$router.push(useUiStore().previousPageRoute)"
      />
    </div>

    <!-- Form Buttons: Read Mode -->
    <div v-if="formMode === LabDetailsFormModeEnum.enum.ReadOnly" class="mt-6 flex space-x-2">
      <EGButton
        :size="ButtonSizeEnum.enum.sm"
        type="submit"
        label="Edit"
        :disabled="!useUserStore().canEditLab(useUserStore().currentOrgId, labId)"
        @click="switchToFormMode(LabDetailsFormModeEnum.enum.Edit)"
      />
    </div>

    <!-- Form Buttons: Edit Mode -->
    <div v-if="formMode === LabDetailsFormModeEnum.enum.Edit" class="mt-6 flex space-x-2">
      <EGButton
        :disabled="!canSubmit || !isS3BucketSelected"
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
