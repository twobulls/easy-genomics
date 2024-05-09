<script setup lang="ts">
  import { watchEffect } from 'vue';
  import { z } from 'zod';

  definePageMeta({ layout: 'login' });

  const { login } = useAuth();
  const schema = z.object({
    email: z.string().email('Must be a valid email address'),
    password: z
      .string()
      .min(8, 'Min. 8 characters and at least 1 special symbol')
      .refine(
        (value) => /[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(value),
        'Min. 8 characters and at least 1 special symbol'
      ),
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
      <EGButton :disabled="isFormDisabled" label="Sign in" @click="login(state.email, state.password)" />
      <EGText href="#" tag="a" color-class="text-primary">Forgot password?</EGText>
    </div>
  </UForm>
</template>
