<script setup lang="ts">
  import { useOrgsStore, useToastStore, useUiStore } from '~/stores/stores';
  import { Organization } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization';

  // Use UI composable to determine if the UI is loading
  import useUI from '~/composables/useUI';
  const isMounted = ref(false);
  const isLoading = computed(() => useUI().isUILoading(isMounted.value));

  const router = useRouter();
  const { $api } = useNuxtApp();
  const hasNoData = ref(false);
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

  async function getOrgsData() {
    try {
      useUiStore().setRequestPending(true);
      orgData.value = await $api.orgs.list();
      if (!orgData.value.length) {
        hasNoData.value = true;
      }
    } catch (error) {
      console.error(error);
      useToastStore().error('Failed to fetch Organizations data');
    } finally {
      useUiStore().setRequestPending(false);
    }
  }

  function viewOrg(org: Organization) {
    useOrgsStore().setSelectedOrg(org);
    router.push({
      path: `/orgs/view/${org.OrganizationId}`,
    });
  }

  onMounted(async () => {
    await getOrgsData();
    isMounted.value = true;
  });
</script>

<template>
  <div class="mb-11 flex items-center justify-between">
    <EGText tag="h1">Organizations</EGText>
    <EGButton label="Create a new Organization" to="/orgs/new" />
  </div>

  <EGEmptyDataCTA
    v-if="!isLoading && hasNoData"
    message="You don't have any Organization set up yet."
    :button-action="() => {}"
    button-label="Create a new Organization"
  />

  <EGTable
    v-if="!hasNoData"
    :table-data="orgData"
    :columns="tableColumns"
    :isLoading="isLoading"
    :action-items="actionItems"
    :show-pagination="!isLoading"
  />
</template>
