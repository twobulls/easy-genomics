<script setup lang="ts">
  import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
  import { ButtonVariantEnum } from '~/types/buttons';
  import { useToastStore, useUiStore } from '~/stores/stores';

  // Use UI composable to determine if the UI is loading
  import useUI from '~/composables/useUI';
  const isMounted = ref(false);
  const isLoading = computed(() => useUI().isUILoading(isMounted.value));

  const { $api } = useNuxtApp();
  const router = useRouter();
  const hasNoData = ref(false);
  const labData = ref([] as Laboratory[]);
  const { MOCK_ORG_ID } = useRuntimeConfig().public;

  const tableColumns = [
    {
      key: 'Name',
      label: 'Name',
      sortable: true,
    },
    {
      key: 'Description',
      label: 'Description',
    },
    {
      key: 'actions',
      label: '',
    },
  ];

  const actionItems = (row: Laboratory) => [
    [
      {
        label: 'Summary',
        click: () => {},
      },
    ],
    [
      {
        label: 'View / Edit',
        click: () => router.push({ path: `/labs/view/${row.LaboratoryId}`, query: { name: row.Name } }),
      },
    ],
    [
      {
        label: 'Remove',
        class: 'text-alert-danger-dark',
        click: () => deleteLab(row.LaboratoryId, row.Name),
      },
    ],
  ];

  // Dynamic delete lab dialog values
  const isOpen = ref(false);
  const primaryMessage = ref('');
  const selectedId = ref('');
  const displayName = ref('');

  function resetSelectedLabValues() {
    selectedId.value = '';
    displayName.value = '';
    primaryMessage.value = '';
  }

  async function deleteLab(LabId: string, labName: string) {
    selectedId.value = LabId;
    displayName.value = labName;
    primaryMessage.value = `Are you sure you want to remove lab '${labName}'?`;
    isOpen.value = true;
  }

  async function handleDeleteLab() {
    try {
      useUiStore().setRequestPending(true);
      isOpen.value = false;

      if (!selectedId.value) {
        throw new Error('No selectedId');
      }

      const res = await $api.labs.delete(selectedId.value);

      if (res?.deleted) {
        useToastStore().success(`Lab '${displayName.value}' has been removed`);
        await getLabs();
      } else {
        throw new Error('Lab not removed');
      }

      await getLabs();
    } catch (error) {
      useUiStore().setRequestPending(false);
      useToastStore().error(`Failed to remove lab '${displayName.value}'`);
      throw error;
    } finally {
      resetSelectedLabValues();
    }
  }

  async function getLabs() {
    try {
      useUiStore().setRequestPending(true);
      labData.value = await $api.labs.list(MOCK_ORG_ID);

      if (!labData.value.length) {
        hasNoData.value = true;
      }
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      useUiStore().setRequestPending(false);
    }
  }

  onMounted(async () => {
    await getLabs();
    isMounted.value = true;
  });
</script>

<template>
  <div class="mb-11 flex items-center justify-between">
    <EGText tag="h1" v-if="labData">Labs</EGText>
    <EGButton label="Create a new Lab" class="self-end" @click="() => $router.push({ path: `/labs/new` })" />
  </div>

  <EGEmptyDataCTA
    v-if="!isLoading && hasNoData"
    message="You don't have any Labs set up yet."
    :button-action="() => $router.push({ path: `/labs/new` })"
    button-label="Create a new Lab"
  />

  <EGTable
    v-if="!hasNoData"
    :table-data="labData"
    :columns="tableColumns"
    :isLoading="isLoading"
    :action-items="actionItems"
    :show-pagination="!isLoading"
  />

  <EGDialog
    actionLabel="Remove Lab"
    :actionVariant="ButtonVariantEnum.enum.destructive"
    cancelLabel="Cancel"
    :cancelVariant="ButtonVariantEnum.enum.secondary"
    @action-triggered="handleDeleteLab"
    :primaryMessage="primaryMessage"
    v-model="isOpen"
  />
</template>
