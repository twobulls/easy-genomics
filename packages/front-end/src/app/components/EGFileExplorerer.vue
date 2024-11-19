<template>
  <div class="breadcrumbs">
    <span
      v-for="(crumb, index) in breadcrumbs"
      :key="index"
      icon="i-heroicons-arrow-down-tray"
      @click="navigateTo(index)"
      class="breadcrumb-item text-muted text-sm"
    >
      {{ crumb.name }}
      <UIcon v-if="index < breadcrumbs.length - 1" size="large" name="i-heroicons-chevron-right" />
    </span>
  </div>
  <EGTable
    :row-click-action="onRowClicked"
    :table-data="currentItems"
    :columns="tableColumns"
    :action-items="actionItems"
  >
    <template #type-data="{ row, index }">
      {{ useChangeCase(row.type, 'sentenceCase') }}
    </template>
    <template #size-data="{ row, index }">
      {{ formatSize(row.size) }}
    </template>
  </EGTable>
</template>

<script setup lang="ts">
  import { parseISO, format } from 'date-fns';
  import { useChangeCase } from '@vueuse/integrations/useChangeCase';

  const { downloadReport } = useFileDownload();

  // Define the props for the component
  const props = defineProps<{
    labId: string;
    jsonData: Array<{ type: string; name: string; dateModified?: string; size?: number; children?: any[] }>;
  }>();

  const updatedJsonData = computed(() => {
    return props.jsonData.map((item) => ({
      ...item,
      type: item.type === 'directory' ? 'Folder' : item.type === 'file' ? 'File' : item.type,
    }));
  });

  const currentPath = ref([{ name: 'All Files', children: updatedJsonData.value }]);

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
      sort: useSort().stringSortCompare,
      rowClass: (row) => (row.type === 'Folder' ? 'underline-folder' : ''),
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
      sort: useSort().dateSortCompare,
      class: (value) => (value ? format(parseISO(value), 'dd/MM/yyyy') : ''),
    },
    {
      key: 'size',
      label: 'Size',
      sortable: true,
      sort: useSort().numberSortCompare,
      //
      // sort: (rowA, rowB) => {
      //   if (rowA === undefined) return 1; // Move undefined values to the end
      //   if (rowB === undefined) return -1; // Move undefined values to the end
      //   const sizeA = typeof rowA === 'number' ? rowA : 0;
      //   const sizeB = typeof rowB === 'number' ? rowB : 0;
      //   return sizeA - sizeB;
      // },
      class: (value) => formatSize(value),
    },
    {
      key: 'actions',
      label: 'Actions',
    },
  ];

  // Format the file size into a human-readable format
  function formatSize(value: number) {
    if (!value) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let unitIndex = 0;
    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }
    return unitIndex === 0 ? `${value.toFixed(0)} ${units[unitIndex]}` : `${value.toFixed(2)} ${units[unitIndex]}`;
    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }
    return `${value.toFixed(2)} ${units[unitIndex]}`;
  }

  // Handle row click action
  const onRowClicked = (item) => {
    if (item.type === 'Folder' || item.type === 'directory') {
      console.log('Opening directory:', item.name); // Debug log
      openDirectory(item);
      resetSelection();
    }
  };

  // Open a directory and update the current path
  const openDirectory = (dir) => {
    console.log('Navigating to directory:', dir.name); // Debug log
    currentPath.value.push({ name: dir.name, children: dir.children });
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

  // Define action items for each row
  const actionItems = (row) => {
    return [
      {
        label: 'Download',
        icon: 'download', // Assuming you have a way to render this icon
        action: () => downloadReport(labId, row.fileName, `${workflowBasePath}${row.path}`, row.size),
      },
      // Add more actions if needed
    ];
  };
</script>

<style scoped>
  .breadcrumb-item {
    cursor: pointer;
    margin-right: 5px;

    > &:last-child {
      color: #000;
    }
  }

  .breadcrumbs {
    margin-bottom: 10px;
  }

  .breadcrumb-item:hover {
    text-decoration: underline;
  }

  .underline-folder {
    text-decoration: underline;
  }
</style>
