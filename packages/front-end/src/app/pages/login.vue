<script setup lang="ts">
  import { z } from 'zod';
  import { useUiStore } from '~/stores/stores';

  definePageMeta({ layout: 'login' });

  const { isRequestPending } = useUiStore();
  const { login } = useAuth();

  const schema = z.object({
    email: z.string().email('Must be a valid email address'),
    password: z.string().min(1, 'Enter a password'),
  });
  const state = ref({ email: '', password: '' });
  const isFormDisabled = ref(true);

  watchEffect(() => {
    isFormDisabled.value = !schema.safeParse(state.value).success;
  });
</script>

<template>
  <UForm :schema="schema" :state="state" class="w-full max-w-[408px] space-y-4">
    <EGText tag="h2" class="mb-12">Sign in</EGText>
    <EGFormGroup label="Email" name="email"><EGInput v-model="state.email" /></EGFormGroup>
    <EGFormGroup label="Password" name="password">
      <EGPasswordInput v-model="state.password" :password="true" />
    </EGFormGroup>
    <div class="flex items-center justify-between">
      <EGButton
        :disabled="isFormDisabled || isRequestPending"
        :loading="isRequestPending"
        label="Sign in"
        @click="login(state.email, state.password)"
      />
      <EGText href="#" tag="a" color-class="text-primary">Forgot password?</EGText>
    </div>
  </UForm>
</template>
