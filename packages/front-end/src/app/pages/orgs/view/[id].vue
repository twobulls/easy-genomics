<script setup lang="ts">
  import { Organization } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization';

  const { $api } = useNuxtApp();
  const $route = useRoute();
  const isLoading = ref(true);
  const orgSettingsData = ref({} as Organization | undefined);
  const orgName = $route.query.name;

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
        <EGText tag="h1" class="mb-4">{{ orgName }}</EGText>
        <EGText tag="p" class="text-muted">View your entire Organization</EGText>
      </div>
    </div>
  </div>

  <UTabs
    :ui="{
      base: 'focus:outline-none',
      list: {
        base: 'border-b-2 rounded-none  mb-4',
        padding: 'p-0',
        height: 'h-14',
        marker: {
          wrapper: 'duration-200 ease-out focus:outline-none',
          base: 'absolute bottom-[0px] h-[2px]',
          background: 'bg-primary',
          shadow: 'shadow-none',
        },
        size: {
          sm: 'text-lg',
        },
        tab: {
          base: '!text-base w-auto inline-flex font-heading justify-start ui-focus-visible:outline-0 ui-focus-visible:ring-2 ui-focus-visible:ring-primary-500 ui-not-focus-visible:outline-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-75 duration-200 ease-out',
          active: 'text-primary h-14',
          inactive: 'text-heading',
          height: 'h-14',
          padding: 'p-0',
        },
      },
    }"
    :default-index="0"
    :items="[
      {
        slot: 'details',
        label: 'Details',
      },
      // TODO: placeholder tab + slot name for all users list
      // {
      //   slot: 'users',
      //   label: 'All users',
      // },
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
        class="flex flex-col rounded-2xl border border-solid border-neutral-200 bg-white p-6 text-sm leading-5 max-md:px-5"
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
