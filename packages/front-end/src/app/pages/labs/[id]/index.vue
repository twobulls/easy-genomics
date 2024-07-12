<script setup lang="ts">
  import { LabUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user-unified';
  import {
    LaboratoryRolesEnumSchema,
    LaboratoryRolesEnum,
  } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/roles';
  import { ButtonVariantEnum } from '~/types/buttons';
  import { DeletedResponse, EditUserResponse } from '~/types/api';
  import { useOrgsStore, useToastStore, useUiStore } from '~/stores';
  import useUser from '~/composables/useUser';
  import { LaboratoryUserDetails } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-user-details';
  import { LaboratoryUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-user';
  import { EGTabsStyles } from '~/styles/nuxtui/UTabs';

  const { $api } = useNuxtApp();
  const $route = useRoute();
  const router = useRouter();
  const orgId = useOrgsStore().selectedOrg?.OrganizationId;
  const labId = $route.params.id;
  const labName = $route.query.name;

  const tabItems = [
    {
      key: 'pipelines',

      label: 'Pipelines',
    },
    {
      key: 'runs',
      label: 'Runs',
      disabled: true,
    },
    {
      key: 'users',
      label: 'Lab Users',
    },
    {
      key: 'details',
      label: 'Details',
    },
  ];

  const defaultTabIndex = 0;

  const labUsers = ref<LabUser[]>([]);
  const canAddUsers = ref(false);
  const showAddUserModule = ref(false);
  const searchOutput = ref('');
  const pipelines = ref<[]>([]);

  // Dynamic remove user dialog values
  const isOpen = ref(false);
  const primaryMessage = ref('');
  const userToRemove = ref();

  function displayRemoveUserDialog(user: LabUser) {
    userToRemove.value = user;
    primaryMessage.value = `Are you sure you want to remove ${user.displayName} from ${labName}?`;
    isOpen.value = true;
  }

  async function handleRemoveUserFromLab() {
    let maybeDisplayName = 'user';
    try {
      isOpen.value = false;
      useUiStore().setRequestPending(true);
      const { displayName, UserId } = userToRemove.value;
      maybeDisplayName = displayName;

      const res: DeletedResponse = await $api.labs.removeUser(labId, UserId);

      if (res?.Status !== 'Success') {
        throw new Error(`Failed to remove ${displayName} from ${labName}`);
      }

      useToastStore().success(`Successfully removed ${displayName} from ${labName}`);
    } catch (error) {
      useToastStore().error(`Failed to remove ${maybeDisplayName} from ${labName}`);
    } finally {
      await refreshLabUsers();
      userToRemove.value = undefined;
      useUiStore().setRequestPending(false);
    }
  }

  async function handleAssignLabRole({ user, role }: { user: LabUser; role: LaboratoryRolesEnum }) {
    const { displayName, UserId } = user;
    const isLabManager = role === LaboratoryRolesEnumSchema.enum.LabManager;

    try {
      useUiStore().setRequestPending(true);

      const res: EditUserResponse = await $api.labs.editUserLabAccess(labId, UserId, isLabManager);

      if (res?.Status !== 'Success') {
        throw new Error(`Failed to assign the ${role} role to ${displayName} in ${labName}`);
      }

      useToastStore().success(`Successfully assigned the ${role} role to ${displayName} in ${labName}`);
    } catch (error) {
      useToastStore().error(`Failed to assign the ${role} role to ${displayName} in ${labName}`);
    } finally {
      await refreshLabUsers();
      useUiStore().setRequestPending(false);
    }
  }

  const usersTableColumns = [
    {
      key: 'Name',
      label: 'Name',
      sortable: true,
    },
    {
      key: 'actions',
      label: 'Lab Access',
    },
  ];

  const pipelinesTableColumns = [
    {
      key: 'Name',
      label: 'Name',
    },
    {
      key: 'description',
      label: 'Description',
    },
    {
      key: 'actions',
      label: 'Actions',
    },
  ];

  const pipelinesActionItems = (pipeline: any) => [
    [
      {
        label: 'Run',
        click: () =>
          router.push({
            path: `/labs/${labId}/run-pipeline`,
            query: {
              labName: labName,
              piplelineId: pipeline.pipelineId,
              pipelineName: pipeline.name,
              pipelineDescription: pipeline.description,
            },
          }),
      },
    ],
    [
      {
        label: 'View Parameters',
        click: () => {},
      },
    ],
    [
      {
        label: 'Remove',
        class: 'text-alert-danger-dark',
        click: () => {},
      },
    ],
  ];

  function getAssignedLabRole(labUserDetails: LaboratoryUserDetails): LaboratoryRolesEnum {
    if (labUserDetails.LabManager) {
      return LaboratoryRolesEnumSchema.enum.LabManager;
    }
    return LaboratoryRolesEnumSchema.enum.LabTechnician;
  }

  function getLabUser(labUserDetails: LaboratoryUserDetails, labUsers: LaboratoryUser[]): LabUser {
    const labUser = labUsers.find((labUser) => labUser.UserId === labUserDetails.UserId);
    if (!labUser) {
      throw new Error(`Lab user not found for user ID: ${labUserDetails.UserId}`);
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
      status: labUser.Status,
      assignedRole,
      displayName,
    } as LabUser;
  }

  async function getLabUsers(): Promise<void> {
    try {
      const _labUsersDetails: LaboratoryUserDetails[] = await $api.labs.usersDetails($route.params.id);
      const _labUsers: LaboratoryUser[] = await $api.labs.listLabUsersByLabId($route.params.id);
      labUsers.value = _labUsersDetails.map((user) => getLabUser(user, _labUsers));
    } catch (error) {
      console.error('Error retrieving lab users', error);
      useToastStore().error('Failed to retrieve lab users');
    }
  }

  async function getPipelines(): Promise<void> {
    try {
      const res = await $api.pipelines.list($route.params.id);
      pipelines.value = res.pipelines;
    } catch (error) {
      console.error('Error retrieving pipelines', error);
    }
  }

  // update UI with latest list of lab users and their assigned role
  async function refreshLabUsers() {
    useUiStore().setRequestPending(true);
    await getLabUsers();
    useUiStore().setRequestPending(false);
  }

  function updateSearchOutput(newVal: any) {
    searchOutput.value = newVal;
  }

  const filteredTableData = computed(() => {
    let filteredLabUsers = labUsers.value;

    if (searchOutput.value.trim()) {
      filteredLabUsers = labUsers.value
        .filter((labUser: LabUser) => {
          const searchString = `${labUser.displayName} ${labUser.UserEmail}`.toLowerCase();
          return searchString.includes(searchOutput.value.toLowerCase());
        })
        .map((labUser) => labUser);
    }

    return filteredLabUsers;
  });

  async function handleUserAddedToLab() {
    showAddUserModule.value = false;
    await refreshLabUsers();
  }

  onBeforeMount(async () => {
    useUiStore().setRequestPending(true);
    await getPipelines();
    await getLabUsers();
    canAddUsers.value = true;
    useUiStore().setRequestPending(false);
  });
</script>

<template>
  <EGPageHeader :title="labName" description="View your Lab users, details and pipelines">
    <EGButton label="Add Lab Users" :disabled="!canAddUsers" @click="showAddUserModule = true" />
    <EGAddLabUsersModule
      v-if="showAddUserModule"
      @added-user-to-lab="handleUserAddedToLab()"
      :org-id="orgId"
      :lab-id="labId"
      :lab-name="labName"
      :lab-users="labUsers"
      class="mt-2"
    />
  </EGPageHeader>

  <UTabs :ui="EGTabsStyles" :default-index="defaultTabIndex" :items="tabItems">
    <template #item="{ item }">
      <div v-if="item.key === 'pipelines'" class="space-y-3">
        <EGTable
          :table-data="pipelines"
          :columns="pipelinesTableColumns"
          :is-loading="useUiStore().isRequestPending"
          :show-pagination="!useUiStore().isRequestPending"
        >
          <template #Name-data="{ row: pipeline }">
            <div class="flex items-center">
              {{ pipeline?.name }}
            </div>
          </template>

          <template #description-data="{ row: pipeline }">
            {{ pipeline?.description }}
          </template>

          <template #actions-data="{ row }">
            <div class="flex justify-end">
              <EGActionButton :items="pipelinesActionItems(row)" class="ml-2" />
            </div>
          </template>

          <template #empty-state>
            <div class="text-muted flex h-24 items-center justify-center font-normal">
              There are no users in your Lab
            </div>
          </template>
        </EGTable>
      </div>
      <div v-else-if="item.key === 'runs'" class="space-y-3">Runs TBD</div>
      <div v-else-if="item.key === 'users'" class="space-y-3">
        <EGSearchInput
          @input-event="updateSearchOutput"
          placeholder="Search user"
          :disabled="useUiStore().isRequestPending"
          class="my-6 w-[408px]"
        />

        <EGDialog
          actionLabel="Remove User"
          :actionVariant="ButtonVariantEnum.enum.destructive"
          cancelLabel="Cancel"
          :cancelVariant="ButtonVariantEnum.enum.secondary"
          @action-triggered="handleRemoveUserFromLab"
          :primaryMessage="primaryMessage"
          v-model="isOpen"
        />

        <EGTable
          :table-data="filteredTableData"
          :columns="usersTableColumns"
          :is-loading="useUiStore().isRequestPending"
          :show-pagination="!useUiStore().isRequestPending"
        >
          <template #Name-data="{ row: labUser }">
            <div class="flex items-center">
              <EGUserDisplay
                :display-name="labUser?.displayName"
                :email="labUser?.UserEmail"
                :status="labUser?.status"
                :showAvatar="true"
              />
            </div>
          </template>

          <template #assignedRole-data="{ row: labUser }">
            <span class="text-black">{{ labUser?.assignedRole }}</span>
          </template>

          <template #actions-data="{ row: labUser }">
            <div class="flex items-center">
              <EGUserRoleDropdownNew
                :show-remove-from-lab="true"
                :key="labUser?.UserId"
                :disabled="useUiStore().isRequestPending"
                :user="labUser"
                @assign-lab-role="handleAssignLabRole($event)"
                @remove-user-from-lab="displayRemoveUserDialog($event.user)"
              />
            </div>
          </template>

          <template #empty-state>
            <div class="text-muted flex h-24 items-center justify-center font-normal">
              There are no users in your Lab
            </div>
          </template>
        </EGTable>
      </div>
      <div v-else-if="item.key === 'details'" class="space-y-3">
        <EGLabDetailsForm />
      </div>
    </template>
  </UTabs>
</template>
