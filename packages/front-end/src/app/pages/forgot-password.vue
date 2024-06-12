<script setup lang="ts">
  import { z } from 'zod';
  import { useUiStore } from '~/stores/stores';
  import { ERRORS } from '~/constants/validation';

  definePageMeta({ layout: 'forgot-password' });

  const { signIn } = useAuth();

  const formSchema = z.object({
    email: z.string().email(ERRORS.email),
  });
  const state = ref({ email: '', password: '' });
  const isFormDisabled = ref(true);

  watchEffect(() => {
    isFormDisabled.value = !formSchema.safeParse(state.value).success;
  });

  function onSubmit() {}
</script>

<template>
  <div class="flex h-[60vh] items-center justify-center">
    <div>
      <UForm :schema="formSchema" :state="state" class="w-full max-w-[408px]">
        <EGText tag="h2" class="mb-4">Forgot Password?</EGText>
        <EGText tag="p" class="mb-12">
          Enter in your email address below and we will send a link to your inbox to reset your password.
        </EGText>
        <EGFormGroup label="Email address" name="email">
          <EGInput v-model="state.email" />
        </EGFormGroup>
        <div class="flex items-center justify-between">
          <EGButton
            :disabled="isFormDisabled || useUiStore().isRequestPending"
            :loading="useUiStore().isRequestPending"
            label="Send password reset link"
            @click="onSubmit(state.email)"
          />
        </div>
      </UForm>
    </div>
  </div>
</template>
