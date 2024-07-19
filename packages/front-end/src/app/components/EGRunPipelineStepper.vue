<script setup lang="ts">
  import { usePipelineRunStore } from '~/stores';
  import EGRunPipelineFormRunDetails from './EGRunPipelineFormRunDetails.vue';

  const $route = useRoute();
  const router = useRouter();

  const labId = usePipelineRunStore().getLabId;
  const labName = usePipelineRunStore().getLabName;
  const pipelineId = usePipelineRunStore().getPipelineId;
  const pipelineName = usePipelineRunStore().getPipelineName;
  const pipelineDescription = usePipelineRunStore().getPipelineDescription;

  const items = [
    {
      disabled: false,
      key: 'details',
      label: 'Run Details',
    },
    {
      disabled: true,
      key: 'upload',
      label: 'Upload Data',
    },
    {
      disabled: true,
      key: 'parameters',
      label: 'Edit Parameters',
    },
    {
      disabled: true,
      key: 'review',
      label: 'Review Pipeline',
    },
  ];

  const selectedIndex = ref(0);

  function enableSelectedItem(index: number) {
    const selectedItem = items.find((_, i) => i === index);
    if (selectedItem && selectedItem.disabled) {
      selectedItem.disabled = false;
    }
  }

  const selected = computed({
    get() {
      const index = items.findIndex((item) => item.label === $route.query.tab);
      const clampedIndex = clampIndex(index);
      return clampedIndex;
    },
    set(index) {
      enableSelectedItem(index);
      setTabQueryParam(index);
      selectedIndex.value = index;
      console.log('SET selected:', index);
    },
  });

  function clampIndex(index: number) {
    return Math.min(items.length - 1, Math.max(0, index));
  }

  function nextTab() {
    const clampedIndex = clampIndex(selected.value + 1);
    console.log('nextTab; setting selected to:', clampedIndex);
    selected.value = clampedIndex;
  }

  function previousTab() {
    const clampedIndex = clampIndex(selected.value - 1);
    selected.value = clampedIndex;
  }

  function onChange(index: number) {
    const item = items[index];
    console.log(`UTabs called onChange; Item ${index} with label ${item.label} was clicked`);
    // selected.value = index;
  }

  // Update the URL query when the selected tab changes.
  // Adding/overwriting the tab query parameter with the selected tab label.
  // e.g. tab=Edit+Parameters
  // http://localhost:3000/labs/bbac4190-0446-4db4-a084-cfdbc8102297/run-pipeline?tab=Edit+Parameters
  function setTabQueryParam(index: number) {
    const clampedIndex = clampIndex(index);
    const item = items.find((_, i) => i === clampedIndex);
    if (item) {
      const query = { ...$route.query, tab: items[clampedIndex].label };
      router.replace({ query });
    } else {
      console.error(
        `Item not found for index: ${index}; clampedIndex: ${clampedIndex}; items.length: ${items.length}; items:`,
        items,
      );
    }
  }

  const EGStepperTabsStyles = {
    base: 'focus:outline-none',
    list: {
      base: 'rounded-none mb-4 mt-0',
      padding: 'p-0',
      height: 'h-14',
      marker: {
        wrapper: 'duration-200 ease-out focus:outline-none',
        base: 'absolute top-[0px] h-[2px]',
        background: 'bg-primary',
        shadow: 'shadow-none',
      },
      size: {
        sm: 'text-lg',
      },
      tab: {
        base: '!text-base w-auto inline-flex font-heading justify-start ui-focus-visible:outline-0 ui-focus-visible:ring-2 ui-focus-visible:ring-primary-500 ui-not-focus-visible:outline-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-75 duration-200 ease-out',
        active: 'text-primary h-14',
        inactive: 'text-heading',
        height: 'h-14',
        padding: 'p-0',
      },
    },
  };
</script>

<template>
  <UTabs v-model="selected" :items="items" :ui="EGStepperTabsStyles" @change="onChange">
    <template #default="{ item, index, selected }">
      <div class="relative flex items-center gap-2 truncate">
        <UIcon v-if="selectedIndex > index" name="i-heroicons-check-20-solid" class="h-4 w-4 flex-shrink-0" />
        <span>{{ item.label }}</span>
        <span v-if="selected" class="bg-primary-500 dark:bg-primary-400 absolute -right-4 h-2 w-2 rounded-full" />
      </div>
    </template>

    <template #item="{ item, index }">
      <!-- Debug logging -->
      <!-- <div class="mb-4 text-xs">
        <strong>item:</strong>
        {{ item }}
        <br />
        <strong>items[selectedIndex]:</strong>
        {{ items[selectedIndex] }}
        <br />
        <strong>index:</strong>
        {{ index }}
        <br />
        <strong>selected:</strong>
        {{ selected }}
        <br />
        <strong>selectedIndex:</strong>
        {{ selectedIndex }}
      </div> -->

      <EGCard>
        <!-- Header -->
        <div class="font-['Inter'] text-xs font-normal leading-none text-zinc-900">Item 0{{ selectedIndex + 1 }}</div>
        <div class="font-['Plus Jakarta Sans'] text-lg font-semibold leading-snug text-zinc-900">
          {{ items[selectedIndex].label }}
        </div>
        <UDivider class="py-4" />

        <!-- Run Details -->
        <template v-if="items[selectedIndex].key === 'details'">
          <EGShortCircuitRunPipelineForm
            :labId="labId"
            :labName="labName"
            :pipelineId="pipelineId"
            :pipelineName="pipelineName"
            :pipelineDescription="pipelineDescription"
            @next-tab="() => nextTab()"
          />
        </template>

        <!-- Upload Data -->
        <template v-if="items[selectedIndex].key === 'upload'">Upload Placeholder</template>

        <!-- Edit Parameters -->
        <template v-if="items[selectedIndex].key === 'parameters'">Edit Parameters Placeholder</template>

        <!-- Review Pipeline -->
        <template v-if="items[selectedIndex].key === 'review'">Review Pipeline Placeholder</template>
      </EGCard>
    </template>
  </UTabs>
</template>
