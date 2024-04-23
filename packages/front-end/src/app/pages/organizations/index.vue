<script setup lang="ts">
  const { $api } = useNuxtApp();
  const hasNoData = ref(false);
  const isLoading = ref(true);
  const orgData = ref([]);
  const { MOCK_ORG_ID } = useRuntimeConfig().public;

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

  const actionItems = (row: Array<{}>) => [
    [
      {
        label: 'Summary',
        click: () => {},
      },
    ],
    [
      {
        label: 'View / Edit',
        click: () => {},
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
      orgData.value = await $api.orgs.list(MOCK_ORG_ID);

      if (!orgData.value.length) {
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
    <EGText tag="h1">Organizations</EGText>
    <EGButton label="Create a new Organization" class="self-end" to="organizations/create" />
  </div>

  <EGEmptyDataCTA
    v-if="hasNoData"
    message="You don't have any Organization set up yet."
    :button-action="() => {}"
    button-label="Create a new Organization"
  />

  <EGTable
    v-else
    :table-data="orgData"
    :columns="columns"
    :is-loading="isLoading"
    :action-items="actionItems"
    :show-pagination="!isLoading && !hasNoData"
  />
</template>
