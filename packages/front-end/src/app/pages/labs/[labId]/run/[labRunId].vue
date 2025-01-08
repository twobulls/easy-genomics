<script setup lang="ts">
  import { LaboratoryRun } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-run';

  const $route = useRoute();
  const $router = useRouter();

  const labRunsStore = useLabRunsStore();
  const uiStore = useUiStore();

  const labId = $route.params.labId as string;
  const labRunId = $route.params.labRunId as string;

  const labRun = computed<LaboratoryRun | null>(() => labRunsStore.labRuns[labRunId] ?? null);

  const isLoading = computed<boolean>(() => uiStore.isRequestPending('loadLabRuns'));

  // permission check
  if (!useUserStore().canViewLab(labId)) {
    $router.push('/labs');
  }

  onBeforeMount(async () => {
    uiStore.setRequestPending('loadLabRuns');
    try {
      await labRunsStore.loadLabRunsForLab(labId);
    } finally {
      uiStore.setRequestComplete('loadLabRuns');
    }
  });
</script>

<template>
  <EGPageHeader
    :title="labRun?.Title || ''"
    :description="labRun?.WorkflowName || ''"
    :show-back="true"
    :back-action="() => $router.push(`/labs/${labId}?tab=Lab Runs`)"
    :is-loading="isLoading"
    :skeleton-config="{ titleLines: 2, descriptionLines: 1 }"
  />

  <div>{{ JSON.stringify(labRun) }}</div>
</template>
