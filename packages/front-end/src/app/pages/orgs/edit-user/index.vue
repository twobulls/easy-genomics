<script setup lang="ts">
  import { useOrgsStore, useToastStore } from '~/stores/stores';
  import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
  import { LaboratoryUserDetails } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-user-details';
  import { LabAccessRolesEnum } from '~/types/labAccessRoles';
  import { OrganizationUserDetails } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization-user-details';
  import useUser from '~/composables/useUser';

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

  onMounted(async () => {
    await updateSelectedUser();
    await fetchOrgLabs();
    await fetchLabsUserData();
  });

  function updateSearchOutput(newVal: string) {
    searchOutput.value = newVal;
  }

  async function updateSelectedUser() {
    try {
      const user = await $api.orgs.usersDetailsByUserId($route.query.userId);
      if (user.length) {
        useOrgsStore().setSelectedUser(user[0]);
        isLoading.value = false;
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchOrgLabs() {
    try {
      orgLabsData.value = await $api.labs.list(useOrgsStore().selectedUser?.OrganizationId);

      if (!orgLabsData.value.length) {
        hasNoData.value = true;
      }
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetch the user's details for each lab
   */
  async function fetchLabsUserData() {
    try {
      selectedUserLabsData.value = await $api.labs.listLabUsersByUserId(useOrgsStore().selectedUser?.UserId);

      if (!orgLabsData.value.length) {
        hasNoData.value = true;
      }
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      isLoading.value = false;
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
        const userLab = selectedUserLabsData.value.find((userLab) => userLab.LaboratoryId === lab.LaboratoryId);

        return {
          labAccessOptionsEnabled: hasAccess,
          labAccess: !hasAccess,
          labManager: userLab?.LabManager || false,
          labTechnician: userLab?.LabTechnician || false,
          Name: lab.Name,
          LaboratoryId: lab.LaboratoryId,
          labRole: {
            role: userLab?.LabManager ? LabAccessRolesEnum.enum.LabManager : LabAccessRolesEnum.enum.LabTechnician,
            label: userLab?.LabManager ? 'Lab Manager' : 'Lab Technician',
          },
        };
      });
  });

  async function handleAddUser(lab: { labId: string; name: string }) {
    try {
      const res = await $api.labs.addLabUser(lab.labId, useOrgsStore().selectedUser?.UserId);

      if (res?.Status === 'Success') {
        await updateSelectedUser();
        useToastStore().success(`${lab.name} has been successfully updated for ${useOrgsStore().getUserDisplayName}`);
      } else {
        throw new Error('Failed to update lab access');
      }
    } catch (error) {
      useToastStore().error(
        "Oops, we couldn't update the lab access. Please check your connection and try again later"
      );
      throw error;
    }
  }

  async function handleLabAccess(labRole: { labId: string; role: string; labName: string }) {
    const isLabManager = labRole.role === 'LabManager';

    try {
      const res = await $api.labs.editUserLabAccess(labRole.labId, useOrgsStore().selectedUser?.UserId, isLabManager);

      if (res?.Status === 'Success') {
        useToastStore().success(
          `${labRole.labName} has been successfully updated for ${useOrgsStore().getUserDisplayName}`
        );
      } else {
        throw new Error('Failed to update user role');
      }
    } catch (error) {
      useToastStore().error(`Failed to update ${useOrgsStore().getUserDisplayName}`);
      throw error;
    } finally {
      // update UI with latest data
      await fetchLabsUserData();
    }
  }
</script>

<template>
  <EGPageHeader title="Edit User Access" />

  <USkeleton class="flex h-[82px] flex-col rounded bg-gray-200 p-6 max-md:px-5" v-if="isLoading" />

  <EGUserOrgAdminToggle
    v-if="!isLoading"
    :user="useOrgsStore().selectedUser"
    :display-name="useOrgsStore().getUserDisplayName"
    @update-user="updateSelectedUser($event)"
  />

  <EGSearchInput @input-event="updateSearchOutput" placeholder="Search all Labs" class="my-6 w-[408px]" />

  <EGTable
    :table-data="filteredTableData"
    :columns="tableColumns"
    :isLoading="isLoading"
    :show-pagination="!isLoading && !hasNoData"
    @grant-access-clicked="handleAddUser($event)"
    @lab-access-selected="handleLabAccess($event)"
  />
</template>

<style scoped></style>
