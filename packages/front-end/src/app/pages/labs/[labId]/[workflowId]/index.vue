<script setup lang="ts">
  import { useLabsStore, useOrgsStore } from '~/stores';
  import { EGTabsStyles } from '~/styles/nuxtui/UTabs';
  import { getDate, getTime } from '~/utils/date-time';

  const { $api } = useNuxtApp();
  const orgId = useOrgsStore().selectedOrg?.OrganizationId;
  const workflow = useLabsStore().workflow;
  const router = useRouter();

  const tabItems = [
    {
      key: 'runResults',
      label: 'Run Results',
    },
    {
      key: 'runDetails',
      label: 'Run Details',
    },
    {
      key: 'workflowParams',
      label: 'Workflow Parameters',
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

  onBeforeMount(() => {
    let paramTab = router.currentRoute.value.query?.tab;
    if (!paramTab) paramTab = 'Run Results'; // fallback for no query param to default to first tab
    tabIndex = paramTab ? tabItems.findIndex((tab) => tab.label === paramTab) : 0;
  });

  // watch route change to correspondingly change selected tab
  watch(
    () => router.currentRoute.value.query.tab,
    (newVal) => {
      tabIndex = newVal ? tabItems.findIndex((tab) => tab.label === newVal) : 0;
    },
  );
</script>

<template>
  <EGPageHeader :title="workflow.runName" description="View your Lab users, details and pipelines">
    <EGButton
      icon="i-heroicons-arrow-down-tray"
      :icon-right="false"
      label="Download Run Results"
      @click="() => window.alert('TODO')"
    />
  </EGPageHeader>

  <UTabs
    :ui="EGTabsStyles"
    :model-value="tabIndex"
    :items="tabItems"
    @update:model-value="
      (newIndex) => {
        router.push({ query: { ...router.currentRoute.query, tab: tabItems[newIndex].label } });
        tabIndex = newIndex;
      }
    "
  >
    <template #item="{ item }">
      <div v-if="item.key === 'runResults'" class="space-y-3">TBD</div>
      <div v-if="item.key === 'runDetails'" class="space-y-3">
        <section
          class="stroke-light flex flex-col rounded-none rounded-b-2xl border border-solid bg-white p-6 max-md:px-5"
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
      <div v-if="item.key === 'workflowParams'" class="space-y-3">TBD</div>
    </template>
  </UTabs>
</template>
