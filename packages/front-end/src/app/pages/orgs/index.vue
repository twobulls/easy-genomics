<script setup lang="ts">
  import { useOrgsStore } from '@FE/stores';
  import { Organization } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization';

  const { $api } = useNuxtApp();
  const hasNoData = ref(false);
  const isLoading = ref(true);
  const orgData = ref([]);
  const $router = useRouter();

  if (!useUserStore().canManageOrgs()) {
    $router.push({ path: '/' });
  }

  const tableColumns = [
    {
      key: 'Name',
      label: 'Name',
      sortable: true,
      sort: useSort().stringSortCompare,
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
        label: 'View / Edit',
        click: async () => viewOrg(row),
      },
    ],
    // TODO: temporarily disabled; see: https://dept-au.atlassian.net/browse/EG-575
    // [
    //   {
    //     label: 'Remove',
    //     class: 'text-alert-danger-dark',
    //     click: () => {},
    //   },
    // ],
  ];

  function viewOrg(org: Organization) {
    useOrgsStore().setSelectedOrg(org);
    navigateTo(`/orgs/${org.OrganizationId}`);
  }

  function onRowClicked(org: Organization) {
    viewOrg(org);
  }

  onBeforeMount(async () => {
    try {
      orgData.value = (await $api.orgs.list())?.sort((orgA, orgB) => useSort().stringSortCompare(orgA.Name, orgB.Name));

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
  <EGPageHeader title="Organizations" :show-back="false" :back-action="() => $router.push('/')">
    <!-- TODO: https://dept-au.atlassian.net/browse/EG-547 -->
    <EGButton
      label="Create a new Organization"
      :disabled="!useUserStore().isSuperuser()"
      :to="useUserStore().isSuperuser() ? '/orgs/create' : undefined"
    />
  </EGPageHeader>

  <EGEmptyDataCTA
    v-if="hasNoData"
    message="You don't have any Organization set up yet."
    :primary-button-action="() => {}"
    primary-button-label="Create a new Organization"
  />

  <EGTable
    :row-click-action="onRowClicked"
    :table-data="orgData"
    :columns="tableColumns"
    :is-loading="isLoading"
    :action-items="actionItems"
    :show-pagination="!isLoading && !hasNoData"
  />
</template>
