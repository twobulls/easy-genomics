<script setup lang="ts">
  import { useOrgsStore, useToastStore, useUiStore } from '~/stores';
  import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
  import { LaboratoryUserDetails } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-user-details';

  const { $api } = useNuxtApp();
  const $route = useRoute();
  const orgLabsData = ref([] as Laboratory[]);
  const selectedUserLabsData = ref([] as LaboratoryUserDetails[]);
  const isLoading = ref(true);
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

  onBeforeMount(async () => {
    await fetchOrgLabs(); // wait for lab data to load
    await Promise.all([updateSelectedUser(), fetchUserLabs()]);
    isLoading.value = false;
  });

  function updateSearchOutput(newVal: string) {
    searchOutput.value = newVal;
  }

  async function updateSelectedUser() {
    try {
      useUiStore().setRequestPending(true);
      const user = await $api.orgs.usersDetailsByUserId($route.query.userId);
      if (user.length) {
        useOrgsStore().setSelectedUser(user[0]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      useUiStore().setRequestPending(false);
    }
  }

  async function fetchOrgLabs() {
    try {
      useUiStore().setRequestPending(true);
      orgLabsData.value = await $api.labs.list($route.query.orgId);

      if (!orgLabsData.value.length) {
        hasNoData.value = true;
      }
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      useUiStore().setRequestPending(false);
    }
  }

  /**
   * Fetch the user's details for each lab
   */
  async function fetchUserLabs() {
    try {
      useUiStore().setRequestPending(true);
      selectedUserLabsData.value = await $api.labs.listLabUsersByUserId(useOrgsStore().selectedUser?.UserId);
      if (!orgLabsData.value.length) {
        hasNoData.value = true;
      }
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      useUiStore().setRequestPending(false);
    }
  }

  /**
   * Filter rows based on search input for laboratory name
   */
  const filteredTableData = computed(() => {
    return orgLabsData.value
      .filter((lab) => {
        const labName = String(lab.Name).toLowerCase();
        return labName.includes(searchOutput.value.toLowerCase());
      })
      .map((lab) => {
        const hasAccess =
          useOrgsStore().selectedUser?.OrganizationAccess?.[lab.OrganizationId]?.LaboratoryAccess?.[lab.LaboratoryId]
            ?.Status === 'Active';
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
      });
  });

  async function handleAddUser(lab: { labId: string; name: string }) {
    try {
      useUiStore().setRequestPending(true);
      const res = await $api.labs.addLabUser(lab.labId, useOrgsStore().selectedUser?.UserId);

      if (res?.Status === 'Success') {
        await updateSelectedUser();
        useToastStore().success(
          `${lab.name} has been successfully updated for ${useOrgsStore().getSelectedUserDisplayName}`,
        );
      } else {
        throw new Error('Failed to update lab access');
      }
    } catch (error) {
      useToastStore().error(
        "Oops, we couldn't update the lab access. Please check your connection and try again later",
      );
      throw error;
    } finally {
      useUiStore().setRequestPending(false);
    }
  }

  async function handleAssignRole(user: LaboratoryUserDetails) {
    try {
      useUiStore().setRequestPending(true);
      const res = await $api.labs.editUserLabAccess(
        user.LaboratoryId,
        useOrgsStore().selectedUser?.UserId,
        user.LabManager,
      );
      if (res?.Status === 'Success') {
        await fetchUserLabs();
        let maybeLabName = 'Lab';
        const lab = orgLabsData.value.find((lab) => lab.LaboratoryId === user.LaboratoryId);
        if (lab) {
          maybeLabName = lab.Name;
        }
        useToastStore().success(
          `${maybeLabName} has been successfully updated for ${useOrgsStore().getSelectedUserDisplayName}`,
        );
      } else {
        throw new Error('Failed to update user role');
      }
    } catch (error) {
      useToastStore().error(`Failed to update ${useOrgsStore().getSelectedUserDisplayName}`);
      throw error;
    } finally {
      // update UI with latest data
      useUiStore().setRequestPending(false);
    }
  }
</script>

<template>
  <EGPageHeader title="Edit User Access" />

  <div class="mb-4">
    <EGUserOrgAdminToggle
      v-if="useOrgsStore().selectedUser"
      :is-loading="isLoading"
      :key="useOrgsStore().selectedUser?.UserId"
      :user="useOrgsStore().selectedUser"
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
    :primary-button-action="() => $router.push({ path: '/labs/create' })"
    primary-button-label="Create a Lab"
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
          :disabled="useUiStore().isRequestPending"
          :user="row"
          @assign-role="handleAssignRole($event.labUser)"
        />
      </div>
      <EGButton
        :loading="useUiStore().isRequestPending"
        v-else-if="row.access"
        @click="
          handleAddUser({
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
</template>

<style scoped></style>
