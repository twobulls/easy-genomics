<script setup lang="ts">
  import { z } from 'zod';
  import { useToastStore, useUiStore } from '~/stores/stores';
  import { ERRORS } from '~/constants/validation';
  import { checkTokenExpiry, decodeJwt } from '~/utils/jwt';

  definePageMeta({ layout: 'signin' });

  const isFormDisabled = ref(true);
  const state = ref({ email: '', firstName: '', lastName: '' });
  const { $api } = useNuxtApp();
  const { signIn } = useAuth();
  const formSchema = z.object({
    firstName: z
      .string()
      .min(1, ERRORS.notEmpty)
      .max(50, ERRORS.nameMaxLength)
      .refine((name) => /^[a-zA-Z0-9\s'.-]*$/.test(name), ERRORS.invalidChar)
      .refine((name) => !/\s{2,}/.test(name), ERRORS.nameMultiSpaces),
    lastName: z
      .string()
      .min(1, ERRORS.notEmpty)
      .max(50, ERRORS.nameMaxLength)
      .refine((name) => /^[a-zA-Z0-9\s'.-]*$/.test(name), ERRORS.invalidChar)
      .refine((name) => !/\s{2,}/.test(name), ERRORS.nameMultiSpaces),
    password: z
      .string()
      .nonempty(ERRORS.notEmpty)
      .min(8, ERRORS.passwordMinLength)
      .max(256, ERRORS.passwordMaxLength)
      .refine((value) => !/\s/.test(value), ERRORS.notSpaces)
      .refine((value) => /[a-zA-Z]/.test(value), ERRORS.passwordCharacter)
      .refine((value) => /[0-9]/.test(value), ERRORS.passwordNumber)
      .refine((value) => /[^a-zA-Z0-9]/.test(value), ERRORS.passwordSymbol),
  });
  const inviteToken = ref();

  /**
   * @description Check accept invite token is valid, otherwise redirect to the sign-in page
   */
  onMounted(() => {
    const token = getAcceptInviteToken();
    if (checkTokenExpiry(token)) {
      inviteToken.value = token;
      const decodedToken = decodeJwt(token);
      if (decodedToken && 'Email' in decodedToken) {
        state.value.email = decodedToken.Email;
      } else {
        console.error('Email property not found in decoded token');
      }
    } else {
      handleExpiredToken();
    }
  });

  function handleExpiredToken() {
    useToastStore().error('Your invite link has been accepted or expired.');
    navigateTo('/sign-in');
  }

  function getAcceptInviteToken() {
    const url = new URL(window.location.href);
    return url.searchParams.get('invite');
  }

  function handleSuccess() {
    state.value.email = '';
    useToastStore().success(`Welcome to Easy Genomics!`);
  }

  /**
   * @description Create a new user account and sign user in
   */
  async function onSubmit() {
    const { firstName, lastName, password } = state.value;
    try {
      useUiStore().setRequestPending(true);
      await $api.users.confirmUserInviteRequest(inviteToken.value, firstName, lastName, password);
      await signIn(state.value.email, password);
      handleSuccess();
    } catch (error: any) {
      // TODO: mask error message if email not found temporarily until backend change made to return false positive response
      if (error.message === 'Request error: Failed to fetch') {
        handleSuccess();
      } else {
        useToastStore().error(ERRORS.network);
        console.error('Error occurred during forgot password request.', error);
        throw error;
      }
    } finally {
      useUiStore().setRequestPending(false);
    }
  }

  watchEffect(() => {
    isFormDisabled.value = !formSchema.safeParse(state.value).success;
  });
</script>

<template>
  <UForm :schema="formSchema" :state="state" class="w-full max-w-[408px]">
    <EGText tag="h2" class="mb-12">Create Account</EGText>
    <EGFormGroup label="Email address" name="email">
      <EGInput v-model="state.email" :disabled="true" />
    </EGFormGroup>
    <EGFormGroup label="First Name" name="firstName">
      <EGInput v-model="state.firstName" :disabled="useUiStore().isRequestPending" />
    </EGFormGroup>
    <EGFormGroup label="Last Name" name="lastName">
      <EGInput v-model="state.lastName" :disabled="useUiStore().isRequestPending" />
    </EGFormGroup>
    <EGFormGroup label="Create password" name="password">
      <EGPasswordInput v-model="state.password" :disabled="useUiStore().isRequestPending" />
    </EGFormGroup>
    <div class="flex items-center justify-between">
      <EGButton
        :disabled="isFormDisabled || useUiStore().isRequestPending"
        :loading="useUiStore().isRequestPending"
        label="Complete setup & Sign In"
        @click="onSubmit()"
      />
    </div>
  </UForm>
</template>
