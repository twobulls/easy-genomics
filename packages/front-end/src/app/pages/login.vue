<script setup lang="ts">
  import { z } from 'zod';
  import { useUiStore } from '~/stores/stores';
  import { ERRORS } from '~/constants/validation';

  definePageMeta({ layout: 'login' });

  const { login } = useAuth();

  const formSchema = z.object({
    email: z.string().email(ERRORS.email),
    password: z.string().min(1, ERRORS.password),
  });
  const state = ref({ email: '', password: '' });
  const isFormDisabled = ref(true);

  watchEffect(() => {
    isFormDisabled.value = !formSchema.safeParse(state.value).success;
  });
</script>

<template>
  <UForm :schema="formSchema" :state="state" class="w-full max-w-[408px]">
    <EGText tag="h2" class="mb-12">Sign in</EGText>
    <EGFormGroup label="Email" name="email">
      <EGInput v-model="state.email" />
    </EGFormGroup>
    <EGFormGroup label="Password" name="password">
      <EGPasswordInput v-model="state.password" :password="true" />
    </EGFormGroup>
    <div class="flex items-center justify-between">
      <EGButton
        :disabled="isFormDisabled || useUiStore().isRequestPending"
        :loading="useUiStore().isRequestPending"
        label="Sign in"
        @click="login(state.email, state.password)"
      />
      <EGText href="#" tag="a" color-class="text-primary">Forgot password?</EGText>
    </div>
  </UForm>
</template>
