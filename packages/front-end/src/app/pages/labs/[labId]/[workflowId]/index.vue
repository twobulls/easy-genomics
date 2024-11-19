<script setup lang="ts">
  import { EGTabsStyles } from '@FE/styles/nuxtui/UTabs';
  import { getDate, getTime } from '@FE/utils/date-time';
  import { Workflow } from '@easy-genomics/shared-lib/lib/app/types/nf-tower/nextflow-tower-api';

  const { $api } = useNuxtApp();
  const $router = useRouter();
  const $route = useRoute();

  const workflowStore = useWorkflowStore();

  const labId: string = $route.params.labId;
  const workflowId: string = $route.params.workflowId;
  const workflowReports = ref([]);
  let workflowBasePath = '';

  // check permissions to be on this page
  if (!useUserStore().canViewLab(labId)) {
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

  // const s3JsonData = {
  //   'IsTruncated': false,
  //   'Contents': [
  //     {
  //       'Key': 'example-folder/',
  //       'LastModified': '2023-10-01T12:00:00.000Z',
  //       'ETag': '"d41d8cd98f00b204e9800998ecf8427e"',
  //       'Size': 0,
  //       'StorageClass': 'STANDARD',
  //     },
  //     {
  //       'Key': 'example-folder/file1.txt',
  //       'LastModified': '2023-10-01T12:00:00.000Z',
  //       'ETag': '"9b2cf535f27731c974343645a3985328"',
  //       'Size': 1024,
  //       'StorageClass': 'STANDARD',
  //     },
  //     {
  //       'Key': 'example-folder/file2.txt',
  //       'LastModified': '2023-10-01T12:00:00.000Z',
  //       'ETag': '"9b2cf535f27731c974343645a3985328"',
  //       'Size': 2048,
  //       'StorageClass': 'STANDARD',
  //     },
  //     {
  //       'Key': 'example-folder/subfolder1/',
  //       'LastModified': '2023-10-01T12:00:00.000Z',
  //       'ETag': '"d41d8cd98f00b204e9800998ecf8427e"',
  //       'Size': 0,
  //       'StorageClass': 'STANDARD',
  //     },
  //     {
  //       'Key': 'example-folder/subfolder1/file3.txt',
  //       'LastModified': '2023-10-01T12:00:00.000Z',
  //       'ETag': '"9b2cf535f27731c974343645a3985328"',
  //       'Size': 4096,
  //       'StorageClass': 'STANDARD',
  //     },
  //     {
  //       'Key': 'example-folder/subfolder2/',
  //       'LastModified': '2023-10-01T12:00:00.000Z',
  //       'ETag': '"d41d8cd98f00b204e9800998ecf8427e"',
  //       'Size': 0,
  //       'StorageClass': 'STANDARD',
  //     },
  //     {
  //       'Key': 'example-folder/subfolder2/file4.txt',
  //       'LastModified': '2023-10-01T12:00:00.000Z',
  //       'ETag': '"9b2cf535f27731c974343645a3985328"',
  //       'Size': 8192,
  //       'StorageClass': 'STANDARD',
  //     },
  //   ],
  //   'Name': '851725267090-dev-build-lab-bucket',
  //   'Prefix':
  //     '61c86013-74f2-4d30-916a-70b03a97ba14/bbac4190-0446-4db4-a084-cfdbc8102297/next-flow/e2dccfc5-700e-4df7-a4c0-f9fb3d611d03/',
  //   'MaxKeys': 1000,
  //   'CommonPrefixes': [],
  //   'KeyCount': 7,
  // };

  const s3JsonData = {
    '$metadata': {
      'httpStatusCode': 200,
      'requestId': '2B1G0TX4F6GEKWDX',
      'extendedRequestId':
        'sfMnSaYXVLGTabb47nxtd+N7meJyI4QEeHFFUWXBrOZFa1Dwhps/wUInySHLZLAcUkZxTGr+5LZPSY8EWccRMVWSQeQNaRnxLJGLO+zGdyQ=',
      'attempts': 1,
      'totalRetryDelay': 0,
    },
    'Contents': [
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/bbac4190-0446-4db4-a084-cfdbc8102297/next-flow/e2dccfc5-700e-4df7-a4c0-f9fb3d611d03/medium_R1_.gz',
        'LastModified': '2024-10-28T02:21:01.000Z',
        'ETag': '"2dbb80b6df1d5fab83e615b4d592a477"',
        'Size': 2917297,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/bbac4190-0446-4db4-a084-cfdbc8102297/next-flow/e2dccfc5-700e-4df7-a4c0-f9fb3d611d03/medium_R2_.gz',
        'LastModified': '2024-10-28T02:21:03.000Z',
        'ETag': '"2dbb80b6df1d5fab83e615b4d592a477"',
        'Size': 2917297,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/bbac4190-0446-4db4-a084-cfdbc8102297/next-flow/e2dccfc5-700e-4df7-a4c0-f9fb3d611d03/sample-sheet.csv',
        'LastModified': '2024-10-28T02:21:05.000Z',
        'ETag': '"04f895c398afdd9d5a849ad578531741"',
        'Size': 383,
        'StorageClass': 'STANDARD',
      },
    ],
    'IsTruncated': false,
    'KeyCount': 3,
    'MaxKeys': 1000,
    'Name': '851725267090-dev-build-lab-bucket',
    'Prefix':
      '61c86013-74f2-4d30-916a-70b03a97ba14/bbac4190-0446-4db4-a084-cfdbc8102297/next-flow/e2dccfc5-700e-4df7-a4c0-f9fb3d611d03/',
  };

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

  function loadWorkflowReports() {
    useUiStore().setRequestPending('loadWorkflowReports');
    const res = await $api.workflows.readWorkflowReports(workflowId, labId);
    workflowReports.value = res.reports;
    workflowBasePath = res.basePath;
    useUiStore().setRequestComplete('loadWorkflowReports');
  }

  async function fetchS3Content() {
    useUiStore().setRequestPending('fetchS3Content');
    const res = await $api.s3.readS3Content(workflowBasePath);
    s3JsonData.value = res;
    useUiStore().setRequestComplete('fetchS3Content');
  }

  onBeforeMount(async () => {
    await loadWorkflowReports();
    await fetchS3Content();
  });
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
        <EGFileExplorerer :json-data="s3JsonData" :lab-id="labId" :workflow-base-path="workflowBasePath" />
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
