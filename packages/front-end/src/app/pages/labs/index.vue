<script setup lang="ts">
  import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
  import { ref } from 'vue';

  const { $api } = useNuxtApp();
  const hasNoData = ref(false);
  const isLoading = ref(true);
  const labData = ref([] as Laboratory[]);
  const { MOCK_ORG_ID } = useRuntimeConfig().public;
  const $router = useRouter();

  const columns = [
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
        click: async () => await navigateTo({ path: `/labs/lab/${row.LaboratoryId}`, query: { labName: row.Name } }),
      },
    ],
    [
      {
        label: 'Remove',
        click: () => {},
      },
    ],
  ];

  onBeforeMount(async () => {
    try {
      labData.value = await $api.labs.list(MOCK_ORG_ID);

      if (!labData.value.length) {
        hasNoData.value = true;
      }
      isLoading.value = false;
    } catch (error) {
      isLoading.value = false;
      console.error(error);
      throw error;
    }
  });
</script>

<template>
  <div class="mb-11 flex items-center justify-between">
    <EGText tag="h1" v-if="labData">Labs</EGText>
    <EGButton label="Create a new Lab" class="self-end" />
  </div>

  <EGEmptyDataCTA
    v-if="hasNoData"
    message="You don't have any Labs set up yet."
    :button-action="() => {}"
    button-label="Create a new Lab"
  />

  <EGTable
    v-else
    :table-data="labData"
    :columns="columns"
    :is-loading="isLoading"
    :action-items="actionItems"
    :show-pagination="!isLoading && !hasNoData"
  />
</template>
