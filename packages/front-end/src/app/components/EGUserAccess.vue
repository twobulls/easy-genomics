<script setup lang="ts">
  import { useToastStore, useUiStore } from '@FE/stores';
  import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
  import { LaboratoryUserDetails } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-user-details';
  import { ButtonVariantEnum } from '@FE/types/buttons';
  import { DeletedResponse } from '@FE/types/api';
  import { OrganizationUserDetails } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization-user-details';

  const props = defineProps<{
    superuser: boolean;
    orgAdmin: boolean;
  }>();

  const { $api } = useNuxtApp();
  const $router = useRouter();
  const $route = useRoute();

  const selectedUser = ref<OrganizationUserDetails | null>(null);
  const getSelectedUserDisplayName = computed<string>(() =>
    String(
      useUser().displayName({
        preferredName: selectedUser.value?.PreferredName || '',
        firstName: selectedUser.value?.FirstName || '',
        lastName: selectedUser.value?.LastName || '',
        email: selectedUser.value?.UserEmail || '',
      }),
    ),
  );

  const orgLabsData = ref([] as Laboratory[]);
  const selectedUserLabsData = ref<LaboratoryUserDetails[] | null>(null);
  const isLoading = computed<boolean>(() =>
    useUiStore().anyRequestPending(['updateUser', 'fetchOrgLabs', 'fetchUserLabs']),
  );
  const hasNoData = ref(false);
  const searchOutput = ref('');
  const tableColumns = [
    {
      key: 'Name',
      label: 'Name',
    },
    {
      key: 'actions',
      label: 'Lab Access',
    },
  ];

  type LabIdents = { id: string; name: string };
  const labToRemoveFrom = ref<LabIdents | null>(null);
  const isRemoveUserDialogOpen = ref<boolean>(false);

  onBeforeMount(async () => {
    await Promise.all([fetchOrgLabs(), updateSelectedUser()]);
    // fetchUserLabs has to wait until updateSelectedUser has run
    await fetchUserLabs();
  });

  function updateSearchOutput(newVal: string) {
    searchOutput.value = newVal;
  }

  async function updateSelectedUser() {
    try {
      useUiStore().setRequestPending('updateUser');
      const user = await $api.orgs.usersDetailsByUserId($route.query.userId);
      if (user.length) {
        selectedUser.value = user[0];
      }
    } catch (error) {
      console.error(error);
    } finally {
      useUiStore().setRequestComplete('updateUser');
    }
  }

  async function fetchOrgLabs() {
    try {
      useUiStore().setRequestPending('fetchOrgLabs');
      orgLabsData.value = await $api.labs.list($route.query.orgId);

      if (!orgLabsData.value.length) {
        hasNoData.value = true;
      }
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      useUiStore().setRequestComplete('fetchOrgLabs');
    }
  }

  /**
   * Fetch the user's details for each lab
   */
  async function fetchUserLabs() {
    // note: this needs to run after selectedUser has been set so the UserId is available
    try {
      useUiStore().setRequestPending('fetchUserLabs');
      selectedUserLabsData.value = await $api.labs.listLabUsersByUserId(selectedUser.value?.UserId);
      if (!orgLabsData.value.length) {
        hasNoData.value = true;
      }
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      useUiStore().setRequestComplete('fetchUserLabs');
    }
  }

  /**
   * Filter rows based on search input for laboratory name
   */
  const filteredTableData = computed(() => {
    if (selectedUserLabsData.value === null) {
      // wait till selectedUserLabsData is available to prevent jank as the table reorders the rows in front of the user
      return [];
    }

    return orgLabsData.value
      .filter((lab) => {
        const labName = String(lab.Name).toLowerCase();
        return labName.includes(searchOutput.value.toLowerCase());
      })
      .map((lab) => {
        const hasAccess =
          selectedUser.value?.OrganizationAccess?.[lab.OrganizationId]?.LaboratoryAccess?.[lab.LaboratoryId]?.Status ===
          'Active';
        const labUser = selectedUserLabsData.value.find((user) => user.LaboratoryId === lab.LaboratoryId);

        return {
          labAccessOptionsEnabled: hasAccess,
          access: !hasAccess,
          assignedRole: labUser?.LabManager ? 'Lab Manager' : labUser?.LabTechnician ? 'Lab Technician' : 'Unknown',
          LabManager: labUser?.LabManager || false,
          LabTechnician: labUser?.LabTechnician || false,
          Name: lab.Name,
          LaboratoryId: lab.LaboratoryId,
        };
      })
      .sort((labA, labB) => {
        // Lab Manager labs first
        if (labA.LabManager && !labB.LabManager) return -1;
        if (!labA.LabManager && labB.LabManager) return 1;
        // then Lab Technician
        if (labA.LabTechnician && !labB.LabTechnician) return -1;
        if (!labA.LabTechnician && labB.LabTechnician) return 1;
        // then sort by name
        return useSort().stringSortCompare(labA.Name, labB.Name);
      });
  });

  async function handleAddUser(lab: { orgId: string; labId: string; name: string }) {
    const userId = selectedUser.value!.UserId;
    try {
      useUiStore().setRequestPending('addUserToLab');
      useUiStore().setRequestPending(`addUserToLabButton-${userId}-${lab.labId}`);

      const res = await $api.labs.addLabUser(lab.orgId, lab.labId, userId);

      if (res?.Status === 'Success') {
        await updateSelectedUser();
        await fetchUserLabs();
        useToastStore().success(`${lab.name} has been successfully updated for ${getSelectedUserDisplayName.value}`);
      } else {
        throw new Error('Failed to update lab access');
      }
    } catch (error) {
      useToastStore().error(
        "Oops, we couldn't update the lab access. Please check your connection and try again later",
      );
      throw error;
    } finally {
      useUiStore().setRequestComplete('addUserToLab');
      useUiStore().setRequestComplete(`addUserToLabButton-${userId}-${lab.labId}`);
    }
  }

  async function handleAssignRole(user: LaboratoryUserDetails) {
    const userId = selectedUser.value!.UserId;
    try {
      useUiStore().setRequestPending('assignLabRole');
      const res = await $api.labs.editUserLabAccess(user.LaboratoryId, userId, user.LabManager);
      if (res?.Status === 'Success') {
        await fetchUserLabs();
        let maybeLabName = 'Lab';
        const lab = orgLabsData.value.find((lab) => lab.LaboratoryId === user.LaboratoryId);
        if (lab) {
          maybeLabName = lab.Name;
        }
        useToastStore().success(
          `${maybeLabName} has been successfully updated for ${getSelectedUserDisplayName.value}`,
        );
      } else {
        throw new Error('Failed to update user role');
      }
    } catch (error) {
      useToastStore().error(`Failed to update ${getSelectedUserDisplayName.value}`);
      throw error;
    } finally {
      // update UI with latest data
      useUiStore().setRequestComplete('assignLabRole');
    }
  }

  function showRemoveUserDialog(lab: LabIdents) {
    labToRemoveFrom.value = lab;
    isRemoveUserDialogOpen.value = true;
  }

  async function handleRemoveUserFromLab() {
    const labName = labToRemoveFrom.value?.name;
    const labId = labToRemoveFrom.value?.id;
    isRemoveUserDialogOpen.value = false;

    const { UserId } = selectedUser.value;
    const displayName = getSelectedUserDisplayName.value;

    try {
      useUiStore().setRequestPending('removeUserFromLab');

      const res: DeletedResponse = await $api.labs.removeUser(labId, UserId);

      if (res?.Status !== 'Success') {
        throw new Error(`Failed to remove ${displayName} from ${labName}`);
      }

      useToastStore().success(`Successfully removed ${displayName} from ${labName}`);
    } catch (error) {
      useToastStore().error(`Failed to remove ${displayName} from ${labName}`);
    } finally {
      await Promise.all([updateSelectedUser(), fetchUserLabs()]);
      useUiStore().setRequestComplete('removeUserFromLab');
    }
  }
