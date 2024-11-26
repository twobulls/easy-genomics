<script setup lang="ts">
  import { EGTabsStyles } from '@FE/styles/nuxtui/UTabs';
  import { getDate, getTime } from '@FE/utils/date-time';
  import { Workflow as NextFlowRun } from '@easy-genomics/shared-lib/lib/app/types/nf-tower/nextflow-tower-api';
  import { S3Response } from '@/packages/shared-lib/src/app/types/easy-genomics/file/request-list-bucket-objects';
  import { useRunStore } from '@FE/stores';

  const { $api } = useNuxtApp();
  const $router = useRouter();
  const $route = useRoute();
  const runStore = useRunStore();

  const labId = $route.params.labId as string;
  const nextFlowRunId = $route.params.nextFlowRunId as string;
  const nextFlowRunReports = ref([]);
  const s3Contents = ref<S3Response>(null);
  const tabIndex = ref(0);

  // check permissions to be on this page
  if (!useUserStore().canViewLab(labId)) {
    $router.push('/labs');
  }

  // TODO: switch 'healthomics' suffix for HealthOmics labs
  const s3Prefix = computed(() => `${useUserStore().currentOrgId}/${labId}/next-flow`);
  const tabItems = computed(() => [
    {
      key: 'runDetails',
      label: 'Run Details',
    },
    {
      key: 'runResults',
      label: 'Run Results',
    },
  ]);

  const nextFlowRun = computed<NextFlowRun | null>(() => runStore.nextFlowRuns[labId][nextFlowRunId]);

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

  async function loadRunReports() {
    useUiStore().setRequestPending('loadRunReports');
    const res = await $api.workflows.readWorkflowReports(nextFlowRunId, labId);
    nextFlowRunReports.value = res.reports;
    useUiStore().setRequestComplete('loadRunReports');
  }

  async function fetchS3Content() {
    useUiStore().setRequestPending('fetchS3Content');
    try {
      const res = await $api.file.requestListBucketObjects({
        LaboratoryId: labId,
        S3Prefix: s3Prefix.value,
      });
      s3Contents.value = res;
    } catch (error) {
      console.error('Error fetching S3 content', error);
    } finally {
      useUiStore().setRequestComplete('fetchS3Content');
    }
  }

  onBeforeMount(async () => {
    await loadRunReports();
    // TODO: add API call to get Run ID to construct s3 prefix for fetchS3Content() - see: Andrew
    await fetchS3Content();
  });

  // set tabIndex according to query param
  onMounted(() => {
    const queryTab = $route.query.tab as string;
    const queryTabMatchIndex = tabItems.value.findIndex((tab) => tab.label === queryTab);
    tabIndex.value = queryTabMatchIndex !== -1 ? queryTabMatchIndex : 0;
  });
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
        <EGFileExplorer
          :s3-contents="s3Contents"
          :lab-id="labId"
          :workflow-id="nextFlowRunId"
          :is-loading="useUiStore().isRequestPending('fetchS3Content')"
        />
      </div>
      <div v-if="item.key === 'runDetails'" class="space-y-3">
        <section
          class="stroke-light flex flex-col rounded-none rounded-b-2xl border border-solid bg-white p-6 pt-0 max-md:px-5"
        >
          <dl class="mt-4">
            <div class="flex border-b p-4 text-sm">
              <dt class="w-[200px] font-medium text-black">Run Status</dt>
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
