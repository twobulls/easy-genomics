<script setup lang="ts">
  import { z } from 'zod';
  import { useToastStore, useUiStore } from '~/stores/stores';
  import { ERRORS } from '~/constants/validation';
  import { getJwtPayload } from '~/utils/jwt';

  definePageMeta({ layout: 'password' });

  const isFormDisabled = ref(true);
  const state = ref({ password: '' });
  const { $api } = useNuxtApp();
  const { signIn } = useAuth();
  const formSchema = z.object({
    password: z.string().min(1, ERRORS.password),
  });
  const forgotPasswordToken = ref('');

  onMounted(() => {
    const resetToken = getResetToken();
    return checkResetTokenExpiry(resetToken) ? (forgotPasswordToken.value = resetToken) : redirectFromExpiredToken();
  });

  watchEffect(() => {
    isFormDisabled.value = !formSchema.safeParse(state.value).success;
  });

  function redirectFromExpiredToken() {
    useToastStore().error('Your invite link has been accepted or expired.');
    navigateTo('/sign-in');
  }

  function getResetToken() {
    const url = new URL(window.location.href);
    return url.searchParams.get('forgot-password');
  }

  function checkResetTokenExpiry(jwt: string) {
    const val = getJwtPayload(jwt);

    if (!val.exp) {
      console.warn('Missing "exp" field in JWT payload.');
      return false;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const isExpired = currentTime > val.exp;
    debugger;
    if (isExpired) {
      console.warn('Token has expired.');
      return false;
    }

    return true;
  }

  /**
   * @description Reset password using the token provided in the URL
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
      <EGPasswordInput v-model="state.password" :password="true" />
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
