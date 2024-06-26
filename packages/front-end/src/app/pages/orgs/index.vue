<script setup lang="ts">
  import { useOrgsStore } from '~/stores';
  import { Organization } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization';

  const { $api } = useNuxtApp();
  const hasNoData = ref(false);
  const isLoading = ref(true);
  const orgData = ref([]);

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

  const actionItems = (row: Organization) => [
    [
      {
        label: 'Summary',
        click: () => {},
      },
    ],
    [
      {
        label: 'View / Edit',
        click: async () => viewOrg(row),
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

  function viewOrg(org: Organization) {
    useOrgsStore().setSelectedOrg(org);
    navigateTo(`/orgs/view/${org.OrganizationId}`);
  }

  onBeforeMount(async () => {
    try {
      orgData.value = await $api.orgs.list();

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
    <EGButton label="Create a new Organization" to="/orgs/new" />
  </div>

  <EGEmptyDataCTA
    v-if="hasNoData"
    message="You don't have any Organization set up yet."
    :button-action="() => {}"
    button-label="Create a new Organization"
  />

  <EGTable
    :table-data="orgData"
    :columns="tableColumns"
    :is-loading="isLoading"
    :action-items="actionItems"
    :show-pagination="!isLoading && !hasNoData"
  />
</template>
