<script setup lang="ts">
  import { z } from 'zod';
  import { useToastStore, useUiStore } from '@FE/stores';
  import { VALIDATION_MESSAGES } from '@FE/constants/validation';

  definePageMeta({ layout: 'password' });

  const isFormDisabled = ref(true);
  const state = ref({ email: '' });
  const { $api } = useNuxtApp();
  const formSchema = z.object({
    email: z.string().email(VALIDATION_MESSAGES.email),
  });

  watchEffect(() => {
    isFormDisabled.value = !formSchema.safeParse(state.value).success;
  });

  function handleSuccess(email: string) {
    useToastStore().success(`Reset link has been sent to ${email}`);
    state.value.email = '';
    navigateTo('/signin');
  }

  /**
   * Send a password reset link to the user's email address + displays toast message on success or error.
   * @param email
   */
  async function onSubmit(email: string) {
    try {
      useUiStore().setRequestPending('forgotPassword');
      await $api.users.forgotPasswordRequest(email);
      handleSuccess(email);
    } catch (error: any) {
      // mask error message if email not found
      if (error.message === 'Request error: Failed to fetch') {
        handleSuccess(email);
      } else {
        useToastStore().error(VALIDATION_MESSAGES.network);
        console.error('Error occurred during forgot password request.', error);
        throw error;
      }
    } finally {
      useUiStore().setRequestComplete('forgotPassword');
    }
  }
</script>

<template>
  <UForm :schema="formSchema" :state="state" class="w-full max-w-[408px]">
    <EGText tag="h2" class="mb-4">Forgot Password?</EGText>
    <EGText tag="p" class="mb-12">
      Enter in your email address below and we will send a link to your inbox to reset your password.
    </EGText>
    <EGFormGroup label="Email address" name="email">
      <EGInput v-model="state.email" :disabled="useUiStore().isRequestPending('forgotPassword')" />
    </EGFormGroup>
    <div class="flex items-center justify-between">
      <EGButton
        :disabled="isFormDisabled || useUiStore().isRequestPending('forgotPassword')"
        :loading="useUiStore().isRequestPending('forgotPassword')"
        label="Send password reset link"
        @click="onSubmit(state.email)"
      />
    </div>
  </UForm>
</template>
