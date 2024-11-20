<script setup lang="ts">
  import { useChangeCase } from '@vueuse/integrations/useChangeCase';
  import {
    S3Object,
    S3Response,
  } from '@/packages/shared-lib/src/app/types/easy-genomics/file/request-list-bucket-objects';

  type MapType = {
    [key: string]: {
      type: string;
      name: string;
      size: number;
      lastModified: string;
      children: MapType;
    };
  };

  const props = defineProps<{
    workflowBasePath: string;
    labId: string;
    jsonData: typeof s3JsonData;
  }>();

  const { downloadReport, downloadFolder } = useFileDownload();

  // TODO: mock path prefix - this should be fetched from the backend
  const s3Prefix =
    '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/';
  const currentPath = ref([{ name: 'All Files', children: [] }]);
  const searchQuery = ref('');

  // Compute updated JSON data and initialize current path children
  const updatedJsonData = computed(() => {
    const transformedData = transformS3Data(props.jsonData, s3Prefix);
    if (currentPath.value[0].children.length === 0) {
      currentPath.value[0].children = transformedData;
    }
    return transformedData;
  });

  // Generate breadcrumbs based on current path
  const breadcrumbs = computed(() => {
    return currentPath.value.map((dir, index) => ({
      name: dir.name,
      path: currentPath.value.slice(0, index + 1),
    }));
  });

  // Get items in the current directory
  const currentItems = computed(() => {
    if (currentPath.value.length > 0) {
      const currentDir = currentPath.value[currentPath.value.length - 1];
      return currentDir.children || [];
    }
    return [];
  });

  // Filter items based on search query
  const filteredItems = computed(() => {
    const query = searchQuery.value.toLowerCase();
    return currentItems.value.filter((item: { name: string }) => item.name.toLowerCase().includes(query));
  });

  const tableColumns = [
    { key: 'name', label: 'Name', sortable: true, sort: useSort().stringSortCompare },
    { key: 'type', label: 'Type', sortable: true, sort: useSort().stringSortCompare },
    { key: 'dateModified', label: 'Date Modified', sortable: true, sort: useSort().dateSortCompare },
    { key: 'size', label: 'Size', sortable: true, sort: useSort().numberSortCompare },
    { key: 'actions', label: 'Actions' },
  ];

  /**
   * Transform S3 object data into a nested structure
   * @param s3Data
   * @param s3prefix
   */
  function transformS3Data(s3Data: S3Response, s3prefix: string) {
    const map = {};

    s3Data.Contents.filter((item: S3Object) => item.Key.startsWith(s3prefix)).forEach((item: S3Object) => {
      const parts = item.Key.slice(s3prefix.length).split('/');

      parts.reduce((acc: MapType, part: string, index: number) => {
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

    /**
     *
     * @param obj
     */
    function nestify(obj) {
      return Object.keys(obj)
        .map((key) => {
          const item = obj[key];
          if (Object.keys(item.children).length > 0) {
            item.children = nestify(item.children);
            return item;
          } else {
            delete item.children;
            return item;
          }
        })
        .filter((item) => item.type === 'file' || (item.children && item.children.length > 0));
    }

    return nestify(map);
  }

  // Utility to format file sizes
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

  const onRowClicked = (item: MapType) => {
    debugger;
    if (item.type === 'directory' && item.children && item.children.length > 0) {
      openDirectory(item);
    }
  };

  const openDirectory = (dir: MapType) => {
    currentPath.value.push({ name: dir.name, children: dir.children });
  };

  // Navigate to a directory based on breadcrumbs
  const navigateTo = (index: number) => {
    if (index >= 0 && index < currentPath.value.length) {
      currentPath.value = currentPath.value.slice(0, index + 1);
    }
  };

  // Define action items for each row
  const actionItems = (row: string) => {
    const items: object[] = [
      [
        {
          label: row.type === 'file' ? 'Download' : 'Download as zip',
          click: () =>
            row.type === 'file'
              ? downloadReport(props.labId, row.name, props.workflowBasePath + row.name, row.size)
              : downloadFolder(),
        },
      ],
    ];

    return items;
  };

  // Watch for changes and log updates
  watch(currentPath, (newPath) => {
    console.log('Current Path Updated:', JSON.stringify(newPath, null, 2));
  });

  watch(updatedJsonData, (newData) => {
    console.log('Updated JSON Data:', JSON.stringify(newData, null, 2));
  });
</script>

<template>
  <div>
    <!-- Search input -->
    <EGSearchInput
      @input-event="(event) => (searchQuery = event)"
      placeholder="Search files/folders"
      class="my-6 w-[408px]"
    />

    <!-- Breadcrumbs -->
    <div class="breadcrumbs mb-6">
      <span
        v-for="(crumb, index) in breadcrumbs"
        :key="index"
        @click="navigateTo(index)"
        class="breadcrumb-item text-sm"
        :class="{ 'text-black': index === breadcrumbs.length - 1, 'text-gray-500': index !== breadcrumbs.length - 1 }"
      >
        {{ crumb.name }}
        <UIcon v-if="index < breadcrumbs.length - 1" size="large" name="i-heroicons-chevron-right" class="separator" />
      </span>
    </div>

    <EGTable
      :row-click-action="onRowClicked"
      :table-data="filteredItems"
      :columns="tableColumns"
      no-results-msg="No files or folders found"
    >
      <template #name-data="{ row }">
        <span v-if="row.type === 'directory'" class="underline hover:no-underline" @click="onRowClicked(row)">
          {{ row.name }}/
        </span>
        <span v-else>
          {{ row.name }}
        </span>
      </template>
      <template #type-data="{ row }">
        {{ useChangeCase(row.type === 'directory' ? 'Folder' : row.type, 'sentenceCase') }}
      </template>
      <template #size-data="{ row }">
        {{ formatSize(row.size) }}
      </template>
      <template #actions-data="{ row }">
        <div class="flex justify-end">
          <EGActionButton :items="actionItems(row)" class="ml-2" @click="$event.stopPropagation()" />
        </div>
      </template>
    </EGTable>
  </div>
</template>

<style scoped>
  .breadcrumb-item {
    cursor: pointer;
    margin-right: 5px;
    display: flex;

    &:last-child {
      cursor: default;
    }
  }

  .breadcrumbs {
    display: flex;
  }

  .separator {
    margin: 0 2px 0 3px;
  }
</style>
