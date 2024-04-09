<script setup lang="ts">
  import { z } from 'zod';

  definePageMeta({
    layout: 'login',
  });

  const { login } = useAuth();

  const schema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Must be at least 8 characters'),
  });

  // type Schema = z.output<typeof schema>;

  const state = reactive({
    email: undefined,
    password: undefined,
  });
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-4">
    <!--  <UForm :schema="schema" :state="state" class="space-y-4" @submit="login(state.email, state.password)">-->
    <UFormGroup label="Email" name="email">
      <UInput v-model="state.email" />
    </UFormGroup>

    <UFormGroup label="Password" name="password">
      <UInput v-model="state.password" type="password" />
    </UFormGroup>

    <UButton @click="login(state.email, state.password)">Log in</UButton>
  </UForm>
</template>

<style scoped></style>
