<script setup lang="ts">
  import { z } from 'zod';
  import { ERRORS } from '~/constants/validation';

  withDefaults(
    defineProps<{
      placeholder?: string;
      disabled?: boolean;
    }>(),
    {
      placeholder: 'Enter Email',
      disabled: false,
    }
  );

  const formSchema = z.object({
    email: z.string().email(ERRORS.email),
  });
  const isFormDisabled = ref(true);
  const state = ref({ email: '' });
  const { invite } = useUser();
  const { MOCK_ORG_ID } = useRuntimeConfig().public;

  async function onSubmit() {
    await invite({
      UserEmail: state.value.email,
      OrganizationId: MOCK_ORG_ID,
    });
    state.value.email = '';
  }

  watchEffect(() => {
    isFormDisabled.value = !formSchema.safeParse(state.value).success;
  });
</script>

<template>
  <EGCard padding="4">
    <UForm :schema="formSchema" :state="state" @submit="onSubmit">
      <div class="flex w-full items-center justify-center space-x-2">
        <EGInput v-model="state.email" :placeholder="placeholder" :clearable="true" class="w-full" />
        <EGButton label="Invite" type="submit" :disabled="isFormDisabled" icon="i-heroicons-envelope" />
      </div>
    </UForm>
  </EGCard>
</template>
