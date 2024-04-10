<script lang="ts">
  defineProps<{
    // columns: Array<{}>;
    // orgData: Array<{}>;
    // page: number;
    // pageFrom: number;
    // pageTo: number;
    sortedData: Array<{}>; // TODOO
    // actionItems: (row: Array<{}>) => Array<{}>;
  }>();
</script>

<template>
  <UCard
    class="rounded-2xl border-none shadow-none"
    :ui="{
      body: 'p-0',
    }"
  >
    <UTable class="LabsTable rounded-2xl" :rows="sortedData" :columns="columns">
      <template #actions-data="{ row }">
        <EGActionButton :items="actionItems(row)" />
      </template>
    </UTable>
  </UCard>

  <div class="text-muted flex h-16 flex-wrap items-center justify-between">
    <div class="text-xs leading-5">Showing {{ pageFrom }} to {{ pageTo }} results</div>
    <div class="flex justify-end px-3" v-if="page > 1">
      <UPagination v-model="page" :page-count="10" :total="orgData.length" />
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
