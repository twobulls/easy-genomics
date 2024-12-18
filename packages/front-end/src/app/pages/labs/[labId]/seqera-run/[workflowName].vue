<script setup lang="ts">
  import { getDate, getTime } from '@FE/utils/date-time';
  import { Workflow as SeqeraRun } from '@easy-genomics/shared-lib/lib/app/types/nf-tower/nextflow-tower-api';
  import { S3Response } from '@/packages/shared-lib/src/app/types/easy-genomics/file/request-list-bucket-objects';
  import { useRunStore } from '@FE/stores';

  const { $api } = useNuxtApp();
  const $router = useRouter();
  const $route = useRoute();
  const runStore = useRunStore();

  const labId = $route.params.labId as string;
  const workflowName = $route.params.workflowName as string;
  const seqeraRunReports = ref([]);
  const s3Contents = ref<S3Response>(null);
  const tabIndex = ref(0);

  // check permissions to be on this page
  if (!useUserStore().canViewLab(labId)) {
    $router.push('/labs');
  }

  // TODO: switch 'healthomics' suffix for HealthOmics labs
  const s3Prefix = computed(() => `${useUserStore().currentOrgId}/${labId}/next-flow/${runId.value}`);
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

  const seqeraRun = computed<SeqeraRun | null>(() => runStore.seqeraRuns[labId][workflowName]);

  const createdDateTime = computed(() => {
    const createdDate = getDate(seqeraRun.value?.dateCreated);
    const createdTime = getTime(seqeraRun.value?.dateCreated);
    return createdDate && createdTime ? `${createdTime} ⋅ ${createdDate}` : '—';
  });
  const startedDateTime = computed(() => {
    const startedDate = getDate(seqeraRun.value?.start);
    const startedTime = getTime(seqeraRun.value?.start);
    return startedDate && startedTime ? `${startedTime} ⋅ ${startedDate}` : '—';
  });
  const stoppedDateTime = computed(() => {
    const stoppedDate = getDate(seqeraRun.value?.complete);
    const stoppedTime = getTime(seqeraRun.value?.complete);
    return stoppedDate && stoppedTime ? `${stoppedTime} ⋅ ${stoppedDate}` : '—';
  });

  async function loadRunReports() {
    useUiStore().setRequestPending('loadRunReports');
    const res = await $api.seqeraRuns.readWorkflowReports(workflowName, labId);
    seqeraRunReports.value = res.reports;
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

  const runId = ref('');

  // set tabIndex according to query param
  onMounted(() => {
    if ($route.query.runId) {
      runId.value = $route.query.runId as string; // Set runId from query if available
    }

    const queryTab = $route.query.tab as string; // Get the tab query parameter
    console.log('Query Tab on Load:', queryTab); // Debug

    // Validate if the tab exists in `tabItems`
    const matchedTabIndex = tabItems.value.findIndex((tab) => tab.label === queryTab);

    if (matchedTabIndex !== -1) {
      // If the tab exists in tabItems, set the tab index
      tabIndex.value = matchedTabIndex;
    } else {
      // Otherwise, set a default (first tab) and update the query to match
      console.log('Invalid or missing tab query. Defaulting to first tab.'); // Debug
      tabIndex.value = 0;

      $router.replace({
        path: $route.path,
        query: {
          ...$route.query,
          tab: tabItems.value[0]?.label, // Default tab label
        },
      });
    }
  });

  watch(
    () => runId.value,
    (newRunId) => {
      $router.replace({
        path: $route.path,
        query: {
          ...$route.query,
          runId: newRunId, // Set runId as a query parameter
        },
      });
    },
    { immediate: true }, // This ensures the watcher runs immediately with the initial value
  );

  watch(
    () => $route.query.tab,
    (newTab) => {
      const matchedTabIndex = tabItems.value.findIndex((tab) => tab.label === newTab);

      if (matchedTabIndex !== -1) {
        tabIndex.value = matchedTabIndex;
      }
    },
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

  function updateTab(newIndex: number) {
    // Update the local tab index
    tabIndex.value = newIndex;

    // Replace the query in the URL with the updated tab
    $router.replace({
      path: $route.path,
      query: {
        ...$route.query,
        tab: tabItems.value[newIndex].label, // Update the 'tab' query parameter with the corresponding label
      },
    });

    console.log('Updated query tab:', tabItems.value[newIndex].label); // Optional debug log
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

  <UTabs :ui="EGTabsStyles" v-model="tabIndex" :items="tabItems" @update:model-value="updateTab">
    <template #item="{ item }">
      <div v-if="item.key === 'runResults'" class="space-y-3">
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
          <dl class="mt-4">
            <div class="flex border-b p-4 text-sm">
              <dt class="w-[200px] font-medium text-black">Run Status</dt>
              <dd class="text-muted text-left"><EGStatusChip :status="seqeraRun?.status" /></dd>
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
