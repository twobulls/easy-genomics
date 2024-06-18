<script setup lang="ts">
import { z } from 'zod';
import { CreateLaboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
import type { FormError, FormSubmitEvent } from '#ui/types';
import { useToastStore, useUiStore } from '~/stores/stores';
import { ButtonSizeEnum, ButtonVariantEnum } from '~/types/buttons';

const { MOCK_ORG_ID } = useRuntimeConfig().public;
const { $api } = useNuxtApp();
const router = useRouter();

const canSubmit = ref(false);

const nameSchema = z.string().trim().min(1, 'Lab name is required').max(128, 'Lab name must be no more than 128 characters');
const descriptionSchema = z.string().trim().max(500, 'Description must be no longer than 500 characters').optional();
const nextFlowTowerAccessTokenSchema = z.string().trim().max(128, 'Personal access token must be no more than 128 characters').optional();
const nextFlowTowerWorkspaceIdSchema = z.string().trim().max(128, 'Workspace ID must be no more than 128 characters').optional();

const formSchema = z.object({
  Name: nameSchema,
  Description: descriptionSchema,
  NextFlowTowerAccessToken: nextFlowTowerAccessTokenSchema,
  NextFlowTowerWorkspaceId: nextFlowTowerWorkspaceIdSchema,
}).strict();

type Form = z.infer<typeof formSchema>;

const state: Form = reactive({
  Name: '',
  Description: '',
  NextFlowTowerAccessToken: '',
  NextFlowTowerWorkspaceId: '',
});

const validate = (state: Form): FormError[] => {
  const errors: FormError[] = []

  const nameParseResult = nameSchema.safeParse(state.Name)
  if (!nameParseResult.success) {
    nameParseResult.error.issues.forEach(({ message }) => errors.push({ path: 'Name', message }))
  }

  const descriptionParseResult = descriptionSchema.safeParse(state.Description)
  if (!descriptionParseResult.success) {
    descriptionParseResult.error.issues.forEach(({ message }) => errors.push({ path: 'Description', message }))
  }

  const nextFlowTowerAccessTokenParseResult = nextFlowTowerAccessTokenSchema.safeParse(state.NextFlowTowerAccessToken)
  if (!nextFlowTowerAccessTokenParseResult.success) {
    nextFlowTowerAccessTokenParseResult.error.issues.forEach(({ message }) => errors.push({ path: 'NextFlowTowerAccessToken', message }))
  }

  const nextFlowTowerWorkspaceIdParseResult = nextFlowTowerWorkspaceIdSchema.safeParse(state.NextFlowTowerWorkspaceId)
  if (!nextFlowTowerWorkspaceIdParseResult.success) {
    nextFlowTowerWorkspaceIdParseResult.error.issues.forEach(({ message }) => errors.push({ path: 'NextFlowTowerWorkspaceId', message }))
  }

  canSubmit.value = errors.length === 0

  return errors
}

async function onSubmit(event: FormSubmitEvent<Form>) {
  try {
    const formParseResult = formSchema.safeParse(event.data);
    if (!formParseResult.success) {
      console.error('Form data is invalid; formParseResult', formParseResult);
      throw new Error('Form data is invalid')
    }

    useUiStore().setRequestPending(true);

    const lab = {
      ...formParseResult.data,
      OrganizationId: MOCK_ORG_ID,
      Status: 'Active'
    } as CreateLaboratory

    await $api.labs.create(lab);
    useToastStore().success(`Successfully created lab ${lab.Name}`);
    router.push({ path: '/labs' });
  } catch (error) {
    useToastStore().error(`Failed to create lab ${state.Name}`);
  } finally {
    useUiStore().setRequestPending(false);
  }
}
</script>

<template>
  <div class="w-full">
    <EGBack />
    <EGText tag="h1" class="mb-6">Create a new lab</EGText>
    <EGText tag="h4" class="mb-4">Lab details</EGText>
  </div>

  <EGLabDetailsForm class="my-8" />
</template>
