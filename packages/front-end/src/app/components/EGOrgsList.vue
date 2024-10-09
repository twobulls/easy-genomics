<script setup lang="ts">
  import { ButtonVariantEnum } from '@FE/types/buttons';
  import { Organization } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization';

  const props = withDefaults(
    defineProps<{
      admin: boolean;
    }>(),
    {
      admin: false,
    },
  );

  const { $api } = useNuxtApp();
  const $router = useRouter();

  const adminPrefix = computed<string>(() => (props.admin ? '/admin' : ''));

  onBeforeMount(loadOrgs);

  // table data stuff
  const isLoading = ref(false);
  const orgs = ref<Organization[]>([]);

  async function loadOrgs() {
    isLoading.value = true;
    try {
      orgs.value = (await $api.orgs.list())?.sort((orgA, orgB) => useSort().stringSortCompare(orgA.Name, orgB.Name));
    } catch (error) {
      console.error(error);
      useToastStore().error('Something went wrong while loading orgs');
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

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

  function actionItems(org: Organization): object[] {
    const items: object[] = [
      [
        {
          label: 'View / Edit',
          click: async () => viewOrg(org),
        },
      ],
    ];

    if (props.admin) {
      items.push([
        {
          label: 'Remove',
          class: 'text-alert-danger-dark',
          click: () => {
            orgToRemove.value = org;
            isRemoveOrgDialogOpen.value = true;
          },
        },
      ]);
    }

    return items;
  }

  function viewOrg(org: Organization) {
    $router.push({ path: adminPrefix.value + '/orgs/' + org.OrganizationId });
  }

  // delete org stuff
  const isRemoveOrgDialogOpen = ref<boolean>(false);
  const orgToRemove = ref<Organization | null>(null);

  const removeOrgModalMessage = computed<string>(() => {
    return `Are you sure you want to remove organization '${orgToRemove.value?.Name}'?`;
  });

  async function handleDeleteOrg() {
    // double check
    if (!props.admin) {
      return;
    }

    try {
      await $api.orgs.remove(orgToRemove.value?.OrganizationId!);
      useToastStore().success('Organization deleted');
    } catch (error) {
      console.error(error);
      useToastStore().error('Something went wrong while removing org');
      throw error;
    } finally {
      isLoading.value = false;
    }

    isRemoveOrgDialogOpen.value = false;

    await loadOrgs();
  }
</script>

<template>
  <EGPageHeader title="Organizations" :show-back="false">
    <EGButton v-if="admin" label="Create a new Organization" :to="adminPrefix + '/orgs/create'" />
  </EGPageHeader>

  <EGTable
    :row-click-action="viewOrg"
    :table-data="orgs"
    :columns="tableColumns"
    :is-loading="isLoading"
    :action-items="actionItems"
    :show-pagination="!isLoading"
  />

  <EGDialog
    actionLabel="Remove Organization"
    :actionVariant="ButtonVariantEnum.enum.destructive"
    cancelLabel="Cancel"
    :cancelVariant="ButtonVariantEnum.enum.secondary"
    @action-triggered="handleDeleteOrg"
    :primaryMessage="removeOrgModalMessage"
    v-model="isRemoveOrgDialogOpen"
  />
</template>
