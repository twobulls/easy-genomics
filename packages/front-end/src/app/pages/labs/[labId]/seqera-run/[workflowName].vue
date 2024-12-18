<script setup lang="ts">
  import { getDate, getTime } from '@FE/utils/date-time';
  import { S3Response } from '@/packages/shared-lib/src/app/types/easy-genomics/file/request-list-bucket-objects';
  import { useRunStore } from '@FE/stores';
  import { useDebounceFn } from '@vueuse/core';

  const { $api } = useNuxtApp();
  const $router = useRouter();
  const $route = useRoute();
  const runStore = useRunStore();

  const labId = $route.params.labId as string;
  const workflowName = $route.params.workflowName as string;

  const seqeraRunReports = ref([]);
  const s3Contents = ref<S3Response>(null);
  const tabIndex = ref(0);
  const runId = ref(''); // Run ID from query params

  // Permission Check
  if (!useUserStore().canViewLab(labId)) {
    $router.push('/labs');
  }

  const tabItems = computed(() => [
    { key: 'runDetails', label: 'Run Details' },
    { key: 'runResults', label: 'Run Results' },
  ]);

  const seqeraRun = computed(() => runStore.seqeraRuns[labId]?.[workflowName] || null);

  const createdDateTime = computed(() => formatDateTime(seqeraRun.value?.dateCreated));
  const startedDateTime = computed(() => formatDateTime(seqeraRun.value?.start));
  const stoppedDateTime = computed(() => formatDateTime(seqeraRun.value?.complete));

  function formatDateTime(date: string | undefined): string {
    const datePart = getDate(date);
    const timePart = getTime(date);
    return datePart && timePart ? `${timePart} ⋅ ${datePart}` : '—';
  }

  function validateAndSetTabIndex(queryTab: string): void {
    const matchedIndex = tabItems.value.findIndex((item) => item.label === queryTab);
    if (matchedIndex !== -1) {
      tabIndex.value = matchedIndex;
    } else {
      // Default to first tab if invalid
      tabIndex.value = 0;
      updateQueryParams({ tab: tabItems.value[0]?.label });
    }
  }

  const updateQueryParams = useDebounceFn((params: Record<string, string | undefined>) => {
    $router.replace({ path: $route.path, query: { ...$route.query, ...params } });
  }, 300);

  onBeforeMount(() => {
    runId.value = ($route.query.runId as string) || '';
    Promise.all([fetchS3Content(), loadRunReports()]);
  });

  onMounted(() => {
    validateAndSetTabIndex(($route.query.tab as string) || tabItems.value[0]?.label);
  });

  watch(
    () => runId.value,
    (newRunId) => {
      updateQueryParams({ runId: newRunId }), { immediate: true };
    },
  );

  watch(
    () => $route.query.tab,
    (newTab) => validateAndSetTabIndex(newTab as string),
  );

  // Note: the UTabs :ui attribute has to be defined locally in this file - if it is imported from another file,
  //  Tailwind won't pick up and include the classes used and styles will be missing.
  // To keep the tab styling consistent throughout the app, any changes made here need to be duplicated to all other
  //  UTabs that use an "EGTabsStyles" as input to the :ui attribute.
  const EGTabsStyles = {
    base: 'focus:outline-none',
    list: {
      base: '!flex border-b-2 rounded-none mb-6 mt-0',
      padding: 'p-0',
      height: 'h-14',
      marker: {
        wrapper: 'duration-200 ease-out absolute bottom-0 ',
        base: 'absolute bottom-0 rounded-none h-0.5',
        background: 'bg-primary',
        shadow: 'shadow-none',
      },
      tab: {
        base: 'font-serif w-auto inline-flex justify-start ui-focus-visible:outline-0 ui-focus-visible:ring-2 ui-focus-visible:ring-primary-500 ui-not-focus-visible:outline-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-75 duration-200 ease-out mr-16',
        active: 'text-primary h-14',
        inactive: 'font-serif',
        height: 'h-14',
        padding: 'p-0',
        size: 'text-lg',
      },
    },
  };

  async function loadRunReports() {
    useUiStore().setRequestPending('loadRunReports');
    try {
      const res = await $api.seqeraRuns.readWorkflowReports(workflowName, labId);
      seqeraRunReports.value = res.reports || [];
    } finally {
      useUiStore().setRequestComplete('loadRunReports');
    }
  }

  async function fetchS3Content() {
    useUiStore().setRequestPending('fetchS3Content');
    try {
      const res = await $api.file.requestListBucketObjects({
        LaboratoryId: labId,
        S3Prefix: `${useUserStore().currentOrgId}/${labId}/next-flow/${runId.value}`,
      });
      s3Contents.value = res || null;
    } catch (error) {
      console.error('Error fetching S3 content:', error);
    } finally {
      useUiStore().setRequestComplete('fetchS3Content');
    }
  }

  function handleTabChange(newIndex: number) {
    tabIndex.value = newIndex;
    updateQueryParams({ tab: tabItems.value[newIndex]?.label });
  }
</script>

<template>
  <EGPageHeader
    :title="seqeraRun?.runName || ''"
    :description="seqeraRun?.projectName || ''"
    :show-back="true"
    :back-action="() => $router.push(`/labs/${labId}`)"
    :is-loading="useUiStore().isRequestPending('loadSeqeraRun')"
    :skeleton-config="{ titleLines: 2, descriptionLines: 1 }"
  />

  <UTabs :ui="EGTabsStyles" v-model="tabIndex" :items="tabItems" @update:model-value="handleTabChange">
    <template #item="{ item }">
      <div v-show="item.key === 'runResults'" class="space-y-3">
        <EGFileExplorer
          :s3-contents="s3Contents"
          :lab-id="labId"
          :seqera-run-id="workflowName"
          :is-loading="useUiStore().isRequestPending('fetchS3Content')"
        />
      </div>
      <div v-if="item.key === 'runDetails'" class="space-y-3">
        <section
          class="stroke-light flex flex-col rounded-none rounded-b-2xl border border-solid bg-white p-6 pt-0 max-md:px-5"
        >
          <dl class="mt-4 space-y-4">
            <div class="flex border-b p-4 text-sm">
              <dt class="w-[200px] font-medium text-black">Run Status</dt>
              <dd class="text-muted text-left">
                <EGStatusChip :status="seqeraRun?.status" />
              </dd>
            </div>
            <div class="flex border-b p-4 text-sm">
              <dt class="w-[200px] font-medium text-black">Creation Time</dt>
              <dd class="text-muted text-left">{{ createdDateTime }}</dd>
            </div>
            <div class="flex border-b p-4 text-sm">
              <dt class="w-[200px] font-medium text-black">Start Time</dt>
              <dd class="text-muted text-left">{{ startedDateTime }}</dd>
            </div>
            <div class="flex p-4 text-sm">
              <dt class="w-[200px] font-medium text-black">Stop Time</dt>
              <dd class="text-muted text-left">{{ stoppedDateTime }}</dd>
            </div>
          </dl>
        </section>
      </div>
    </template>
  </UTabs>
</template>
