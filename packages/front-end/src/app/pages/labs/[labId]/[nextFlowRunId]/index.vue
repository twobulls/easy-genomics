<script setup lang="ts">
  import { EGTabsStyles } from '@FE/styles/nuxtui/UTabs';
  import { getDate, getTime } from '@FE/utils/date-time';
  import { Workflow as NextFlowRun } from '@easy-genomics/shared-lib/lib/app/types/nf-tower/nextflow-tower-api';
  import { FileDownloadResponse } from '@/packages/shared-lib/src/app/types/nf-tower/file/request-file-download';

  const { $api } = useNuxtApp();
  const $router = useRouter();
  const $route = useRoute();

  const runStore = useRunStore();

  const labId: string = $route.params.labId;
  const nextFlowRunId: string = $route.params.nextFlowRunId;
  const nextFlowRunReports = ref([]);
  let nextFlowRunBasePath = '';

  // check permissions to be on this page
  if (!useUserStore().canViewLab(labId)) {
    $router.push('/labs');
  }

  const nextFlowRun = computed<NextFlowRun | null>(() => runStore.nextFlowRuns[labId][nextFlowRunId]);

  async function loadNextFlowRun() {
    try {
      runStore.loadSingleNextFlowRun(labId, nextFlowRunId);
    } catch (e: any) {
      console.error('Failed to get NextFlow run from API:', e);
    }
  }

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

  let tabIndex = ref(0);
  // set tabIndex according to query param
  onMounted(() => {
    const queryTab = $route.query.tab as string;
    const queryTabMatchIndex = tabItems.findIndex((tab) => tab.label === queryTab);
    tabIndex.value = queryTabMatchIndex !== -1 ? queryTabMatchIndex : 0;
  });

  const createdDateTime = computed(() => {
    const createdDate = getDate(nextFlowRun.value?.dateCreated);
    const createdTime = getTime(nextFlowRun.value?.dateCreated);
    return createdDate && createdTime ? `${createdTime} ⋅ ${createdDate}` : '—';
  });
  const startedDateTime = computed(() => {
    const startedDate = getDate(nextFlowRun.value?.start);
    const startedTime = getTime(nextFlowRun.value?.start);
    return startedDate && startedTime ? `${startedTime} ⋅ ${startedDate}` : '—';
  });
  const stoppedDateTime = computed(() => {
    const stoppedDate = getDate(nextFlowRun.value?.complete);
    const stoppedTime = getTime(nextFlowRun.value?.complete);
    return stoppedDate && stoppedTime ? `${stoppedTime} ⋅ ${stoppedDate}` : '—';
  });

  onBeforeMount(initData);

  async function downloadReport(fileName: string, path: string, size: number) {
    const fileDownload: FileDownloadResponse = await $api.workflows.getNextFlowFileDownload(labId, path);
    if (fileDownload) {
      const link = document.createElement('a');
      link.href = `data:${size};base64,${fileDownload.Data}`;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(link.href);
    }
  }

  async function initData() {
    useUiStore().setRequestPending('loadNextFlowRun');
    await loadNextFlowRun();
    const res = await $api.workflows.readWorkflowReports(nextFlowRunId, labId);
    nextFlowRunReports.value = res.reports;
    nextFlowRunBasePath = res.basePath;
    useUiStore().setRequestComplete('loadNextFlowRun');
  }
</script>

<template>
  <EGPageHeader
    :title="nextFlowRun?.runName || ''"
    :description="nextFlowRun?.projectName || ''"
    :show-back="true"
    :back-action="() => $router.push(`/labs/${labId}`)"
    :is-loading="useUiStore().isRequestPending('loadNextFlowRun')"
    :skeleton-config="{ titleLines: 2, descriptionLines: 1 }"
  />

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
          :table-data="nextFlowRunReports"
          :columns="runResultsColumns"
          :is-loading="useUiStore().isRequestPending('loadNextFlowRun')"
          no-results-msg="No results have been generated yet."
        >
          <template #actions-data="{ row, index }">
            <div class="flex items-center justify-end">
              <EGButton
                label="Download"
                variant="secondary"
                size="sm"
                @click="downloadReport(row.fileName, `${nextFlowRunBasePath}${row.path}`, row.size)"
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
              <dd class="text-muted text-left"><EGStatusChip :status="nextFlowRun?.status" /></dd>
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
