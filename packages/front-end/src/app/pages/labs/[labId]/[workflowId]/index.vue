<script setup lang="ts">
  import { useLabsStore, useUiStore } from '@FE/stores';
  import { EGTabsStyles } from '@FE/styles/nuxtui/UTabs';
  import { getDate, getTime } from '@FE/utils/date-time';

  const { $api } = useNuxtApp();
  const { labId, workflow } = useLabsStore();
  const $router = useRouter();

  // check permissions to be on this page
  if (!useUserStore().canViewLab(useUserStore().currentOrgId, labId)) {
    $router.push('/labs');
  }

  const tabItems = [
    {
      key: 'runDetails',
      label: 'Run Details',
    },
    {
      key: 'runResults',
      label: 'Run Results',
    },
  ];

  const runResultsColumns = [
    {
      key: 'fileName',
      label: 'File Names',
      sortable: true,
      sort: useSort().stringSortCompare,
    },
    {
      key: 'actions',
      label: 'Actions',
    },
  ];

  let tabIndex = 0;

  const createdDate = getDate(workflow?.dateCreated);
  const createdTime = getTime(workflow?.dateCreated);
  const startedDate = getDate(workflow?.start);
  const startedTime = getTime(workflow?.start);
  const stoppedDate = getDate(workflow?.complete);
  const stoppedTime = getTime(workflow?.complete);

  const createdDateTime = computed(() => {
    return createdDate && createdTime ? `${createdTime} ⋅ ${createdDate}` : '—';
  });
  const startedDateTime = computed(() => {
    return startedDate && startedTime ? `${startedTime} ⋅ ${startedDate}` : '—';
  });
  const stoppedDateTime = computed(() => {
    return stoppedDate && stoppedTime ? `${stoppedTime} ⋅ ${stoppedDate}` : '—';
  });

  const workflowReports = ref([]);

  onBeforeMount(async () => {
    let paramTab = $router.currentRoute.value.query?.tab;
    if (!paramTab) paramTab = 'Run Results'; // fallback for no query param to default to first tab
    tabIndex = paramTab ? tabItems.findIndex((tab) => tab.label === paramTab) : 0;

    useUiStore().setRequestPending(true);
    const response = await $api.workflows.readWorkflowReports(workflow.id, labId);
    workflowReports.value = response.reports;
    useUiStore().setRequestPending(false);
  });

  async function downloadReport(path: string) {
    const report = await $api.workflows.downloadReport(labId, path);
    if (report) {
      const link = document.createElement('a');
      link.href = report.url;
      link.download = report.DownloadUrl;
      link.click();
    }
  }

  // watch route change to correspondingly change selected tab
  watch(
    () => $router.currentRoute.value.query.tab,
    (newVal) => {
      tabIndex = newVal ? tabItems.findIndex((tab) => tab.label === newVal) : 0;
    },
  );
</script>

<template v-if="!useUiStore().isRequestPending">
  <EGPageHeader :title="workflow.runName" :description="workflow.projectName" :show-back="true" />
  <UTabs
    :ui="EGTabsStyles"
    :model-value="tabIndex"
    :items="tabItems"
    @update:model-value="
      (newIndex) => {
        $router.push({ query: { ...$router.currentRoute.query, tab: tabItems[newIndex].label } });
        tabIndex = newIndex;
      }
    "
  >
    <template #item="{ item }">
      <div v-if="item.key === 'runResults'" class="space-y-3">
        <EGTable
          :table-data="workflowReports"
          :columns="runResultsColumns"
          :is-loading="useUiStore().isRequestPending"
          no-results-msg="No results have been generated yet."
        >
          <template #actions-data="{ row, index }">
            <div class="flex items-center justify-end">
              <EGButton
                label="Download"
                variant="secondary"
                size="sm"
                @click="downloadReport(row.externalPath)"
                :icon-right="false"
                icon="i-heroicons-arrow-down-tray"
              />
            </div>
          </template>
        </EGTable>
      </div>
      <div v-if="item.key === 'runDetails'" class="space-y-3">
        <section
          class="stroke-light flex flex-col rounded-none rounded-b-2xl border border-solid bg-white p-6 pt-0 max-md:px-5"
        >
          <dl class="mt-4">
            <div class="flex border-b p-4 text-sm">
              <dt class="w-[200px] font-medium text-black">Workflow Run Status</dt>
              <dd class="text-muted text-left"><EGStatusChip :status="workflow.status" /></dd>
            </div>
            <div class="flex border-b p-4 text-sm">
              <dt class="w-[200px] font-medium text-black">Creation Time</dt>
              <dd class="text-muted text-left">{{ createdDateTime }}</dd>
            </div>
            <div class="flex border-b p-4 text-sm">
              <dt class="w-[200px] font-medium text-black">Start Time</dt>
              <dd class="text-muted text-left max-md:max-w-full">{{ startedDateTime }}</dd>
            </div>
            <div class="flex p-4 text-sm">
              <dt class="w-[200px] font-medium text-black">Stop Time</dt>
              <dd class="text-muted text-left max-md:max-w-full">{{ stoppedDateTime }}</dd>
            </div>
          </dl>
        </section>
      </div>
    </template>
  </UTabs>
</template>