</script>

<template>
  <EGPageHeader
    title="Edit User Access"
    :show-back="true"
    :back-action="() => $router.push(`/orgs/${$route.query.orgId}`)"
  />

  <div class="mb-4">
    <EGUserOrgAdminToggle
      v-if="selectedUser"
      :is-loading="isLoading"
      :key="selectedUser?.UserId"
      :user="selectedUser"
      @update-user="updateSelectedUser($event)"
    />
  </div>

  <EGSearchInput
    v-if="hasNoData"
    @input-event="updateSearchOutput"
    placeholder="Search All Labs"
    class="my-6 w-[408px]"
  />

  <EGEmptyDataCTA
    v-if="hasNoData"
    message="There are no labs in your Organization"
    :primary-button-action="useUserStore().canCreateLab ? () => $router.push({ path: '/labs/create' }) : null"
    :primary-button-label="useUserStore().canCreateLab ? 'Create a Lab' : null"
  />

  <EGTable
    v-if="!hasNoData"
    :table-data="filteredTableData"
    :columns="tableColumns"
    :show-pagination="!isLoading"
    :is-loading="isLoading"
  >
    <template #actions-data="{ row }">
      <div class="flex items-center" v-if="row.labAccessOptionsEnabled">
        <EGUserRoleDropdown
          :key="row"
          :disabled="
            useUiStore().anyRequestPending([
              'updateUser',
              'fetchOrgLabs',
              'fetchUserLabs',
              'addUserToLab',
              'assignLabRole',
              'removeUserFromLab',
            ])
          "
          :user="row"
          @assign-role="handleAssignRole($event.labUser)"
          :show-remove-from-lab="true"
          @remove-user-from-lab="() => showRemoveUserDialog({ id: row.LaboratoryId, name: row.Name })"
        />
      </div>
      <EGButton
        :loading="useUiStore().isRequestPending(`addUserToLabButton-${selectedUser?.UserId}-${row.LaboratoryId}`)"
        v-else-if="row.access"
        @click="
          handleAddUser({
            orgId: $route.query.orgId,
            labId: row.LaboratoryId,
            name: row.Name,
          })
        "
        label="Grant access"
        variant="secondary"
        size="sm"
      />
      <EGActionButton v-else-if="actionItems" :items="actionItems(row)" />
    </template>
  </EGTable>

  <EGDialog
    actionLabel="Remove User"
    :actionVariant="ButtonVariantEnum.enum.destructive"
    cancelLabel="Cancel"
    :cancelVariant="ButtonVariantEnum.enum.secondary"
    @action-triggered="handleRemoveUserFromLab"
    :primaryMessage="`Are you sure you want to remove ${getSelectedUserDisplayName} from ${labToRemoveFrom?.name}?`"
    v-model="isRemoveUserDialogOpen"
  />
</template>
