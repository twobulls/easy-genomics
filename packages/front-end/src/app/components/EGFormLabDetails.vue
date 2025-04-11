<script setup lang="ts">
  import {
    LabDetails,
    LabNameSchema,
    LabDescriptionSchema,
    NextFlowTowerApiBaseUrlSchema,
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
  import { maybeAddFieldValidationErrors } from '@FE/utils/form-utils';
  import {
    CreateLaboratory,
    CreateLaboratorySchema,
    ReadLaboratorySchema,
    UpdateLaboratory,
    UpdateLaboratorySchema,
  } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/laboratory';
  import {
    UpdateLaboratoryPipelines,
    UpdateLaboratoryPipelinesSchema,
  } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/laboratory-pipeline';
  import { ERROR_CODES } from '@easy-genomics/shared-lib/src/app/constants/errorMessages';

  const props = withDefaults(
    defineProps<{
      formMode?: LabDetailsFormMode;
    }>(),
    {
      formMode: LabDetailsFormModeEnum.enum.ReadOnly,
    },
  );

  const emit = defineEmits<{
    (event: 'updated'): void;
  }>();

  const { $api } = useNuxtApp();
  const $route = useRoute();
  const router = useRouter();

  const toastStore = useToastStore();
  const orgsStore = useOrgsStore();
  const userStore = useUserStore();
  const seqeraPipelinesStore = useSeqeraPipelinesStore();
  const omicsWorkflowsStore = useOmicsWorkflowsStore();
  const labsStore = useLabsStore();

  const labId: string = $route.params.labId as string;

  const formMode = ref(props.formMode);
  const s3Directories = ref([]);
  const isLoadingBuckets = ref(false);
  const isLoadingFormData = ref(false);
  const canSubmit = ref(false);

  const lab = computed<Laboratory | null>(() => labsStore.labs[labId] ?? null);

  const isEditing = computed<boolean>(() => formMode.value !== LabDetailsFormModeEnum.enum.ReadOnly);

  const defaultState: LabDetails = {
    Name: '',
    Description: '',
    S3Bucket: '',
    NextFlowTowerEnabled: false,
    NextFlowTowerAccessToken: '',
    NextFlowTowerWorkspaceId: '',
    NextFlowTowerApiBaseUrl: orgsStore.orgs[userStore.currentOrgId || ''].NextFlowTowerApiBaseUrl || '',
    AwsHealthOmicsEnabled: false,
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
    formMode.value = newFormMode;
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
      toastStore.error('Failed to retrieve S3 buckets');
    } finally {
      isLoadingBuckets.value = false;
    }
  }

  const hasEditPermission = computed<boolean>(() => userStore.canEditLabDetails());

  /**
   * Retrieves the lab details from the server and sets the form state.
   */
  async function getLabDetails() {
    try {
      isLoadingFormData.value = true;
      const res = await $api.labs.labDetails(labId);
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
      toastStore.error(`Failed to retrieve lab details for lab: ${state.value.Name}`);
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

  const isSubmittingFormData = computed(
    () => useUiStore().isRequestPending('createLab') || useUiStore().isRequestPending('updateLab'),
  );

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
      if (formMode.value === LabDetailsFormModeEnum.enum.Create) {
        await handleCreateLab();
      } else if (formMode.value === LabDetailsFormModeEnum.enum.Edit) {
        await handleUpdateLabDetails();
      }
    } catch (error: any) {
      if (error.message === `Request error: ${ERROR_CODES['EG-304']}`) {
        toastStore.error('Laboratory name already taken. Please try again.');
      } else if (error.message === `Request error: ${ERROR_CODES['EG-308']}`) {
        toastStore.error('Invalid Workspace ID or Personal Access Token. Please try again.');
      } else {
        toastStore.error('An unknown error occurred. Please refresh the page and try again.');
      }
    } finally {
      useUiStore().setRequestComplete('createLab');
      useUiStore().setRequestComplete('updateLab');
    }
  }

  async function handleCreateLab() {
    useUiStore().setRequestPending('createLab');

    const lab: CreateLaboratory = {
      ...state.value,
      OrganizationId: userStore.currentOrgId,
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
      toastStore.error(`Failed to verify details for ${state.value.Name}`);
    }

    toastStore.success(`Successfully created lab: ${newLab.Name}`);
    router.push({ path: '/labs' });
  }

  // Submits the values from state instead of the form event values to align create
  // and edit data types with those expected by and validated in the backend. The
  // types can have more properties than the form fields.
  // e.g, LaboratoryId or CreatedAt
  async function handleUpdateLabDetails() {
    useUiStore().setRequestPending('updateLab');
    const parseResult = UpdateLaboratorySchema.safeParse(state.value);

    if (!parseResult.success) {
      const message = 'Update lab failed to parse lab details';
      console.error(`${message}; parseResult: `, parseResult);
      throw new Error(message);
    }

    const lab: UpdateLaboratory = parseResult.data;
    const res = await $api.labs.update(labId, lab);

    if (!res) {
      toastStore.error(`Failed to verify details for ${state.value.Name}`);
    }

    emit('updated');

    isEditingNextFlowTowerAccessToken.value = false;
    switchToFormMode(LabDetailsFormModeEnum.enum.ReadOnly);
    await getLabDetails();

    toastStore.success(`${lab.Name} successfully updated`);
  }

  const validate = (state: LabDetails): FormError[] => {
    const errors: FormError[] = [];

    maybeAddFieldValidationErrors(errors, LabNameSchema, 'Name', state.Name);
    maybeAddFieldValidationErrors(errors, LabDescriptionSchema, 'Description', state.Description);

    // Next Flow fields only required if Next Flow enabled
    if (state.NextFlowTowerEnabled) {
      maybeAddFieldValidationErrors(
        errors,
        NextFlowTowerApiBaseUrlSchema,
        'NextFlowTowerApiBaseUrl',
        state.NextFlowTowerApiBaseUrl,
      );

      maybeAddFieldValidationErrors(
        errors,
        NextFlowTowerWorkspaceIdSchema,
        'NextFlowTowerWorkspaceId',
        state.NextFlowTowerWorkspaceId,
      );

      // Access Token only required if creating lab
      if (formMode.value === LabDetailsFormModeEnum.enum.Create) {
        maybeAddFieldValidationErrors(
          errors,
          NextFlowTowerAccessTokenSchema,
          'NextFlowTowerAccessToken',
          state.NextFlowTowerAccessToken,
        );
      }
    }

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

  // Pipeline Restrictions modal stuff

  const pipelineRestrictionsModalTabStyles = {
    wrapper: '',
    base: 'focus:outline-none',
    list: {
      base: '!flex border-b-2 rounded-none mt-0',
      background: 'bg-transparent',
      padding: 'p-0',
      height: 'h-14',
      marker: {
        wrapper: 'duration-200 ease-out absolute bottom-0',
        base: 'absolute bottom-0 rounded-none h-0.5',
        background: 'bg-primary',
        shadow: 'shadow-none',
      },
      tab: {
        base: 'font-serif w-auto inline-flex justify-start ui-focus-visible:outline-0 ui-focus-visible:ring-2 ui-focus-visible:ring-primary-500 ui-not-focus-visible:outline-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-75 duration-200 ease-out mr-16',
        active: 'text-primary h-14',
        inactive: 'font-serif',
        height: 'h-14',
        padding: 'p-0',
        size: 'text-lg',
      },
    },
  };

  const checkboxStyle = { base: 'size-[24px]' };

  const pipelineRestrictionsModalListStyle = 'h-full max-h-[450px] overflow-y-scroll';
  const pipelineRestrictionsModalListItemStyle = 'mx-4 my-7 text-body text-sm flex flex-row align-center gap-4';

  const showPipelineRestrictionsModal = ref<boolean>(false);
  const inputSeqeraPipelinesRestrictions = ref<Record<string, boolean> | null>(null);
  const inputOmicsPipelinesRestrictions = ref<Record<string, boolean> | null>(null);

  function openPipelineRestrictions() {
    inputSeqeraPipelinesRestrictions.value = {};
    inputOmicsPipelinesRestrictions.value = {};

    // use existing values
    if (lab.value?.NextFlowTowerPipelines) {
      inputSeqeraPipelinesRestrictions.value = lab.value.NextFlowTowerPipelines;
    }
    if (lab.value?.AwsHealthOmicsWorkflows) {
      inputOmicsPipelinesRestrictions.value = lab.value.AwsHealthOmicsWorkflows;
    }

    showPipelineRestrictionsModal.value = true;
  }

  async function savePipelineRestrictions() {
    showPipelineRestrictionsModal.value = false;

    const labPipelines: UpdateLaboratoryPipelines = {
      AwsHealthOmicsWorkflows: inputOmicsPipelinesRestrictions.value,
      NextFlowTowerPipelines: inputSeqeraPipelinesRestrictions.value,
    };

    const parseResult = UpdateLaboratoryPipelinesSchema.safeParse(labPipelines);
    if (!parseResult.success) {
      const message = 'Update lab pipelines failed to parse lab details';
      console.error(`${message}; parseResult: `, parseResult);
      throw new Error(message);
    }

    await $api.labs.updateLabPipelines(labId, labPipelines);
  }
</script>

<template>
  <USkeleton v-if="isLoadingFormData" class="min-h-96 w-full" />
  <UForm v-else :validate="validate" :state="state" @submit="onSubmit">
    <EGCard>
      <!-- Lab Name -->
      <EGFormGroup label="Lab Name" name="Name" eager-validation required>
        <EGInput
          v-model="state.Name"
          :disabled="!isEditing || isSubmittingFormData"
          placeholder="Enter lab name (required and must be unique)"
          autofocus
        />
      </EGFormGroup>

      <!-- Lab Description -->
      <EGFormGroup label="Lab Description" name="Description" eager-validation>
        <EGTextArea
          v-model="state.Description"
          :disabled="!isEditing || isSubmittingFormData"
          placeholder="Describe your lab and what runs should be launched by Lab users."
        />
      </EGFormGroup>

      <EGFormGroup
        v-if="userStore.isOrgAdmin()"
        label="Default S3 bucket directory"
        name="DefaultS3BucketDirectory"
        required
      >
        <EGSelect
          :options="s3Directories"
          v-model="selectedS3Bucket"
          :disabled="!isEditing || isSubmittingFormData"
          placeholder="Please select an S3 bucket from the list below"
          searchable-placeholder="Search existing S3 buckets..."
        />
      </EGFormGroup>

      <hr class="mb-6" />

      <!-- Next Flow Tower: Toggle -->
      <EGFormGroup
        label="Enable Seqera Integration"
        name="NextFlowTowerEnable"
        eager-validation
        class="flex justify-between"
      >
        <UToggle class="ml-2" v-model="state.NextFlowTowerEnabled" :disabled="!isEditing || isSubmittingFormData" />
      </EGFormGroup>

      <!-- Next Flow Tower: Endpoint -->
      <EGFormGroup
        v-if="state.NextFlowTowerEnabled"
        label="Seqera Endpoint URL"
        name="NextFlowTowerApiBaseUrl"
        eager-validation
        required
      >
        <EGInput v-model="state.NextFlowTowerApiBaseUrl" :disabled="!isEditing || isSubmittingFormData" />
      </EGFormGroup>

      <!-- Next Flow Tower: Workspace ID -->
      <EGFormGroup
        v-if="state.NextFlowTowerEnabled"
        label="Workspace ID"
        name="NextFlowTowerWorkspaceId"
        eager-validation
      >
        <EGInput
          v-model="state.NextFlowTowerWorkspaceId"
          placeholder="Defaults to the Next Flow Tower personal workspace if not specified."
          :disabled="!isEditing || isSubmittingFormData"
        />
      </EGFormGroup>

      <!-- Next Flow Tower: Access Token -->
      <EGFormGroup
        v-if="isEditing && state.NextFlowTowerEnabled"
        label="Personal Access Token"
        name="NextFlowTowerAccessToken"
        eager-validation
        :required="formMode === LabDetailsFormModeEnum.enum.Create"
      >
        <!-- Next Flow Tower: Access Token: Create  Mode -->
        <EGPasswordInput
          v-if="formMode === LabDetailsFormModeEnum.enum.Create"
          v-model="state.NextFlowTowerAccessToken"
          :password="true"
          :autocomplete="AutoCompleteOptionsEnum.enum.NewPassword"
          :disabled="!isEditing || isSubmittingFormData"
        />
        <!-- Next Flow Tower: Access Token: Edit  Mode -->
        <EGPasswordInput
          v-if="formMode === LabDetailsFormModeEnum.enum.Edit"
          v-model="state.NextFlowTowerAccessToken"
          :select-on-focus="true"
          :password="true"
          placeholder="Add or update the Next Flow Tower personal access token. Note: A previously set token will never be shown."
          :show-toggle-password-button="isEditingNextFlowTowerAccessToken"
          :autocomplete="AutoCompleteOptionsEnum.enum.Off"
          eager-validation
          :disabled="!isEditing || isSubmittingFormData"
        />
      </EGFormGroup>

      <hr class="mb-6" />

      <!-- HealthOmics Toggle -->
      <EGFormGroup
        label="Enable HealthOmics Integration"
        name="HealthOmicsEnable"
        eager-validation
        class="flex justify-between"
      >
        <UToggle class="ml-2" v-model="state.AwsHealthOmicsEnabled" :disabled="!isEditing || isSubmittingFormData" />
      </EGFormGroup>

      <template
        v-if="
          (state.NextFlowTowerEnabled || state.AwsHealthOmicsEnabled) && formMode !== LabDetailsFormModeEnum.enum.Create
        "
      >
        <hr class="mb-6" />

        <!-- Pipeline Restrictions -->
        <EGFormGroup
          label="Adjust Pipeline Restrictions"
          name="PipelineRestrictions"
          eager-validation
          class="flex justify-between"
        >
          <EGButton
            label="View Settings"
            variant="secondary"
            @click="openPipelineRestrictions"
            :disabled="formMode !== LabDetailsFormModeEnum.enum.Edit"
          />
        </EGFormGroup>
      </template>
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
        :disabled="useUiStore().anyRequestPending(['createLab', 'updateLab'])"
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
        :disabled="userStore.isSuperuser || !hasEditPermission"
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

  <EGDialog
    action-label="Save Changes"
    :action-variant="ButtonVariantEnum.enum.primary"
    @action-triggered="savePipelineRestrictions"
    primary-message="Lab Pipeline Restrictions"
    secondary-message="Check pipelines to grant Lab users access. Unchecking or deleting a pipeline will remove user access immediately."
    :fixed-width="650"
    v-model="showPipelineRestrictionsModal"
  >
    <UTabs
      :ui="pipelineRestrictionsModalTabStyles"
      :items="[
        ...(state.NextFlowTowerEnabled ? [{ key: 'seqera', label: 'Seqera' }] : []),
        ...(state.AwsHealthOmicsEnabled ? [{ key: 'omics', label: 'HealthOmics' }] : []),
      ]"
    >
      <template #item="{ item }">
        <!-- Seqera -->
        <div
          v-if="item.key === 'seqera' && inputSeqeraPipelinesRestrictions !== null"
          :class="pipelineRestrictionsModalListStyle"
        >
          <div v-for="pipeline in seqeraPipelinesStore.pipelines" :class="pipelineRestrictionsModalListItemStyle">
            <UCheckbox
              :label="pipeline.name"
              :ui="checkboxStyle"
              :model-value="inputSeqeraPipelinesRestrictions[pipeline.pipelineId]"
              @update:model-value="($event) => (inputSeqeraPipelinesRestrictions[pipeline.pipelineId] = $event)"
            />
          </div>
        </div>

        <!-- Omics -->
        <div
          v-if="item.key === 'omics' && inputSeqeraPipelinesRestrictions !== null"
          :class="pipelineRestrictionsModalListStyle"
        >
          <div v-for="workflow in omicsWorkflowsStore.workflows" :class="pipelineRestrictionsModalListItemStyle">
            <UCheckbox
              :label="workflow.name"
              :ui="checkboxStyle"
              :model-value="inputOmicsPipelinesRestrictions[workflow.id]"
              @update:model-value="($event) => (inputOmicsPipelinesRestrictions[workflow.id] = $event)"
            />
          </div>
        </div>

        <hr class="mb-6" />
      </template>
    </UTabs>
  </EGDialog>
</template>
