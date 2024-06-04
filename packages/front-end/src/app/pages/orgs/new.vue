<script setup lang="ts">
  import type { FormSubmitEvent } from '#ui/types';
  import { useToastStore, useUiStore } from '~/stores/stores';
  import { ERRORS } from '~/constants/validation';
  import { OrgDetailsFormSchema } from '~/types/forms';
  import EGFormOrgDetails from '~/components/EGFormOrgDetails.vue';

  const { $api } = useNuxtApp();

  async function onSubmit(event: FormSubmitEvent<OrgDetailsFormSchema>) {
    try {
      useUiStore().setRequestPending(true);
      const { Name, Description } = event.data;
      await $api.orgs.create({ Name, Description });
      useToastStore().success('Organization created');
      await navigateTo('/orgs');
    } catch (error) {
      useToastStore().error(ERRORS.network);
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
