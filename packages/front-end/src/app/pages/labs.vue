<script setup lang="ts">
  const { $api } = useNuxtApp();
  const labData = ref([]);
  const page = ref(1);
  const pageCount = ref(10);
  const pageTotal = computed(() => labData.value.length);
  const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1);
  const pageTo = computed(() => Math.min(page.value * pageCount.value, pageTotal.value));
  const MOCK_ORG_ID = '6a80b4fa-1cfe-4345-ae62-cdc58dbec69c';

  const columns = [
    {
      key: 'Name',
      label: 'Name',
      sortable: true,
    },
    {
      key: 'Name', // TODO: confirm Description API response
      label: 'Description',
    },
    {
      key: 'actions',
      label: '',
    },
  ];

  const labsSortedAlphabetically = computed(() => {
    return labData.value
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

  onBeforeMount(async () => {
    try {
      labData.value = await $api.labs.list(MOCK_ORG_ID);
    } catch (error) {
      console.error(error);
    }
  });
</script>

<template>
  <div class="center mb-8 flex justify-between">
    <EGText tag="h1">Labs</EGText>
    <EGButton label="Create a new Lab" class="self-end" />
  </div>

  <UCard
    class="rounded-2xl border-none shadow-none"
    :ui="{
      body: 'p-0',
    }"
  >
    <UTable class="LabsTable rounded-2xl" :rows="labsSortedAlphabetically" :columns="columns" :loading="pending">
      <template #actions-data="{ row }">
        <EGActionButton :items="actionItems(row)" />
      </template>
    </UTable>
  </UCard>

  <div class="text-muted flex flex-wrap items-center justify-between">
    <div class="text-xs leading-5">Showing {{ pageFrom }} to {{ pageTo }} results</div>
    <div class="flex justify-end px-3 py-3.5">
      <UPagination v-if="labData.length > 1" v-model="page" :page-count="10" :total="labData.length" />
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
        height: 50px;
        background-color: #efefef;

        th:first-child {
          padding-left: 40px;
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
