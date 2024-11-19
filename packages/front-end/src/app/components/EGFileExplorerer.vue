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
  <EGTable :row-click-action="onRowClicked" :table-data="currentItems" :columns="tableColumns">
    <template #name-data="{ row, index }">
      <span v-if="row.type === 'directory'" class="underline hover:no-underline">
        {{ `${row.name}/` }}
      </span>
      <span v-else>
        {{ row.name }}
      </span>
    </template>
    <template #type-data="{ row, index }">
      {{ useChangeCase(row.type === 'directory' ? 'Folder' : row.type, 'sentenceCase') }}
    </template>
    <!--    <template #dateModified-data="{ row, index }">{{ format(parseISO(row.dateModified), 'dd/MM/yyyy') }}</template>-->
    <template #size-data="{ row, index }">
      {{ formatSize(row.size) }}
    </template>
    <template #actions-data="{ row }">
      <div class="flex justify-end">
        <EGActionButton :items="actionItems(row)" class="ml-2" @click="$event.stopPropagation()" />
      </div>
    </template>
  </EGTable>
</template>

<script setup lang="ts">
  import { useChangeCase } from '@vueuse/integrations/useChangeCase';

  const props = defineProps<{
    workflowBasePath: string;
    labId: string;
    jsonData: typeof s3JsonData;
  }>();

  const { downloadReport } = useFileDownload();

  const updatedJsonData = computed(() => transformS3Data(props.jsonData));
  const s3Prefix = computed(() => props.jsonData.Prefix);

  const currentPath = ref([{ name: 'All Files', children: updatedJsonData.value }]);

  const breadcrumbs = computed(() => {
    return currentPath.value.map((dir, index) => ({
      name: dir.name,
      path: currentPath.value.slice(0, index + 1),
    }));
  });

  const currentItems = computed(() => {
    if (currentPath.value.length > 0) {
      const currentDir = currentPath.value[currentPath.value.length - 1];
      return currentDir.children || [];
    }
    return [];
  });

  const tableColumns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      sort: useSort().stringSortCompare,
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
    },
    {
      key: 'size',
      label: 'Size',
      sortable: true,
      sort: useSort().numberSortCompare,
    },
    {
      key: 'actions',
      label: 'Actions',
    },
  ];

  function transformS3Data(s3Data) {
    const map = {};

    s3Data.Contents.forEach((item) => {
      const parts = item.Key.split('/');
      parts.reduce((acc, part, index) => {
        if (!acc[part]) {
          acc[part] = {
            type: index === parts.length - 1 && item.Size > 0 ? 'file' : 'directory',
            name: part,
            size: item.Size,
            lastModified: item.LastModified,
            children: {},
          };
        }
        return acc[part].children;
      }, map);
    });

    function nestify(obj) {
      return Object.keys(obj).map((key) => {
        const item = obj[key];
        if (Object.keys(item.children).length > 0) {
          return {
            ...item,
            children: nestify(item.children),
          };
        } else {
          delete item.children;
          return item;
        }
      });
    }

    return nestify(map);
  }

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
  }

  // Handle row click action
  const onRowClicked = (item) => {
    if (item.type === 'Folder' || item.type === 'directory') {
      console.log('Opening directory:', item.name); // Debug log
      openDirectory(item);
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
  };

  // Define action items for each row
  const actionItems = (row) => {
    const items: object[] = [
      [
        {
          label: 'Download',
          click: () => downloadReport(props.labId, row.name, props.workflowBasePath + row.name, row.size),
        },
      ],
    ];

    return items;
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
  }
</style>
