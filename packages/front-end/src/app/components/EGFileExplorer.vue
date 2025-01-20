<script setup lang="ts">
  import { useChangeCase } from '@vueuse/integrations/useChangeCase';
  import { useDebounceFn } from '@vueuse/core';
  import { format } from 'date-fns';
  import {
    S3Object,
    S3Response,
  } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/file/request-list-bucket-objects';

  interface FileTreeNode {
    type?: string;
    name?: string;
    size?: number;
    lastModified?: string;
    children?: MapType;
  }

  interface MapType {
    [key: string]: FileTreeNode;
  }

  const props = withDefaults(
    defineProps<{
      labId: string;
      s3Bucket: string;
      s3Prefix: string;
      s3Contents: S3Response | null;
      isLoading?: boolean;
    }>(),
    { isLoading: true },
  );

  const { handleS3Download, downloadFolder } = useFileDownload();
  const uiStore = useUiStore();

  const currentPath = ref([{ name: 'All Files', children: [] }]);
  const searchQuery = ref('');
  const s3Bucket = props.s3Bucket;
  const s3Prefix = props.s3Prefix;

  const updatedS3Contents = computed(() => {
    if (props.s3Contents) {
      const transformedData = transformS3Data(props.s3Contents, s3Prefix);
      if (!currentPath.value[0].children.length) {
        currentPath.value[0].children = transformedData as any;
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
    return currentItems.value.filter((item: MapType) => item?.name.toLowerCase().includes(query));
  });

  const tableColumns = [
    { key: 'name', label: 'Name', sortable: true, sort: useSort().stringSortCompare },
    { key: 'type', label: 'Type', sortable: true, sort: useSort().stringSortCompare },
    {
      key: 'lastModified',
      label: 'Date Modified',
      sortable: true,
      sort: useSort().dateSortCompare,
    },
    { key: 'size', label: 'Size', sortable: true, sort: useSort().numberSortCompare },
    { key: 'actions', label: 'Actions' },
  ];

  function transformS3Data(s3Contents: S3Response, s3Prefix: string) {
    const map: MapType = {};
    s3Contents?.Contents?.forEach((item: S3Object) => {
      if (item.Key.startsWith(s3Prefix)) {
        const parts = item.Key.slice(s3Prefix.length).split('/').filter(Boolean);
        parts.reduce((acc: MapType, part: string, index: number) => {
          if (!acc[part]) {
            acc[part] = {
              type: index === parts.length - 1 && item.Size > 0 ? 'file' : 'directory',
              name: part,
              size: item.Size,
              lastModified: item.LastModified,
              children: {} as MapType,
            };
          }
          return acc[part].children as MapType;
        }, map);
      }
    });
    return nestify(map);
  }

  function nestify(obj: MapType) {
    return Object.keys(obj)
      .map((key) => {
        const item = obj[key];
        if (Object.keys(item.children || {}).length > 0) {
          item.children = nestify(item.children as MapType);
        } else {
          delete item.children;
        }
        return item;
      })
      .filter((item) => item.type === 'file' || (item.children && Object.keys(item.children).length > 0));
  }

  function formatFileSize(value?: number): string {
    if (!value) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let unitIndex = 0;
    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }
    return `${value.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
  }

  const onRowClicked = useDebounceFn((item: MapType) => {
    if (item.type === 'directory' && item.children?.length) {
      openDirectory(item);
    }
  }, 300);

  const openDirectory = (dir: MapType) => {
    if (!currentPath.value.some((item) => item.name === dir.name)) {
      currentPath.value.push(dir);
    }
  };

  const navigateTo = (index: number) => {
    if (index >= 0 && index < currentPath.value.length) {
      currentPath.value = currentPath.value.slice(0, index + 1);
    }
  };

  const s3ObjectPath = computed(() => {
    if (breadcrumbs.value?.length <= 1) {
      return `s3://${s3Bucket}/${s3Prefix}`;
    }

    const pathSegments = breadcrumbs.value.map((crumb) => crumb.name).filter((name) => name !== 'All Files');
    return `s3://${s3Bucket}/${s3Prefix}/${pathSegments.join('/')}`;
  });

  function nodeUniqueString(node: FileTreeNode): string {
    // this isn't an ideal unique string but it's pretty unlikely to match any other files so it's probably good enough
    return node.name!;
    return `${node.type}${node.name}${node.size}${node.lastModified}${node.children?.length}`;
  }

  async function downloadFileTreeNode(node: FileTreeNode): Promise<void> {
    uiStore.setRequestPending(`downloadFileButton-${nodeUniqueString(node)}`);

    try {
      if (node.type === 'file') {
        await handleS3Download(
          props.labId,
          node.name!, // Filename
          s3ObjectPath.value, // s3://{S3 Bucket}/{S3 Prefix} Path
        );
      } else {
        await downloadFolder();
      }
    } finally {
      uiStore.setRequestComplete(`downloadFileButton-${nodeUniqueString(node)}`);
    }
  }

  // Watchers to ensure data reactivity
  watch(currentPath, () => {});
  watch(updatedS3Contents, () => {});
</script>

<template>
  <div>
    <!-- Search input -->
    <EGSearchInput
      @input-event="(event) => (searchQuery = event)"
      placeholder="Search files/folders"
      class="mb-6 w-[408px]"
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
      <template #lastModified-data="{ row }">
        {{ format(row.lastModified, 'MM/dd/yyyy') }}
      </template>
      <template #size-data="{ row }">
        {{ formatFileSize(row.size) }}
      </template>
      <template #actions-data="{ row }">
        <div class="flex justify-end">
          <EGButton
            variant="secondary"
            :label="row?.type === 'file' ? 'Download' : 'Download as zip'"
            :loading="uiStore.isRequestPending(`downloadFileButton-${nodeUniqueString(row)}`)"
            @click.stop="async () => await downloadFileTreeNode(row)"
          />
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
