<script setup lang="ts">
  interface ActionItem {
    label: string;
    click: Function;
  }

  const props = withDefaults(
    defineProps<{
      tableData: any[];
      columns: any[];
      isLoading?: boolean;
      actionItems?: () => ActionItem[];
      showPagination?: boolean;
      rowClickAction?: (rowItem: any) => void | undefined;
      noResultsMsg?: string;
    }>(),
    {
      isLoading: false,
      showPagination: true,
      noResultsMsg: 'No results found',
    },
  );

  const localProps = reactive({
    tableData: props.tableData,
  });

  const page = ref(1);
  const pageCount = ref(10);
  const pageTotal = computed(() => localProps.tableData.length);
  const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1);
  const pageTo = computed(() => Math.min(page.value * pageCount.value, pageTotal.value));
  const { showingResultsMsg } = useTable(pageFrom, pageTo, pageTotal);

  const rows = computed(() => {
    return localProps.tableData.slice((page.value - 1) * pageCount.value, page.value * pageCount.value);
  });

  watch(
    () => props.tableData,
    (newTableData: any) => {
      localProps.tableData = newTableData;
    },
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
      :ui="{
        tr: {
          active: ` ${rowClickAction ? 'hover:bg-gray-50 cursor-pointer' : 'hover:bg-white cursor-default'}`,
        },
      }"
      @select="rowClickAction ? rowClickAction($event) : undefined"
      class="rounded-2xl"
      :rows="rows"
      :columns="columns"
      :loading="isLoading"
      :loading-state="{ icon: '', label: '' }"
    >
      <!-- Custom columns can be passed in as slots from parent -->
      <template v-for="(_, slotName) in $slots" #[slotName]="slotData">
        <slot :name="slotName" v-bind="slotData"></slot>
      </template>

      <template #actions-data="{ row }">
        <EGActionButton v-if="actionItems" :items="actionItems(row)" @click="$event.stopPropagation()" />
      </template>
      <template #empty-state>
        <div class="text-muted flex h-12 items-center justify-center font-normal" v-if="!isLoading">
          {{ noResultsMsg }}
        </div>
      </template>
    </UTable>
  </UCard>

  <div class="text-muted flex h-16 flex-wrap items-center justify-between" v-if="showPagination && !isLoading">
    <div class="text-xs leading-5">{{ showingResultsMsg }}</div>
    <div class="flex justify-end px-3" v-if="pageTotal > pageCount">
      <UPagination v-model="page" :page-count="10" :total="localProps.tableData.length" />
    </div>
  </div>
</template>

<style scoped lang="scss">
  /**
   * Table styles are quite granular so styled here via SCSS instead of the UTable's :ui prop config object
   */
  :deep(table) {
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    width: 100%;
    table-layout: auto;

    thead {
      button {
        color: black;
      }

      tr {
        background-color: #efefef;

        th:first-child {
          padding-left: 40px;
          width: 320px;
        }

        th:not(:only-child):last-child {
          text-align: right;
          padding-right: 40px;
        }
      }
    }

    tbody tr {
      td {
        padding-top: 22px;
        padding-bottom: 22px;
      }
    }

    tbody tr td:nth-child(1) {
      color: black;
      font-weight: 600;
      padding-left: 40px;
      white-space: normal;
    }

    tbody tr td:not(:first-child) {
      font-size: 12px;
      color: #818181;
      white-space: normal;
    }

    tbody tr td:not(:only-child):last-child {
      width: 50px;
      padding-right: 40px;
      text-align: right;
    }
  }
</style>
