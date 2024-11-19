<template>
  <div class="file-explorer">
    <div class="breadcrumbs">
      <span v-for="(crumb, index) in breadcrumbs" :key="index" @click="navigateTo(index)">
        {{ crumb.name }}
        <span v-if="index < breadcrumbs.length - 1">/</span>
      </span>
    </div>
    <EGTable
      :row-click-action="onRowClicked"
      :table-data="currentItems"
      :columns="tableColumns"
      :action-items="actionItems"
      :can-select="canSelectRow"
    />
  </div>
</template>

<script setup lang="ts">
  import { parseISO, format, compareAsc } from 'date-fns';
  import { Laboratory } from '@/packages/shared-lib/src/app/types/easy-genomics/laboratory';

  // Define the props for the component
  const props = defineProps<{
    jsonData: Array<{ type: string; name: string; dateModified?: string; size?: number; children?: any[] }>;
  }>();

  // Initialize the current path with the root directory
  const currentPath = ref([{ name: 'root', children: props.jsonData }]);

  // Generate the breadcrumb trail
  const breadcrumbs = computed(() => {
    return currentPath.value.map((dir, index) => ({
      name: dir.name,
      path: currentPath.value.slice(0, index + 1),
    }));
  });

  // Compute the items in the current directory
  const currentItems = computed(() => {
    if (currentPath.value.length > 0) {
      const currentDir = currentPath.value[currentPath.value.length - 1];
      console.log('Current Directory Items:', currentDir.children); // Debug: Log current directory items
      return currentDir.children || [];
    }
    return [];
  });

  // Define the table columns
  const tableColumns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
    },
    {
      key: 'dateModified',
      label: 'Date Modified',
      sortable: true,
      sort: (rowA, rowB) => compareAsc(parseISO(rowA.dateModified), parseISO(rowB.dateModified)),
      formatter: (value) => (value ? format(parseISO(value), 'yyyy-MM-dd') : ''),
    },
    {
      key: 'size',
      label: 'Size',
      sortable: true,
      sort: (rowA, rowB) => rowA.size - rowB.size,
      formatter: (value) => formatSize(value),
    },
    {
      key: 'actions',
      label: 'Actions',
    },
  ];

  // Format the file size into a human-readable format
  function formatSize(value) {
    if (!value) return '';
    if (value < 1024) return `${value} B`;
    if (value < 1024 * 1024) return `${(value / 1024).toFixed(2)} KB`;
    return `${(value / (1024 * 1024)).toFixed(2)} MB`;
  }

  // Filter rows to only allow selecting files, not directories
  const canSelectRow = (row) => {
    return row.type !== 'directory';
  };

  // Handle row click action
  const onRowClicked = (item) => {
    console.log('Row clicked:', item); // Debug: Log the clicked row
    if (item.type === 'directory') {
      openDirectory(item);
      resetSelection();
    }
  };

  // Action items (if any, this can be expanded as needed)
  function actionItems(lab: Laboratory) {
    const items: object[] = [
      [
        {
          label: 'Download',
          click: () => onRowClicked(lab),
        },
      ],
    ];

    return items;
  }

  // Open a directory and update the current path
  const openDirectory = (dir) => {
    currentPath.value.push(dir);
  };

  // Navigate to a specific breadcrumb
  const navigateTo = (index) => {
    currentPath.value = currentPath.value.slice(0, index + 1);
    resetSelection();
  };

  // Reset selection when navigating or opening directories
  const resetSelection = () => {
    // Implement your reset selection logic here (e.g., clear selected items)
  };
</script>

<style scoped>
  .file-explorer {
    font-family: Arial, sans-serif;
  }

  .breadcrumbs {
    margin-bottom: 10px;
  }

  .breadcrumbs span {
    cursor: pointer;
    color: blue;
  }

  .breadcrumbs span:hover {
    text-decoration: underline;
  }
</style>
