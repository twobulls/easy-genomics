<script setup lang="ts">
  import { z } from 'zod';
  import { useToastStore, useUiStore } from '~/stores';
  import { ERRORS } from '~/constants/validation';
  import { checkTokenExpiry } from '~/utils/jwt';

  definePageMeta({ layout: 'password' });

  const isFormDisabled = ref(true);
  const state = ref({ firstName: '', lastName: '', password: '' });
  const { $api } = useNuxtApp();
  const { signIn } = useAuth();
  const formSchema = z.object({
    password: z
      .string()
      .nonempty(ERRORS.notEmpty)
      .min(8, ERRORS.passwordMinLength)
      .max(50, ERRORS.passwordMaxLength)
      .refine((value) => !/\s/.test(value), ERRORS.notSpaces)
      .refine((value) => /[A-Z]/.test(value), ERRORS.passwordUppercase)
      .refine((value) => /[a-z]/.test(value), ERRORS.passwordLowercase)
      .refine((value) => /[0-9]/.test(value), ERRORS.passwordNumber)
      .refine((value) => /[^a-zA-Z0-9]/.test(value), ERRORS.passwordSymbol),
  });
  const forgotPasswordToken = ref('');

  /**
   * @description Check if the reset token is valid and not expired, otherwise redirect to the signin page
   */
  onMounted(() => {
    const resetToken = getResetToken();
    return checkTokenExpiry(resetToken) ? (forgotPasswordToken.value = resetToken) : handleExpiredToken();
  });

  watchEffect(() => {
    isFormDisabled.value = !formSchema.safeParse(state.value).success;
  });

  function handleExpiredToken() {
    useToastStore().error('Your invite link has been accepted or expired.');
    navigateTo('/signin');
  }

  function getResetToken() {
    const url = new URL(window.location.href);
    return url.searchParams.get('forgot-password');
  }

  /**
   * @description Reset password using the token provided as a query param in the URL
   * @param password
   */
  async function onSubmit(password: string) {
    try {
      useUiStore().setRequestPending(true);
      await $api.users.confirmForgotPasswordRequest(forgotPasswordToken.value, password);
      useToastStore().success(`Password has been reset`);
      state.value.password = '';
      await navigateTo('/signin');
    } catch (error: any) {
      useToastStore().error(ERRORS.network);
      console.error('Error occurred during password reset.', error);
      throw error;
    } finally {
      useUiStore().setRequestPending(false);
    }
  }
</script>

<template>
  <UForm :schema="formSchema" :state="state" class="w-full max-w-[408px]">
    <EGText tag="h2" class="mb-4">Reset my password</EGText>
    <EGFormGroup label="New password" name="password">
      <EGPasswordInput v-model="state.password" :disabled="useUiStore().isRequestPending" />
    </EGFormGroup>
    <div class="flex items-center justify-between">
      <EGButton
        :disabled="isFormDisabled || useUiStore().isRequestPending"
        :loading="useUiStore().isRequestPending"
        label="Reset password"
        @click="onSubmit(state.password)"
      />
    </div>
  </UForm>
</template>
