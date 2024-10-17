<script setup lang="ts">
  import { z } from 'zod';
  import { resetStores, useUiStore } from '@FE/stores';
  import { VALIDATION_MESSAGES } from '@FE/constants/validation';

  definePageMeta({ layout: 'signin' });

  const { signIn } = useAuth();
  const route = useRoute();
  const isFormDisabled = ref(true);
  const isAcceptingInvite = !!route.query.email;
  const state = ref({
    email: route.query.email ? route.query.email.toString() : '',
    password: '',
  });
  const formSchema = z.object({
    email: z.string().email(VALIDATION_MESSAGES.email),
    password: z.string().min(1, VALIDATION_MESSAGES.password),
  });

  /**
   * @description Reset the stores to ensure app is in a clean state prior to sign in
   */
  onBeforeMount(() => {
    resetStores();
  });

  watchEffect(() => {
    isFormDisabled.value = !formSchema.safeParse(state.value).success;
  });
</script>

<template>
  <UForm :schema="formSchema" :state="state" class="w-full max-w-[408px]">
    <EGText tag="h2" class="mb-12">Sign in</EGText>
    <EGFormGroup label="Email" name="email">
      <EGInput v-model="state.email" :autofocus="isAcceptingInvite" autocomplete="username" />
    </EGFormGroup>
    <EGFormGroup label="Password" name="password">
      <EGPasswordInput v-model="state.password" :autofocus="isAcceptingInvite" />
    </EGFormGroup>
    <div class="flex items-center justify-between">
      <EGButton
        :disabled="isFormDisabled || useUiStore().isRequestPending('signIn')"
        :loading="useUiStore().isRequestPending('signIn')"
        label="Sign in"
        @click="signIn(state.email, state.password)"
      />
      <EGText href="/forgot-password" tag="a" color-class="text-primary">Forgot password?</EGText>
    </div>
  </UForm>
</template>
