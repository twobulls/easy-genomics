<template>
  <div>
    <input type="text" v-model="searchQuery" placeholder="Search files..." />
    <div class="breadcrumbs">
      <span
        v-for="(crumb, index) in breadcrumbs"
        :key="index"
        @click="navigateTo(index)"
        class="breadcrumb-item text-muted text-sm"
      >
        {{ crumb.name }}
        <UIcon v-if="index < breadcrumbs.length - 1" size="large" name="i-heroicons-chevron-right" class="separator" />
      </span>
    </div>
    <EGTable :row-click-action="onRowClicked" :table-data="filteredItems" :columns="tableColumns">
      <template #name-data="{ row }">
        <span v-if="row.type === 'directory'" class="underline hover:no-underline" @click="onRowClicked(row)">
          {{ `${row.name}/` }}
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

<script setup lang="ts">
  import { useChangeCase } from '@vueuse/integrations/useChangeCase';

  const props = defineProps<{
    workflowBasePath: string;
    labId: string;
    jsonData: typeof s3JsonData;
  }>();

  const { downloadReport } = useFileDownload();
  const startPathPrefix =
    '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/';

  const currentPath = ref([{ name: 'All Files', children: [] }]);
  const searchQuery = ref('');

  const updatedJsonData = computed(() => {
    const transformedData = transformS3Data(props.jsonData, startPathPrefix);
    if (currentPath.value[0].children.length === 0) {
      currentPath.value[0].children = transformedData;
    }
    return transformedData;
  });

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

  const filteredItems = computed(() => {
    const query = searchQuery.value.toLowerCase();
    return currentItems.value.filter((item) => item.name.toLowerCase().includes(query));
  });

  const tableColumns = [
    { key: 'name', label: 'Name', sortable: true, sort: (a, b) => a.name.localeCompare(b.name) },
    { key: 'type', label: 'Type', sortable: true, sort: (a, b) => a.type.localeCompare(b.type) },
    {
      key: 'dateModified',
      label: 'Date Modified',
      sortable: true,
      sort: (a, b) => new Date(a.dateModified) - new Date(b.dateModified),
    },
    { key: 'size', label: 'Size', sortable: true, sort: (a, b) => a.size - b.size },
    { key: 'actions', label: 'Actions' },
  ];

  function transformS3Data(s3Data, prefix) {
    const map = {};

    s3Data.Contents.filter((item) => item.Key.startsWith(prefix)).forEach((item) => {
      const parts = item.Key.slice(prefix.length).split('/');
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
          item.children = nestify(item.children);
          return item;
        } else {
          delete item.children;
          return item;
        }
      });
    }

    return nestify(map);
  }

  function formatSize(value) {
    if (!value) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let unitIndex = 0;
    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }
    return unitIndex === 0 ? `${value.toFixed(0)} ${units[unitIndex]}` : `${value.toFixed(2)} ${units[unitIndex]}`;
  }

  const onRowClicked = (item) => {
    if (item.type === 'directory') {
      openDirectory(item);
    }
  };

  const openDirectory = (dir) => {
    // Ensure correct initialization and logging
    console.log('Opening directory:', dir);
    if (!dir.children || dir.children.length === 0) {
      console.error('Directory has no children:', dir); // Log error
      return;
    }
    if (currentPath.value.length === 0 || currentPath.value[currentPath.value.length - 1].name !== dir.name) {
      currentPath.value.push({ name: dir.name, children: dir.children });
    }
  };

  const navigateTo = (index) => {
    if (index >= 0 && index < currentPath.value.length) {
      currentPath.value = currentPath.value.slice(0, index + 1);
    }
  };

  const actionItems = (row) => [
    {
      label: 'Download',
      click: () => downloadReport(props.labId, row.name, props.workflowBasePath + row.name, row.size),
    },
  ];

  watch(currentPath, (newPath, oldPath) => {
    console.log('Current Path Updated:', JSON.stringify(newPath, null, 2));
  });

  watch(updatedJsonData, (newData) => {
    console.log('Updated JSON Data:', JSON.stringify(newData, null, 2));
  });
</script>

<style scoped>
  .breadcrumb-item {
    cursor: pointer;
    margin-right: 5px;
  }

  .breadcrumbs {
    display: flex;
    margin-bottom: 10px;
  }

  .separator {
    margin: 0 2px 0 3px;
  }
</style>
