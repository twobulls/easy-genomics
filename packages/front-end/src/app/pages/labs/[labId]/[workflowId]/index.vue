<script setup lang="ts">
  import { EGTabsStyles } from '@FE/styles/nuxtui/UTabs';
  import { getDate, getTime } from '@FE/utils/date-time';
  import { Workflow } from '@easy-genomics/shared-lib/lib/app/types/nf-tower/nextflow-tower-api';
  import { FileDownloadUrlResponse } from '@/packages/shared-lib/src/app/types/easy-genomics/file/download/request-file-download-url';

  const { $api } = useNuxtApp();
  const $router = useRouter();
  const $route = useRoute();

  const workflowStore = useWorkflowStore();

  const labId = $route.params.labId as string;
  const workflowId = $route.params.workflowId as string;
  const workflowReports = ref([]);

  // check permissions to be on this page
  if (!useUserStore().canViewLab(useUserStore().currentOrgId, labId)) {
    $router.push('/labs');
  }

  const workflow = computed<Workflow | null>(() => workflowStore.workflows[labId][workflowId]);

  async function loadWorkflow() {
    try {
      workflowStore.loadSingleWorkflow(labId, workflowId);
    } catch (e: any) {
      console.error('Failed to get workflow from API:', e);
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
    const createdDate = getDate(workflow.value?.dateCreated);
    const createdTime = getTime(workflow.value?.dateCreated);
    return createdDate && createdTime ? `${createdTime} ⋅ ${createdDate}` : '—';
  });
  const startedDateTime = computed(() => {
    const startedDate = getDate(workflow.value?.start);
    const startedTime = getTime(workflow.value?.start);
    return startedDate && startedTime ? `${startedTime} ⋅ ${startedDate}` : '—';
  });
  const stoppedDateTime = computed(() => {
    const stoppedDate = getDate(workflow.value?.complete);
    const stoppedTime = getTime(workflow.value?.complete);
    return stoppedDate && stoppedTime ? `${stoppedTime} ⋅ ${stoppedDate}` : '—';
  });

  onBeforeMount(initData);

  async function downloadReport(fileName: string, path: string) {
    const report: FileDownloadUrlResponse = await $api.workflows.downloadReport(labId, path);
    if (report) {
      const link = document.createElement('a');
      link.href = report.DownloadUrl;
      link.download = fileName;
      link.click();
    }
  }

  async function initData() {
    useUiStore().setRequestPending('loadWorkflow');
    await loadWorkflow();
    const res = await $api.workflows.readWorkflowReports(workflowId, labId);
    workflowReports.value = res.reports;
    useUiStore().setRequestComplete('loadWorkflow');
  }
</script>

<template>
  <EGPageHeader
    :title="workflow?.runName || ''"
    :description="workflow?.projectName || ''"
    :show-back="true"
    :back-action="() => $router.push(`/labs/${labId}`)"
    :is-loading="useUiStore().isRequestPending('loadWorkflow')"
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
          :table-data="workflowReports"
          :columns="runResultsColumns"
          :is-loading="useUiStore().isRequestPending('loadWorkflow')"
          no-results-msg="No results have been generated yet."
        >
          <template #actions-data="{ row, index }">
            <div class="flex items-center justify-end">
              <EGButton
                label="Download"
                variant="secondary"
                size="sm"
                @click="downloadReport(row.fileName, row.externalPath)"
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
              <dd class="text-muted text-left"><EGStatusChip :status="workflow?.status" /></dd>
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
