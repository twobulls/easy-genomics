<script setup lang="ts">
  import { z } from 'zod';
  import type { FormSubmitEvent } from '#ui/types';
  import { cleanText } from '~/utils/string-utils';
  import { ButtonVariantEnum, ButtonSizeEnum } from '~/types/buttons';

  const { MOCK_ORG_ID } = useRuntimeConfig().public;
  import { useToastStore } from '~/stores/stores';

  const { $api } = useNuxtApp();

  /*
    Laboratory Name
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
  const NAME_MIN_LENGTH = 1;
  const NAME_MAX_LENGTH = 50;

  const nameSchema = z
    .string()
    .min(NAME_MIN_LENGTH, { message: `Name must be at least ${NAME_MIN_LENGTH} ${getCharacterText(NAME_MIN_LENGTH)}` })
    .max(NAME_MAX_LENGTH, { message: `${NAME_MAX_LENGTH} ${getCharacterText(NAME_MAX_LENGTH)} max` });

  /*
    Laboratory Description
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

  const DESCRIPTION_MAX_LENGTH = 500;

  const descriptionSchema = z.string().max(DESCRIPTION_MAX_LENGTH, {
    message: `${DESCRIPTION_MAX_LENGTH} ${getCharacterText(DESCRIPTION_MAX_LENGTH)} max`,
  });

  // Keys use Title case to match the Laboratory schema
  const formSchema = z.object({
    Name: nameSchema,
    Description: descriptionSchema,
  });
  type FormSchema = z.infer<typeof formSchema>;

  const state = reactive({
    Name: '',
    Description: '',
    isFormValid: false,
    isFormDisabled: true,
  });

  const nameCharCount = computed(() => state.Name.length);
  const descriptionCharCount = computed(() => state.Description.length);

  function getCharacterText(count: number) {
    return count === 1 ? 'character' : 'characters';
  }

  function handleNameInput(event: InputEvent) {
    const target: HTMLInputElement = event.target;
    const name = target.value;
    const cleanedName = cleanText(name, NAME_MAX_LENGTH);
    if (name !== cleanedName) {
      state.Name = cleanedName;
      target.value = cleanedName;
    }
    validateForm({ name: cleanedName });
  }

  function handleDescriptionInput(event: InputEvent) {
    const target: HTMLInputElement = event.target;
    const description = target.value;
    const cleanedDescription = cleanText(description, DESCRIPTION_MAX_LENGTH);
    if (description !== cleanedDescription) {
      state.Description = cleanedDescription;
      target.value = cleanedDescription;
    }
    validateForm({ description: cleanedDescription });
  }

  function validateForm({
    name = state.Name,
    description = state.Description,
  }: {
    name: string | undefined;
    description: string | undefined;
  }) {
    const isNameValid = nameSchema.safeParse(name).success;
    const isDescriptionValid = descriptionSchema.safeParse(description).success;
    const isFormValid = isNameValid && isDescriptionValid;
    state.isFormValid = isFormValid;
    state.isFormDisabled = !isFormValid;
  }

  async function onSubmit(event: FormSubmitEvent<FormSchema>) {
    try {
      state.isFormDisabled = true;
      const { Name, Description } = event.data;

      await $api.labs.create({ Name, Description, OrganizationId: MOCK_ORG_ID, Status: 'Active' });
      useToastStore().success('Laboratory created');
      await navigateTo('/labs');
    } catch (error) {
      useToastStore().error('Failed to create lab');
    } finally {
      state.isFormDisabled = false;
    }
  }
</script>

<template>
  <div class="w-full">
    <EGBack />
    <EGText tag="h1" class="mb-6">Create a new lab</EGText>
    <EGText tag="h4" class="mb-4">Lab details</EGText>
  </div>

  <UForm :schema="formSchema" :state="state" @submit="onSubmit">
    <section
      class="flex flex-col rounded-2xl border border-solid border-neutral-200 bg-white p-6 pb-12 text-sm leading-5 max-md:px-5"
    >
      <div class="space-y-8">
        <EGFormGroup label="Lab name*" name="Name">
          <EGInput
            v-model.trim="state.Name"
            @blur="validateForm"
            @input.prevent="handleNameInput"
            placeholder="Enter lab name (required and must be unique)"
            required
            autofocus
          />
          <EGCharacterCounter :value="nameCharCount" :max="NAME_MAX_LENGTH" />
        </EGFormGroup>
        <EGFormGroup label="Lab description" name="Description">
          <EGTextArea
            v-model.trim="state.Description"
            @blur="validateForm"
            @input.prevent="handleDescriptionInput"
            placeholder="Describe your lab and what runs should be launched by Lab users."
          />
          <EGCharacterCounter :value="descriptionCharCount" :max="DESCRIPTION_MAX_LENGTH" />
        </EGFormGroup>
      </div>
    </section>
    <EGButton :disabled="state.isFormDisabled" type="submit" label="Create" class="mt-6" />
  </UForm>
</template>
