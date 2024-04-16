<script setup lang="ts">
  const { $api } = useNuxtApp();
  const hasNoData = ref(false);
  const isLoading = ref(true);
  const MOCK_ORG_ID = '6a80b4fa-1cfe-4345-ae62-cdc58dbec69c';
  const orgData = ref([]);
  const page = ref(1);
  const pageCount = ref(10);

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

  const pageTotal = computed(() => orgData.value.length);
  const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1);
  const pageTo = computed(() => Math.min(page.value * pageCount.value, pageTotal.value));

  const sortedData = computed(() => {
    return orgData.value
      .slice((page.value - 1) * pageCount.value, page.value * pageCount.value)
      .sort((a, b) => a.Name.localeCompare(b.Name));
  });

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

  onMounted(async () => {
    try {
      orgData.value = await $api.orgs.list(MOCK_ORG_ID);
      if (!orgData.value.length) {
        hasNoData.value = true;
      }
      isLoading.value = false;
    } catch (error) {
      console.error(error);
      isLoading.value = false;
      throw error;
    }
  });
</script>

<template>
  <div class="center mb-11 flex justify-between">
    <EGText tag="h1">Organizations</EGText>
    <EGButton label="Create a new Organization" class="self-end" />
  </div>

  <EGEmptyDataCTA
    v-if="hasNoData"
    message="You don't have any Organization set up yet."
    :button-action="() => {}"
    button-label="Create a new Organization"
  />

  <UCard
    v-else
    class="rounded-2xl border-none shadow-none"
    :ui="{
      body: 'p-0',
    }"
  >
    <UTable
      class="LabsTable rounded-2xl"
      :rows="sortedData"
      :columns="columns"
      :key="sortedData"
      :loading="isLoading"
      :loading-state="{ icon: '', label: '' }"
    >
      <template #actions-data="{ row }">
        <EGActionButton :items="actionItems(row)" />
      </template>
      <template #empty-state>&nbsp;</template>
    </UTable>
  </UCard>

  <div class="text-muted flex h-16 flex-wrap items-center justify-between" v-if="!isLoading && !hasNoData">
    <div class="text-xs leading-5">Showing {{ pageFrom }} to {{ pageTo }} results</div>
    <div class="flex justify-end px-3" v-if="pageTotal > pageCount">
      <UPagination v-model="page" :page-count="10" :total="orgData.length" />
    </div>
  </div>
</template>

<style>
  .LabsTable {
    font-size: 14px;
    width: 100%;
    table-layout: auto;

    thead {
      border-bottom: 1px solid #e5e5e5;

      button {
        color: black;
      }

      tr {
        background-color: #efefef;

        th:first-child {
          padding-left: 40px;
          min-width: 400px;
        }
      }
    }

    tbody tr td:nth-child(1) {
      color: black;
      font-weight: 600;
      padding-left: 40px;
    }

    tbody tr td:nth-child(2) {
      font-size: 12px;
      color: #818181;
    }

    tbody tr td:last-child {
      width: 50px;
      padding-right: 40px;
    }
  }
</style>
