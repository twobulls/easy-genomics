<script setup lang="ts">
  import { z } from 'zod';
  import { useToastStore, useUiStore } from '~/stores';
  import { VALIDATION_MESSAGES } from '~/constants/validation';
  import { checkTokenExpiry } from '~/utils/jwt';

  definePageMeta({ layout: 'password' });

  const isFormDisabled = ref(true);
  const state = ref({ firstName: '', lastName: '', password: '' });
  const { $api } = useNuxtApp();
  const { signIn } = useAuth();
  const formSchema = z.object({
    password: z
      .string()
      .nonempty(VALIDATION_MESSAGES.notEmpty)
      .min(8, VALIDATION_MESSAGES.passwordMinLength)
      .max(50, VALIDATION_MESSAGES.passwordMaxLength)
      .refine((value) => !/\s/.test(value), VALIDATION_MESSAGES.notSpaces)
      .refine((value) => /[A-Z]/.test(value), VALIDATION_MESSAGES.passwordUppercase)
      .refine((value) => /[a-z]/.test(value), VALIDATION_MESSAGES.passwordLowercase)
      .refine((value) => /[0-9]/.test(value), VALIDATION_MESSAGES.passwordNumber)
      .refine((value) => /[^a-zA-Z0-9]/.test(value), VALIDATION_MESSAGES.passwordSymbol),
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
    useToastStore().error(VALIDATION_MESSAGES.inviteAcceptedOrExpired);
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
      useToastStore().error(VALIDATION_MESSAGES.network);
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
      <EGPasswordInput
        v-model="state.password"
        :disabled="useUiStore().isRequestPending"
        :autocomplete="AutoCompleteOptionsEnum.enum.NewPassword"
      />
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
