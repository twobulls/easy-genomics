<script setup lang="ts">
  import { S3Response } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/file/request-list-bucket-objects';
  import { LaboratoryRun } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-run';

  const $route = useRoute();
  const $router = useRouter();
  const { $api } = useNuxtApp();

  const labRunsStore = useLabRunsStore();
  const uiStore = useUiStore();
  const userStore = useUserStore();

  const labId = $route.params.labId as string;
  const labRunId = $route.params.labRunId as string;

  const labRun = computed<LaboratoryRun | null>(() => labRunsStore.labRuns[labRunId] ?? null);
  // The LaboratoryRun's InputS3Url is the authoritative reference to obtain S3Bucket & S3Prefix for the File Manager
  const inputS3Url: string = labRun.value?.InputS3Url;
  const s3Bucket: string | null = inputS3Url
    .match(/(?<=^s3:\/\/)([a-z0-9][a-z0-9-]{1,61}[a-z0-9])(?=\/*)/g)
    ?.toString();
  const s3Prefix: string | null = inputS3Url.match(/(?<=^s3:\/\/[a-z0-9][a-z0-9-]{1,61}[a-z0-9]\/)(.*)/g)?.toString();
  const s3Contents = ref<S3Response | null>(null);

  const isLoading = computed<boolean>(() => uiStore.isRequestPending('loadLabRuns'));

  // permission check
  if (!useUserStore().canViewLab(labId)) {
    $router.push('/labs');
  }

  onBeforeMount(async () => {
    await Promise.all([
      fetchLabRuns(), // this is in case the runs haven't been loaded by the lab page already
      fetchS3Content(),
    ]);
  });

  async function fetchLabRuns() {
    uiStore.setRequestPending('loadLabRuns');
    try {
      await labRunsStore.loadLabRunsForLab(labId);
    } finally {
      uiStore.setRequestComplete('loadLabRuns');
    }
  }

  async function fetchS3Content() {
    useUiStore().setRequestPending('fetchS3Content');
    if (s3Bucket && s3Prefix) {
      try {
        const res = await $api.file.requestListBucketObjects({
          LaboratoryId: labId,
          S3Bucket: `${s3Bucket}`,
          S3Prefix: `${s3Prefix}`,
        });
        s3Contents.value = res || null;
      } catch (error) {
        console.error('Error fetching S3 content:', error);
      } finally {
        useUiStore().setRequestComplete('fetchS3Content');
      }
    } else {
      s3Contents.value = null;
    }
  }

  const tabItems = computed(() => [
    { key: 'runDetails', label: 'Run Details' },
    { key: 'fileManager', label: 'File Manager' },
  ]);
  const tabIndex = ref(0);

  function setTabIndexFromQuery() {
    const queryTabMatchIndex = tabItems.value.findIndex((tab) => tab.label === $route.query.tab);
    tabIndex.value = queryTabMatchIndex !== -1 ? queryTabMatchIndex : 0;
  }

  onMounted(setTabIndexFromQuery);

  const updateQueryParams = useDebounceFn((params: Record<string, string | undefined>) => {
    $router.replace({ path: $route.path, query: { ...$route.query, ...params } });
  }, 300);

  function handleTabChange(newIndex: number) {
    tabIndex.value = newIndex;
    updateQueryParams({ tab: tabItems.value[newIndex]?.label });
  }

  const pipelineOrWorkflow = computed<string | null>(() => {
    switch (labRun.value?.Platform) {
      case 'Seqera Cloud':
        return 'Pipeline';
      case 'AWS HealthOmics':
        return 'Workflow';
      default:
        return null;
    }
  });

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
</script>

<template>
  <EGPageHeader
    :title="labRun?.RunName || ''"
    :description="labRun?.WorkflowName || ''"
    :show-back="true"
    :back-action="() => $router.push(`/labs/${labId}?tab=Lab Runs`)"
    :is-loading="isLoading"
    :skeleton-config="{ titleLines: 2, descriptionLines: 1 }"
  />

  <UTabs :ui="EGTabsStyles" v-model="tabIndex" :items="tabItems" @update:model-value="handleTabChange">
    <template #item="{ item }">
      <!-- Run Details -->
      <div v-if="item.key === 'runDetails'" class="space-y-3">
        <section
          class="stroke-light flex flex-col rounded-none rounded-b-2xl border border-solid bg-white p-6 pt-0 max-md:px-5"
        >
          <dl class="mt-4 space-y-4">
            <div class="flex border-b p-4 text-sm">
              <dt class="w-[200px] font-medium text-black">Run Name</dt>
              <dd class="text-muted text-left">{{ labRun.RunName }}</dd>
            </div>

            <div class="flex border-b p-4 text-sm">
              <dt class="w-[200px] font-medium text-black">{{ pipelineOrWorkflow }}</dt>
              <dd class="text-muted text-left">{{ labRun.WorkflowName }}</dd>
            </div>

            <div class="flex border-b p-4 text-sm">
              <dt class="w-[200px] font-medium text-black">{{ pipelineOrWorkflow }} Run Status</dt>
              <dd class="text-muted text-left">
                <EGStatusChip :status="labRun?.Status" />
              </dd>
            </div>

            <div class="flex border-b p-4 text-sm">
              <dt class="w-[200px] font-medium text-black">Platform</dt>
              <dd class="text-muted text-left">{{ labRun.Platform }}</dd>
            </div>

            <div class="flex border-b p-4 text-sm">
              <dt class="w-[200px] font-medium text-black">Owner</dt>
              <dd class="text-muted text-left">{{ labRun.Owner }}</dd>
            </div>

            <div class="flex border-b p-4 text-sm">
              <dt class="w-[200px] font-medium text-black">Internal Run Id</dt>
              <dd class="text-muted text-left">{{ labRun.RunId }}</dd>
            </div>

            <div class="flex border-b p-4 text-sm">
              <dt class="w-[200px] font-medium text-black">External Run Id</dt>
              <dd class="text-muted text-left">{{ labRun.ExternalRunId }}</dd>
            </div>

            <div class="flex border-b p-4 text-sm">
              <dt class="w-[200px] font-medium text-black">Created</dt>
              <dd class="text-muted text-left">{{ `${getTime(labRun.CreatedAt)} ⋅ ${getDate(labRun.CreatedAt)}` }}</dd>
            </div>

            <div class="flex border-b p-4 text-sm" v-if="labRun.ModifiedAt">
              <dt class="w-[200px] font-medium text-black">Last Modified</dt>
              <dd class="text-muted text-left">
                {{ `${getTime(labRun.ModifiedAt)} ⋅ ${getDate(labRun.ModifiedAt)}` }}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <!-- File Manager -->
      <div v-if="item.key === 'fileManager'" class="space-y-3">
        <EGFileExplorer
          :lab-id="labId"
          :s3-bucket="s3Bucket"
          :s3-prefix="s3Prefix"
          :s3-contents="s3Contents"
          :is-loading="useUiStore().isRequestPending('fetchS3Content')"
        />
      </div>
    </template>
  </UTabs>
</template>
