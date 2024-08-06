<script setup lang="ts">
  import type { FormSubmitEvent } from '#ui/types';
  import { useToastStore, useUiStore } from '~/stores';
  import { VALIDATION_MESSAGES } from '~/constants/validation';
  import { OrgDetailsForm } from '~/types/forms';

  const router = useRouter();
  const { $api } = useNuxtApp();

  async function onSubmit(event: FormSubmitEvent<OrgDetailsForm>) {
    try {
      useUiStore().setRequestPending(true);
      const { Name, Description } = event.data;
      await $api.orgs.create({ Name, Description });
      useToastStore().success('Organization created');
      router.push({ path: '/orgs' });
    } catch (error) {
      useToastStore().error(VALIDATION_MESSAGES.network);
    } finally {
      useUiStore().setRequestPending(false);
    }
  }
</script>

<template>
  <div class="w-full">
    <EGBack />
    <EGText tag="h1" class="mb-6">Create a new Organization</EGText>
    <EGText tag="h4" class="mb-4">Organization details</EGText>
    <EGFormOrgDetails @submit-form-org-details="onSubmit($event)" />
  </div>
</template>
