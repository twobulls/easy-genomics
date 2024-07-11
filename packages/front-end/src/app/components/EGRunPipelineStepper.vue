<script setup lang="ts">
  const $route = useRoute();
  const router = useRouter();

  // http://localhost:3000/labs/bbac4190-0446-4db4-a084-cfdbc8102297/run-pipeline?labName=Test+Laboratory

  const labId = $route.params.id;
  const labName = $route.query.labName;

  const items = [
    {
      key: 'details',
      label: 'Run Details',
    },
    {
      key: 'upload',
      label: 'Upload Data',
      //   disabled: true,
    },
    {
      key: 'parameters',
      label: 'Edit Parameters',
      //   disabled: true,
    },
    {
      key: 'review',
      label: 'Review Pipeline',
      //   disabled: true,
    },
  ];

  const selectedIndex = ref(0);

  const selected = computed({
    get() {
      const index = items.findIndex((item) => item.label === $route.query.tab);
      if (index === -1) {
        return 0;
      }

      return index;
    },
    set(value) {
      // Update the URL query when the selected tab changes.
      // Adding/overwriting the tab query parameter with the selected tab label.
      // e.g. tab=Edit+Parameters
      // http://localhost:3000/labs/bbac4190-0446-4db4-a084-cfdbc8102297/run-pipeline?labName=Test+Laboratory&tab=Edit+Parameters
      const query = { ...$route.query, tab: items[value].label };
      router.replace({ query });
    },
  });

  function onChange(index: number) {
    const item = items[index];

    console.log(`Item ${index} with label ${item.label} was clicked!`);
  }

  // Use watchEffect to update selectedIndex when $route.query.tab changes
  watchEffect(() => {
    selectedIndex.value = selected.value;
  });

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

    <template #item="{ item, index, selected }">
      <EGCard>
        <div class="grid gap-4">
          <div>
            <div>labName: {{ labName }}</div>
            <div>labId: {{ labId }}</div>
          </div>
          <div>
            <div>Item:</div>
            <pre>{{ item }}</pre>
          </div>
          <div>
            <div>Index:</div>
            <pre>{{ index }}</pre>
          </div>
          <div>
            <div>Selected:</div>
            <pre>{{ selected }}</pre>
          </div>
        </div>
      </EGCard>
    </template>
  </UTabs>
</template>
