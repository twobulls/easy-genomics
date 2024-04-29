<script setup lang="ts">
  import { z } from 'zod';
  import type { FormSubmitEvent } from '#ui/types';
  import { cleanText } from '~/utils/string-utils';

  const { $api } = useNuxtApp();

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
  const NAME_MIN_LENGTH = 1;
  const NAME_MAX_LENGTH = 50;

  const nameSchema = z
    .string()
    .min(NAME_MIN_LENGTH, { message: `Name must be at least ${NAME_MIN_LENGTH} ${getCharacterText(NAME_MIN_LENGTH)}` })
    .max(NAME_MAX_LENGTH, { message: `${NAME_MAX_LENGTH} ${getCharacterText(NAME_MAX_LENGTH)} max` });

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
  const DESCRIPTION_MAX_LENGTH = 500;

  const descriptionSchema = z
    .string()
    .min(0)
    .max(DESCRIPTION_MAX_LENGTH, {
      message: `${DESCRIPTION_MAX_LENGTH} ${getCharacterText(DESCRIPTION_MAX_LENGTH)} max`,
    });

  // Keys use Title case to match the Organization schema
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
      const result = await $api.orgs.create({ Name, Description });
      if (result) {
        // TODO: Display success toast message
        await navigateTo('/orgs');
      }
    } catch (error) {
      // TODO: Display error toast message
      console.error('error:', error);
    } finally {
      state.isFormDisabled = false;
    }
  }
</script>

<template>
  <div class="mb-11 flex flex-col justify-between">
    <a
      @click="$router.go(-1)"
      class="text-primary mb-4 flex cursor-pointer items-center gap-1 whitespace-nowrap text-base font-medium"
    >
      <i class="i-heroicons-arrow-left-solid"></i>
      <span>Back</span>
    </a>
    <div class="flex items-start justify-between font-['Inter'] text-sm font-normal leading-tight">
      <div class="w-full">
        <EGText tag="h1" class="mb-4">Create a new Organization</EGText>
        <EGText tag="h4" class="mb-[22px] mt-12">Organization details</EGText>
        <UForm :schema="formSchema" :state="state" @submit="onSubmit">
          <section
            class="flex flex-col rounded-2xl border border-solid border-neutral-200 bg-white p-6 pb-12 text-sm leading-5 max-md:px-5"
          >
            <div class="space-y-8">
              <EGFormGroup label="Organization name" name="Name">
                <EGInput
                  v-model.trim="state.Name"
                  @blur="validateForm"
                  @input.prevent="handleNameInput"
                  placeholder="Enter organization name (required and must be unique)"
                  required
                  autofocus
                />
                <EGCharacterCounter :value="nameCharCount" :max="NAME_MAX_LENGTH" />
              </EGFormGroup>
              <EGFormGroup label="Organization description" name="Description">
                <EGTextArea
                  v-model.trim="state.Description"
                  @blur="validateForm"
                  @input.prevent="handleDescriptionInput"
                />
                <EGCharacterCounter :value="descriptionCharCount" :max="DESCRIPTION_MAX_LENGTH" />
              </EGFormGroup>
            </div>
          </section>
          <EGButton :disabled="state.isFormDisabled" type="submit" variant="primary" label="Create" class="mt-6" />
        </UForm>
      </div>
    </div>
  </div>
</template>
