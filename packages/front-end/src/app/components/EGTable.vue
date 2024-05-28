<script setup lang="ts">
  import { LabAccessRolesEnum } from '~/types/labAccessRoles';

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
      showPagination: boolean;
    }>(),
    {
      isLoading: true,
    }
  );

  const localProps = reactive({
    tableData: props.tableData,
  });

  const $emit = defineEmits(['grant-access-clicked', 'lab-access-selected']);
  const isSortAsc = ref(true);
  const page = ref(1);
  const pageCount = ref(10);
  const pageTotal = computed(() => localProps.tableData.length);
  const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1);
  const pageTo = computed(() => Math.min(page.value * pageCount.value, pageTotal.value));
  const sortModel = ref({ column: 'Name', direction: 'asc' });
  const { showingResultsMsg } = useTable(pageFrom, pageTo, pageTotal);

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
    (newTableData: any) => {
      localProps.tableData = newTableData;
      sortAsc();
    }
  );

  const labAccessItems = [
    {
      label: 'Lab Technician',
      role: LabAccessRolesEnum.enum.LabTechnician,
    },
    {
      label: 'Lab Manager',
      role: LabAccessRolesEnum.enum.LabManager,
    },
  ];
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
        <USelectMenu
          v-if="row.labAccessOptionsEnabled"
          v-model="row.labRole.role"
          :options="labAccessItems"
          value-attribute="role"
          option-attribute="label"
          @update:modelValue="
            (newRole) => {
              $emit('lab-access-selected', {
                role: newRole,
                labId: row.LaboratoryId,
                labName: row.Name,
              });
            }
          "
        />
        <EGButton
          v-else-if="row.labAccess"
          @click="
            $emit('grant-access-clicked', {
              labId: row.LaboratoryId,
              name: row.Name,
            })
          "
          label="Grant access"
          variant="secondary"
          size="sm"
        />
        <EGActionButton v-else-if="actionItems" :items="actionItems(row)" />
      </template>
      <template #empty-state>
        <div class="text-muted flex h-12 items-center justify-center font-normal">No results found</div>
      </template>
    </UTable>
  </UCard>

  <!-- TODO: componentize Pagination -->
  <div class="text-muted flex h-16 flex-wrap items-center justify-between" v-if="showPagination && !isLoading">
    <div class="text-xs leading-5">{{ showingResultsMsg }}</div>
    <div class="flex justify-end px-3" v-if="pageTotal > pageCount">
      <UPagination v-model="page" :page-count="10" :total="localProps.tableData.length" />
    </div>
  </div>
</template>

<style lang="scss">
  .EGTable {
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
          width: 400px;
        }
        th:last-child {
          text-align: right;
          padding-right: 40px;
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
      text-align: right;
    }
  }
</style>
