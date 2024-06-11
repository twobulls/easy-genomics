<script setup lang="ts">
import { LabUserSchema, LabUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/lab-user';
import { LaboratoryRolesEnumSchema, LaboratoryRolesEnum } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/roles';
import { ButtonVariantEnum } from '~/types/buttons';
import { DeletedResponse, EditUserResponse } from '~/types/api';
import { useOrgsStore, useToastStore, useUiStore } from '~/stores/stores';
import useUser from '~/composables/useUser';
import { z } from 'zod';

const { $api } = useNuxtApp();
const $route = useRoute();
const labName = $route.query.name;
const hasNoData = ref(false);
const labUsers = ref<LabUser[]>([]);
const searchOutput = ref('');
const laboratoryId = $route.params.id;
const $emit = defineEmits(['remove-user-from-lab', 'assign-role']);

// Dynamic remove user dialog values
const isOpen = ref(false);
const primaryMessage = ref('');
const selectedUserId = ref('');

async function removeUserFromLab(UserId, displayName) {
  selectedUserId.value = UserId;
  primaryMessage.value = `Are you sure you want to remove ${displayName} from ${labName}?`;
  isOpen.value = true;
}

async function handleRemoveLabUser() {
  isOpen.value = false;

  const userToRemove = labUsers.value.find((user) => user.UserId === selectedUserId.value);
  const displayName = userToRemove?.displayName

  try {
    if (!selectedUserId.value) {
      throw new Error('No selectedUserId');
    }

    useUiStore().setRequestPending(true);

    const res: DeletedResponse = await $api.labs.removeUser(laboratoryId, selectedUserId.value);

    if (res?.Status === 'Success') {
      useToastStore().success(`${displayName} has been removed from ${labName}`);
      await getLabUsers();
    } else {
      throw new Error('User not removed from Lab');
    }
  } catch (error) {
    await getLabUsers();
    useToastStore().error(`Failed to remove ${displayName} from ${labName}`);
    throw error;
  } finally {
    await getLabUsers();
    selectedUserId.value = '';
    useUiStore().setRequestPending(false);
  }
}

async function handleAssignRole({
  labUser,
  displayName,
}: {
  labUser: { LaboratoryId: string; UserId: string; LabManager: boolean };
  displayName: string;
}) {
  const { LaboratoryId, UserId, LabManager } = labUser;
  try {
    useUiStore().setRequestPending(true);
    const res: EditUserResponse = await $api.labs.editUserLabAccess(LaboratoryId, UserId, LabManager);
    if (res) {
      useToastStore().success(`${labName} access has been successfully updated for ${displayName}`);
    } else {
      throw new Error('Failed to assign new role');
    }
  } catch (error) {
    useToastStore().error(`Failed to update ${useOrgsStore().getSelectedUserDisplayName}`);
    throw error;
  } finally {
    // update UI with latest data
    await getLabUsers();
    useUiStore().setRequestPending(false);
  }
}

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

function getAssignedLabRole(labUserDetails: LaboratoryUserDetails): LaboratoryRolesEnum {
  if (labUserDetails.LabManager) {
    return LaboratoryRolesEnumSchema.enum.LabManager
  }
  return LaboratoryRolesEnumSchema.enum.LabTechnician;
}

function getLabUser(labUserDetails: LaboratoryUserDetails, labUsers: LaboratoryUser[]): LabUser {
  const labUser = labUsers.find((labUser) => labUser.UserId === labUserDetails.UserId);
  if (!labUser) {
    throw new Error(`Lab user not found for user ${user.UserId}`)
  }
  const assignedRole = getAssignedLabRole(labUserDetails);

  const displayName = useUser().displayName({
    preferredName: labUserDetails.PreferredName,
    firstName: labUserDetails.FirstName,
    lastName: labUserDetails.LastName,
    email: labUserDetails.UserEmail,
  });

  return {
    ...labUserDetails,
    Status: labUser.Status,
    assignedRole,
    displayName,
  };
}

async function getLabUsers() {
  try {
    useUiStore().setRequestPending(true);
    const _labUserDetails: LaboratoryUserDetails = await $api.labs.usersDetails($route.params.id);
    const _labUsers: LaboratoryUser[] = await $api.labs.listLabUsersByLabId($route.params.id);
    labUsers.value = _labUserDetails.map((user) => getLabUser(user, _labUsers));

    if (labUsers.value.length === 0) {
      hasNoData.value = true;
    }
  } catch (error) {
    console.error('Error retrieving lab users', error);
    useToastStore().error('Failed to retrieve lab users');
  } finally {
    useUiStore().setRequestPending(false);
  }
}

function updateSearchOutput(newVal: any) {
  searchOutput.value = newVal;
}

const filteredTableData = computed(() => {
  if (!searchOutput.value && !hasNoData.value) {
    return labUsers.value
  }

  return labUsers.value
    .filter((labUser: LabUser) => {
      const searchString = `${labUser.displayName} ${labUser.UserEmail}`.toLowerCase();
      return searchString.includes(searchOutput.value.toLowerCase());
    })
    .map((labUser) => labUser);
});

onMounted(async () => {
  await getLabUsers();
});
</script>

<template>
  <div class="mb-11 flex flex-col justify-between">
    <EGBack />
    <div class="flex items-start justify-between">
      <div>
        <EGText tag="h1" class="mb-4">{{ labName }}</EGText>
        <EGText tag="p" class="text-muted">Lab summary, statistics and its users</EGText>
      </div>
      <EGButton label="Add Lab Users" />
    </div>
  </div>

  <UTabs :ui="{
    base: 'focus:outline-none',
    list: {
      base: 'border-b-2 rounded-none mb-4 mt-0',
      padding: 'p-0',
      height: 'h-14',
      marker: {
        wrapper: 'duration-200 ease-out focus:outline-none',
        base: 'absolute bottom-[0px] h-[2px]',
        background: 'bg-primary',
        shadow: 'shadow-none',
      },
      size: {
        sm: 'text-lg',
      },
      tab: {
        base: '!text-base w-auto inline-flex font-heading justify-start ui-focus-visible:outline-0 ui-focus-visible:ring-2 ui-focus-visible:ring-primary-500 ui-not-focus-visible:outline-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-75 duration-200 ease-out',
        active: 'text-primary h-14',
        inactive: 'text-heading',
        height: 'h-14',
        padding: 'p-0',
      },
    },
  }" :default-index="1" :items="[
    {
      key: 'details',
      label: 'Details',
      disabled: true,
    },
    {
      key: 'users',
      label: 'Users',
    },
    {
      key: 'workflow',

      label: 'Workflow',
      disabled: true,
    },
  ]">
    <template #item="{ item }">
      <div v-if="item.key === 'details'" class="space-y-3">Details TBD</div>
      <div v-else-if="item.key === 'users'" class="space-y-3">
        <EGEmptyDataCTA v-if="!useUiStore().isRequestPending && hasNoData"
          message="You don't have any users in this lab yet." img-src="/images/empty-state-user.jpg"
          :button-action="() => { }" button-label="Add Lab Users" />

        <template v-if="!hasNoData">
          <EGSearchInput @input-event="updateSearchOutput" placeholder="Search user" class="my-6 w-[408px]" />

          <EGDialog actionLabel="Remove User" :actionVariant="ButtonVariantEnum.enum.destructive" cancelLabel="Cancel"
            :cancelVariant="ButtonVariantEnum.enum.secondary" @action-triggered="handleRemoveLabUser"
            :primaryMessage="primaryMessage" v-model="isOpen" />

          <EGTable :table-data="filteredTableData" :columns="tableColumns" :is-loading="useUiStore().isRequestPending"
            :show-pagination="!useUiStore().isRequestPending">
            <template #Name-data="{ row: labUser }">
              <div class="flex items-center">
                <EGUserAvatar class="mr-4" :name="labUser.displayName" :email="labUser.UserEmail"
                  :is-active="labUser.Status === 'Active'" />
                <div class="flex flex-col">
                  <div>{{ labUser.displayName }} </div>
                  <div v-if="labUser.UserEmail !== labUser.displayName" class="text-muted text-xs font-normal">{{
                    labUser.UserEmail }}
                  </div>
                </div>
              </div>
            </template>
            <template #assignedRole-data="{ row: labUser }">
              <span class="text-black">{{ labUser.assignedRole }}</span>
            </template>
            <template #actions-data="{ row: labUser }">
              <div class="flex items-center">
                <EGUserRoleDropdown :show-remove-from-lab="true" :key="labUser.UserId"
                  :disabled="useUiStore().isRequestPending" :user="labUser" @assign-role="handleAssignRole($event)"
                  @remove-user-from-lab="({ UserId, displayName }) => removeUserFromLab(UserId, displayName)" />
              </div>
            </template>
            <template #empty-state>
              <div class="text-muted flex h-12 items-center justify-center font-normal">No results found</div>
            </template>
          </EGTable>
        </template>
      </div>
      <div v-else-if="item.key === 'workflow'" class="space-y-3">Workflow TBD</div>
    </template>
  </UTabs>
</template>
