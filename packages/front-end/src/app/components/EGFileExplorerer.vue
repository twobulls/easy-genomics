<script setup lang="ts">
  import { useChangeCase } from '@vueuse/integrations/useChangeCase';
  import { useWorkflowStore } from '@FE/stores';
  import { format } from 'date-fns';
  import { S3Response } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/file/request-list-bucket-objects';

  type MapType = {
    [key: string]: {
      type: string;
      name: string;
      size: number;
      lastModified: string;
      children: MapType;
    };
  };

  const props = withDefaults(
    defineProps<{
      labId: string;
      workflowId: string;
      s3Contents: S3Response | null;
      isLoading?: boolean;
    }>(),
    { isLoading: false },
  );

  const { handleS3Download, downloadFolder } = useFileDownload();

  const initialPath = computed(() => {
    if (props.s3Contents && props.s3Contents.Contents.length > 0) {
      const firstKey = props.s3Contents.Contents[0].Key;
      return firstKey.split('/').slice(0, 3).join('/') + '/';
    }
    return '';
  });

  const currentPath = ref([{ name: 'All Files', children: [] }]);
  const searchQuery = ref('');
  const s3Prefix = computed(() => initialPath.value);

  const updatedJsonData = computed(() => {
    if (props.s3Contents) {
      const transformedData = transformS3Data(props.s3Contents, s3Prefix.value);
      if (!currentPath.value[0].children.length) {
        currentPath.value[0].children = transformedData;
      }
      return transformedData;
    }
    return [];
  });

  const breadcrumbs = computed(() => {
    return currentPath.value.map((dir, index) => ({
      name: dir.name,
      path: currentPath.value.slice(0, index + 1),
    }));
  });

  const currentItems = computed(() => {
    const currentDir = currentPath.value[currentPath.value.length - 1];
    return currentDir.children || [];
  });

  const filteredItems = computed(() => {
    const query = searchQuery.value.toLowerCase();
    return currentItems.value.filter((item) => item.name.toLowerCase().includes(query));
  });

  const tableColumns = [
    { key: 'name', label: 'Name', sortable: true, sort: useSort().stringSortCompare },
    { key: 'type', label: 'Type', sortable: true, sort: useSort().stringSortCompare },
    { key: 'dateModified', label: 'Date Modified', sortable: true, sort: useSort().dateSortCompare },
    { key: 'size', label: 'Size', sortable: true, sort: useSort().numberSortCompare },
    { key: 'actions', label: 'Actions' },
  ];

  function transformS3Data(s3Contents, s3prefix) {
    const map: MapType = {};
    s3Contents.Contents.forEach((item) => {
      if (item.Key.startsWith(s3prefix)) {
        const parts = item.Key.slice(s3prefix.length).split('/').filter(Boolean);
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
      }
    });

    function nestify(obj: MapType) {
      return Object.keys(obj)
        .map((key) => {
          const item = obj[key];
          if (Object.keys(item.children).length > 0) {
            item.children = nestify(item.children);
          } else {
            delete item.children;
          }
          return item;
        })
        .filter((item) => item.type === 'file' || item.children?.length > 0);
    }

    return nestify(map);
  }

  function formatFileSize(value: number) {
    if (!value) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let unitIndex = 0;
    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }
    return `${value.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
  }

  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  const onRowClicked = debounce((item) => {
    if (item.type === 'directory' && item.children?.length) {
      openDirectory(item);
    }
  }, 300);

  const openDirectory = (dir) => {
    if (!currentPath.value.some((item) => item.name === dir.name)) {
      currentPath.value.push({ name: dir.name, children: dir.children });
    }
  };

  const navigateTo = (index: number) => {
    if (index >= 0 && index < currentPath.value.length) {
      currentPath.value = currentPath.value.slice(0, index + 1);
    }
  };

  const actionItems = (row: string) => {
    const items: object[] = [
      [
        {
          label: row.type === 'file' ? 'Download' : 'Download as zip',
          click: () =>
            row.type === 'file'
              ? handleS3Download(
                  props.labId,
                  row.name,
                  useWorkflowStore()
                    .workflowById(props.labId, props.workflowId)
                    .workDir.replace(/\/work$/, ''),
                  row.size,
                )
              : downloadFolder(),
        },
      ],
    ];

    return items;
  };

  // Watchers to ensure data reactivity
  watch(currentPath, () => {});
  watch(updatedJsonData, () => {});
</script>

<template>
  <div>
    <!-- Search input -->
    <EGSearchInput
      @input-event="(event) => (searchQuery = event)"
      placeholder="Search files/folders"
      class="my-6 w-[408px]"
      :disabled="isLoading"
    />

    <!-- Breadcrumbs -->
    <div class="mb-6 flex min-h-[24px] flex-wrap">
      <template v-if="!isLoading">
        <span
          v-for="(crumb, index) in breadcrumbs"
          :key="index"
          @click="navigateTo(index)"
          class="breadcrumb-item text-sm"
          :class="{ 'text-black': index === breadcrumbs.length - 1, 'text-gray-500': index !== breadcrumbs.length - 1 }"
        >
          {{ crumb.name }}
          <UIcon
            v-if="index < breadcrumbs.length - 1"
            size="large"
            name="i-heroicons-chevron-right"
            class="separator"
          />
        </span>
      </template>
    </div>

    <EGTable
      :row-click-action="onRowClicked"
      :table-data="filteredItems"
      :columns="tableColumns"
      no-results-msg="No files or folders found"
      :is-loading="isLoading"
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
      <template #dateModified-data="{ row }">
        {{ format(row.lastModified, 'MM/dd/yyyy') }}
      </template>
      <template #size-data="{ row }">
        {{ formatFileSize(row.size) }}
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
    align-items: center;

    &:last-child {
      cursor: default;
    }

    .separator {
      margin: 0 2px 0 3px;
    }
  }
</style>
