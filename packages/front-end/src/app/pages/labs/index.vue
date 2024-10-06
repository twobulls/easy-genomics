<script setup lang="ts">
  import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
  import { ButtonVariantEnum } from '@FE/types/buttons';
  import { useToastStore, useUiStore } from '@FE/stores';
  import { DeletedResponse } from '@FE/types/api';
  import useLabsStore from '@FE/stores/labs';

  const { $api } = useNuxtApp();
  const router = useRouter();
  const hasNoData = ref(false);
  const labData = ref([] as Laboratory[]);

  const tableColumns = [
    {
      key: 'Name',
      label: 'Name',
      sortable: true,
      sort: useSort().stringSortCompare,
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

  function actionItems(lab: Laboratory) {
    const items: object[] = [
      [
        {
          label: 'View / Edit',
          click: () => viewLab(lab.LaboratoryId, lab.Name),
        },
      ],
    ];

    if (useUserStore().canDeleteLab(useUserStore().currentOrgId)) {
      items.push([
        {
          label: 'Remove',
          class: 'text-alert-danger-dark',
          click: () => deleteLab(lab.LaboratoryId, lab.Name),
        },
      ]);
    }

    return items;
  }

  // Dynamic delete lab dialog values
  const isOpen = ref(false);
  const primaryMessage = ref('');
  const selectedId = ref('');
  const displayName = ref('');

  function viewLab(labId: string, name: string) {
    useLabsStore().setLabId(labId);
    useLabsStore().setLabName(name);
    router.push({ path: `/labs/${labId}`, query: { name } });
  }

  function onRowClicked(row: any) {
    const { LaboratoryId: labId, Name: name } = row;
    useLabsStore().setLabId(labId);
    useLabsStore().setLabName(name);
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
      labData.value = (await $api.labs.list(useUserStore().currentOrgId)).sort((labA, labB) =>
        useSort().stringSortCompare(labA.Name, labB.Name),
      );

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

  const isOrgAdmin = computed<boolean>(() => useUserStore().canCreateLab(useUserStore().currentOrgId));
</script>

<template>
  <EGPageHeader title="Labs" :show-back="false">
    <EGButton
      v-if="isOrgAdmin"
      label="Create a new Lab"
      class="self-end"
      @click="() => $router.push({ path: `/labs/create` })"
    />
  </EGPageHeader>

  <EGEmptyDataCTA
    v-if="hasNoData"
    message="You don't have any Labs set up yet."
    :primary-button-action="isOrgAdmin ? () => $router.push({ path: `/labs/create` }) : null"
    :primary-button-label="isOrgAdmin ? 'Create a new Lab' : null"
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
