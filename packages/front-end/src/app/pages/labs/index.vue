<script setup lang="ts">
  import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';

  const { $api } = useNuxtApp();
  const hasNoData = ref(false);
  const isLoading = ref(true);
  const labData = ref([] as Laboratory[]);
  const { MOCK_ORG_ID } = useRuntimeConfig().public;
  const $router = useRouter();

  const tableColumns = [
    {
      key: 'Name',
      label: 'Name',
      sortable: true,
    },
    {
      key: 'Description',
      label: 'Description',
    },
    {
      key: 'actions',
      label: '',
    },
  ];

  const actionItems = (row: Laboratory) => [
    [
      {
        label: 'Summary',
        click: () => {},
      },
    ],
    [
      {
        label: 'View / Edit',
        click: async () => await navigateTo({ path: `/labs/view/${row.LaboratoryId}`, query: { name: row.Name } }),
      },
    ],
    [
      {
        label: 'Remove',
        class: 'text-alert-danger-dark',
        click: () => {},
      },
    ],
  ];

  useAsyncData('labData', async () => {
    try {
      labData.value = await $api.labs.list(MOCK_ORG_ID);

      if (!labData.value.length) {
        hasNoData.value = true;
      }
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  });
</script>

<template>
  <div class="mb-11 flex items-center justify-between">
    <EGText tag="h1" v-if="labData">Labs</EGText>
    <EGButton label="Create a new Lab" class="self-end" @click="() => navigateTo({ path: `/labs/new` })" />
  </div>

  <EGEmptyDataCTA
    v-if="hasNoData"
    message="You don't have any Labs set up yet."
    :button-action="() => navigateTo({ path: `/labs/new` })"
    button-label="Create a new Lab"
  />

  <EGTable
    v-else
    :table-data="labData"
    :columns="tableColumns"
    :isLoading="isLoading"
    :action-items="actionItems"
    :show-pagination="!isLoading && !hasNoData"
  />
</template>
