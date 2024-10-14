<script setup lang="ts">
  import type { FormSubmitEvent } from '#ui/types';
  import { useToastStore, useUiStore } from '@FE/stores';
  import { VALIDATION_MESSAGES } from '@FE/constants/validation';
  import { OrgDetailsForm } from '@FE/types/forms';

  const router = useRouter();
  const { $api } = useNuxtApp();

  const $router = useRouter();

  // require superuser for admin page
  if (!useUserStore().isSuperuser()) {
    $router.push('/');
  }

  async function onSubmit(event: FormSubmitEvent<OrgDetailsForm>) {
    try {
      useUiStore().setRequestPending(true);
      const { Name, Description } = event.data;
      await $api.orgs.create({ Name, Description });
      useToastStore().success('Organization created');
      router.push({ path: '/admin/orgs' });
    } catch (error) {
      useToastStore().error(VALIDATION_MESSAGES.network);
    } finally {
      useUiStore().setRequestPending(false);
    }
  }
</script>

<template>
  <EGAdminAlert />

  <div class="w-full">
    <EGBack :back-action="() => $router.push({ path: '/admin/orgs' })" />
    <EGText tag="h1" class="mb-6">Create a new Organization</EGText>
    <EGText tag="h4" class="mb-4">Organization details</EGText>
    <EGFormOrgDetails @submit-form-org-details="onSubmit($event)" />
  </div>
</template>
