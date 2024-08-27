<script setup lang="ts">
  import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
  import { ButtonVariantEnum } from '@FE/types/buttons';
  import { useToastStore, useUiStore } from '@FE/stores';
  import { DeletedResponse } from '@FE/types/api';

  const { $api } = useNuxtApp();
  const router = useRouter();
  const hasNoData = ref(false);
  const labData = ref([] as Laboratory[]);

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

  const actionItems = (lab: Laboratory) => [
    [
      {
        label: 'View / Edit',
        click: () => viewLab(lab.LaboratoryId, lab.Name),
      },
    ],
    [
      {
        label: 'Remove',
        class: 'text-alert-danger-dark',
        click: () => deleteLab(lab.LaboratoryId, lab.Name),
      },
    ],
  ];

  // Dynamic delete lab dialog values
  const isOpen = ref(false);
  const primaryMessage = ref('');
  const selectedId = ref('');
  const displayName = ref('');

  function viewLab(labId: string, name: string) {
    router.push({ path: `/labs/${labId}`, query: { name } });
  }

  function onRowClicked(row: any) {
    const { LaboratoryId: labId, Name: name } = row;
    router.push({ path: `/labs/${labId}`, query: { name } });
  }

  function resetSelectedLabValues() {
    selectedId.value = '';
    displayName.value = '';
    primaryMessage.value = '';
  }

  async function deleteLab(labId: string, labName: string) {
    selectedId.value = labId;
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

      const res: DeletedResponse = await $api.labs.delete(selectedId.value);

      if (res?.Status !== 'Success') {
        throw new Error('Lab not removed');
      }

      useToastStore().success(`Lab '${displayName.value}' has been removed`);
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
      labData.value = await $api.labs.list(useUserStore().currentOrgId);

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
  });
</script>

<template>
  <EGPageHeader title="Labs" :show-back="false" :back-action="() => $router.push('/')">
    <EGButton label="Create a new Lab" class="self-end" @click="() => $router.push({ path: `/labs/create` })" />
  </EGPageHeader>

  <EGEmptyDataCTA
    v-if="hasNoData"
    message="You don't have any Labs set up yet."
    :primary-button-action="() => $router.push({ path: `/labs/create` })"
    primary-button-label="Create a new Lab"
  />

  <EGTable
    :row-click-action="onRowClicked"
    v-else
    :table-data="labData"
    :columns="tableColumns"
    :is-loading="useUiStore().isRequestPending"
    :action-items="actionItems"
    :show-pagination="!useUiStore().isRequestPending && !hasNoData"
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
