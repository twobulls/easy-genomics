<script setup lang="ts">
  interface ActionItem {
    label: string;
    click: Function;
  }

  const props = withDefaults(
    defineProps<{
      tableData: Array;
      columns: Array;
      isLoading?: boolean;
      actionItems: () => ActionItem[];
      showPagination: boolean;
    }>(),
    {
      isLoading: true,
    }
  );

  const localProps = reactive({
    tableData: props.tableData,
  });
  const isSortAsc = ref(true);
  const page = ref(1);
  const pageCount = ref(10);
  const pageTotal = computed(() => localProps.tableData.length);
  const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1);
  const pageTo = computed(() => Math.min(page.value * pageCount.value, pageTotal.value));
  const sortModel = ref({ column: 'Name', direction: 'asc' });

  const rows = computed(() => {
    return localProps.tableData.slice((page.value - 1) * pageCount.value, page.value * pageCount.value);
  });

  function sortAsc() {
    localProps.tableData = localProps.tableData.sort((a, b) =>
      a.Name.toLowerCase().localeCompare(b.Name.toLowerCase())
    );
  }

  function sortDesc() {
    localProps.tableData.reverse();
  }

  watch(
    () => props.tableData,
    (newTableData) => {
      localProps.tableData = newTableData;
      sortAsc();
    }
  );
</script>

<template>
  <UCard
    class="rounded-2xl border-none shadow-none"
    :ui="{
      body: 'p-0',
    }"
  >
    <UTable
      class="EGTable rounded-2xl"
      :rows="rows"
      :columns="columns"
      :loading="isLoading"
      :loading-state="{ icon: '', label: '' }"
      @update:sort="isSortAsc ? sortDesc() : sortAsc()"
      v-model:sort="sortModel"
      sort-mode="manual"
    >
      <template #actions-data="{ row }">
        <EGActionButton :items="actionItems(row)" />
      </template>
      <template #empty-state>&nbsp;</template>
    </UTable>
  </UCard>

  <div class="text-muted flex h-16 flex-wrap items-center justify-between" v-if="showPagination">
    <div class="text-xs leading-5">Showing {{ pageFrom }} to {{ pageTo }} results</div>
    <div class="flex justify-end px-3" v-if="pageTotal > pageCount">
      <UPagination v-model="page" :page-count="10" :total="localProps.tableData.length" />
    </div>
  </div>
</template>

<style lang="scss">
  .EGTable {
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
          width: 400px;
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
