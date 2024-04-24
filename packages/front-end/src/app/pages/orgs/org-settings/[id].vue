<script setup lang="ts">
  import { Organization } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization';
  import { UTabsStyles } from '~/styles/nuxtui/UTabs';

  const { $api } = useNuxtApp();
  const $route = useRoute();
  const isLoading = ref(true);
  const orgSettingsData = ref({} as Organization | undefined);

  useAsyncData('orgSettingsData', async () => {
    isLoading.value = true;
    try {
      orgSettingsData.value = await $api.orgs.orgSettings($route.params.id);
    } catch (error) {
      console.error(error);
    } finally {
      isLoading.value = false;
    }
    return orgSettingsData.value;
  });
</script>

<template>
  <div class="mb-11 flex flex-col justify-between">
    <a
      @click="$router.go(-1)"
      class="text-primary mb-4 flex cursor-pointer items-center gap-1 whitespace-nowrap text-base font-medium"
    >
      <i class="i-heroicons-arrow-left-solid"></i>
      <span>Back</span>
    </a>
    <div class="flex items-start justify-between">
      <div>
        <EGText tag="h1" class="mb-4">Organization settings</EGText>
        <EGText tag="p" class="text-muted">View details of the organization and its users</EGText>
      </div>
    </div>
  </div>

  <UTabs
    :ui="UTabsStyles"
    :default-index="0"
    :items="[
      {
        slot: 'details',
        label: 'Details',
      },
      {
        slot: 'users',
        label: 'Invited users',
        disabled: true,
      },
    ]"
  >
    <template #details>
      <USkeleton
        class="flex h-60 flex-col rounded-2xl bg-gray-200 p-6 max-md:px-5"
        :ui="{ rounded: 'rounded-full' }"
        v-if="isLoading"
      />
      <section
        v-else
        class="flex flex-col rounded-2xl border border-solid border-neutral-200 bg-white p-6 text-sm leading-5 text-zinc-900 max-md:px-5"
      >
        <h3 class="max-md:max-w-full">Organization name</h3>
        <EGInput :placeholder="orgSettingsData.Name" disabled />

        <h2 class="mt-10 max-md:max-w-full">Organization description</h2>
        <EGInput :placeholder="orgSettingsData.Description" disabled />
      </section>
    </template>
    <template #users></template>
  </UTabs>
</template>
