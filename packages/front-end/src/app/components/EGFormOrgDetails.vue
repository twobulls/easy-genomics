<script setup lang="ts">
  import { ButtonSizeEnum } from '~/types/buttons';
  import { cleanText } from '~/utils/string-utils';
  import { z } from 'zod';

  // Use UI composable to determine if the UI is loading
  import useUI from '~/composables/useUI';
  const isLoading = computed(() => useUI().isUILoading());

  const props = withDefaults(
    defineProps<{
      name?: string;
      description?: string;
    }>(),
    {
      name: '',
      description: '',
    }
  );

  // Form-related refs and computed props
  const didFormStateChange = computed(() => {
    return props.name !== formState.Name || props.description !== formState.Description;
  });
  const orgNameCharCount = computed(() => formState.Name.length);
  const orgDescriptionCharCount = computed(() => formState.Description.length);

  // Form-related refs and computed props
  const formState = reactive({
    Name: props.name,
    Description: props.description,
    isFormValid: false,
    isFormDisabled: true,
  });

  /*
    Organization Name
    - Minimum of 1 character
    - Maximum of 50 characters
    - Accepts alphanumeric characters
    - Accepts UPPERCASE and lowercase characters
    - Does not accept special characters except for hyphen, comma, apostrophe, period, underscore, space and parenthesis (-,'._ )
    - Should not start with special character
    - If user leaves the field blank, an error message will be displayed in the page
    - User will not be able to type in additional characters if the maximum (50) was reached
    - Accepts value from copy and paste
    - If a user attempts to paste values above 50 characters, these characters will be filtered out and only the first 50 characters will be pasted
    - If a user attempts to paste invalid special characters, these characters will be filtered out and only the valid characters will be pasted
  */
  const ORG_NAME_MIN_LENGTH = 1;
  const ORG_NAME_MAX_LENGTH = 50;
  /*
  Organization Description
  - Can be left blank
  - Maximum of 500 characters
  - Accepts alphanumeric characters
  - Accepts UPPERCASE and lowercase characters
  - Does not accept special characters except for hyphen, comma, apostrophe, period, underscore, space and parenthesis (-,'._ )
  - Should not start with special character
  - User will not be able to type in additional characters if the maximum (500) was reached
  - Accepts value from copy and paste
  - If a user attempts to paste values above 500 characters, these characters will be filtered out and only the first 500 characters will be pasted
  - If a user attempts to paste invalid special characters, these characters will be filtered out and only the valid characters will be pasted
*/
  const ORG_DESCRIPTION_MAX_LENGTH = 500;

  function getCharacterText(count: number) {
    return count === 1 ? 'character' : 'characters';
  }

  const orgNameSchema = z
    .string()
    .min(ORG_NAME_MIN_LENGTH, {
      message: `Name must be at least ${ORG_NAME_MIN_LENGTH} ${getCharacterText(ORG_NAME_MIN_LENGTH)}`,
    })
    .max(ORG_NAME_MAX_LENGTH, { message: `${ORG_NAME_MAX_LENGTH} ${getCharacterText(ORG_NAME_MAX_LENGTH)} max` });

  const orgDescriptionSchema = z
    .string()
    .min(0)
    .max(ORG_DESCRIPTION_MAX_LENGTH, {
      message: `${ORG_DESCRIPTION_MAX_LENGTH} ${getCharacterText(ORG_DESCRIPTION_MAX_LENGTH)} max`,
    });

  const orgDetailsFormSchema = z.object({
    Name: orgNameSchema,
    Description: orgDescriptionSchema,
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
    const isNameValid = orgNameSchema.safeParse(name).success;
    const isDescriptionValid = orgDescriptionSchema.safeParse(description).success;
    const isFormValid = isNameValid && isDescriptionValid;
    formState.isFormValid = isFormValid;
    formState.isFormDisabled = !isFormValid;
  }
</script>

<template>
  <UForm :schema="orgDetailsFormSchema" :state="formState" @submit="$emit('submit-form-org-details', $event)">
    <EGCard>
      <EGFormGroup label="Organization name*" name="Name">
        <EGInput
          v-model.trim="formState.Name"
          @blur="validateForm"
          @input.prevent="handleNameInput"
          :placeholder="formState.Name ? '' : 'Enter organization name (required and must be unique)'"
          required
          :disabled="isLoading"
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
          :disabled="isLoading"
        />
        <EGCharacterCounter :value="orgDescriptionCharCount" :max="ORG_DESCRIPTION_MAX_LENGTH" />
      </EGFormGroup>
    </EGCard>
    <EGButton
      :size="ButtonSizeEnum.enum.sm"
      :disabled="isLoading || formState.isFormDisabled || !didFormStateChange"
      type="submit"
      label="Save changes"
      class="mt-6"
      :loading="isLoading"
    />
  </UForm>
</template>

<style scoped lang="scss"></style>
