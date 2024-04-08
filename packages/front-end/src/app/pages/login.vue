<script setup lang="ts">
  import { z } from 'zod';
  import { onBeforeMount } from '../../../.nuxt/imports';
  import { Auth } from 'aws-amplify';
  import { useRuntimeConfig } from 'nuxt/app';

  const { AWS_REGION } = useRuntimeConfig().public;

  definePageMeta({
    layout: 'login',
  });

  const router = useRouter();
  const { login } = useAuth();

  const schema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Must be at least 8 characters'),
  });

  type Schema = z.output<typeof schema>;

  const state = reactive({
    email: undefined,
    password: undefined,
  });

  onBeforeMount(() => {
    console.log(Auth.configure());
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
    <!--    <UButton type="submit">Log in</UButton>-->
  </UForm>
</template>

<style scoped></style>
