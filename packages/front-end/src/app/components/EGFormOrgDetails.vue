<script setup lang="ts">
  import { ButtonSizeEnum } from '@FE/types/buttons';
  import { cleanText } from '@FE/utils/string-utils';
  import { useUiStore } from '@FE/stores';
  import {
    ORG_DESCRIPTION_MAX_LENGTH,
    ORG_NAME_MAX_LENGTH,
    OrgDescriptionSchema,
    OrgDetailsFormSchema,
    OrgNameSchema,
  } from '@FE/types/forms';

  const props = withDefaults(
    defineProps<{
      name?: string;
      description?: string;
      seqeraBaseUrl?: string;
    }>(),
    {
      name: '',
      description: '',
      seqeraBaseUrl: '',
    },
  );

  // when the prop changes (as it will when autofilled with the default value) we need to manually update the form
  watch(
    () => props.seqeraBaseUrl,
    (newVal) => (formState.NextFlowTowerApiBaseUrl = newVal),
  );

  // Form-related refs and computed props
  const didFormStateChange = computed(() => {
    return (
      props.name !== formState.Name ||
      props.description !== formState.Description ||
      props.seqeraBaseUrl !== formState.NextFlowTowerApiBaseUrl
    );
  });
  const orgNameCharCount = computed(() => formState.Name.length);
  const orgDescriptionCharCount = computed(() => formState.Description.length);

  const isPending = computed(
    () => useUiStore().isRequestPending('createOrg') || useUiStore().isRequestPending('editOrg'),
  );

  // Form-related refs and computed props
  const formState = reactive({
    Name: props.name,
    Description: props.description,
    NextFlowTowerApiBaseUrl: props.seqeraBaseUrl,
    isFormValid: false,
    isFormDisabled: true,
  });

  function handleNameInput(event: InputEvent) {
    const target = event.target as HTMLInputElement;
    const name = target.value;
    const cleanedName = cleanText(name, ORG_NAME_MAX_LENGTH);
    if (name !== cleanedName) {
      formState.Name = cleanedName;
      target.value = cleanedName;
    }
    validateForm({ name: cleanedName, description: formState.Description });
  }

  function handleDescriptionInput(event: InputEvent) {
    const target = event.target as HTMLInputElement;
    const description = target.value;
    const cleanedDescription = cleanText(description, ORG_DESCRIPTION_MAX_LENGTH);
    if (description !== cleanedDescription) {
      formState.Description = cleanedDescription;
      target.value = cleanedDescription;
    }
    validateForm({ name: formState.Name, description: cleanedDescription });
  }

  function validateForm({
    name = formState.Name,
    description = formState.Description,
  }: {
    name: string | undefined;
    description: string | undefined;
  }) {
    const isNameValid = OrgNameSchema.safeParse(name).success;
    const isDescriptionValid = OrgDescriptionSchema.safeParse(description).success;
    const isFormValid = isNameValid && isDescriptionValid;
    formState.isFormValid = isFormValid;
    formState.isFormDisabled = !isFormValid;
  }
</script>

<template>
  <UForm :schema="OrgDetailsFormSchema" :state="formState" @submit="$emit('submit-form-org-details', $event)">
    <EGCard>
      <EGFormGroup label="Organization name*" name="Name">
        <EGInput
          v-model.trim="formState.Name"
          @blur="validateForm"
          @input.prevent="handleNameInput"
          :placeholder="formState.Name ? '' : 'Enter organization name (required and must be unique)'"
          required
          :disabled="isPending"
          autofocus
        />
        <EGCharacterCounter :value="orgNameCharCount" :max="ORG_NAME_MAX_LENGTH" />
      </EGFormGroup>
      <EGFormGroup label="Organization description" name="Description">
        <EGTextArea
          v-model.trim="formState.Description"
          @blur="validateForm"
          @input.prevent="handleDescriptionInput"
          placeholder="Describe your organization and any relevant details"
          :disabled="isPending"
        />
        <EGCharacterCounter :value="orgDescriptionCharCount" :max="ORG_DESCRIPTION_MAX_LENGTH" />
      </EGFormGroup>
      <EGFormGroup label="Default Seqera Endpoint URL" name="NextFlowTowerApiBaseUrl">
        <EGInput
          v-model.trim="formState.NextFlowTowerApiBaseUrl"
          @blur="validateForm"
          placeholder="If left blank, will default to the value defined in the config file easy-genomics.yaml"
          :disabled="isPending"
        />
      </EGFormGroup>
    </EGCard>
    <EGButton
      :size="ButtonSizeEnum.enum.sm"
      :disabled="isPending || formState.isFormDisabled || !didFormStateChange"
      type="submit"
      label="Save changes"
      class="mt-6"
      :loading="isPending"
    />
  </UForm>
</template>

<style scoped lang="scss"></style>
