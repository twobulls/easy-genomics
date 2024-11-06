<script setup lang="ts">
  import { LabUser, OrgUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user-unified';
  import { OrganizationUserDetails } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization-user-details';
  import { useToastStore, useUiStore } from '@FE/stores';
  import { EditUserResponse } from '@FE/types/api';

  const props = defineProps<{
    orgId: string;
    labId: string;
    labName: string;
    labUsers: LabUser[];
  }>();

  const emit = defineEmits(['added-user-to-lab']);

  const { $api } = useNuxtApp();

  const labUsers = ref<LabUser[]>(props.labUsers); // Ensure lab users are reactive
  const otherOrgUsers = ref<OrgUser[]>([]);
  const selectedUserId = ref<string | undefined>(undefined);

  const pendingApiRequest = ref(true); // Whether this module is loading all org users, or adding a user to a lab
  const loadingOrgUsers = ref(true); // Whether this module is loading all org users
  const canAddUser = ref(false); // Control the disabled state of the add button
  const isAddingUser = ref(false); // Control the loading state of the add button

  // Watch for changes in the labUsers prop
  watch(
    () => props.labUsers,
    (newLabUsers) => {
      labUsers.value = newLabUsers;
      refreshOrgUsersWithoutLabAccess();
    },
  );

  // Watch selectedUserId.value to enable/disable the add button
  watch(
    () => selectedUserId.value,
    (newSelectedUserId) => {
      canAddUser.value = !!newSelectedUserId;
    },
  );

  async function handleAddSelectedUserToLab() {
    // Update the UI to reflect the pending request
    useUiStore().setRequestPending('addUserToLab');
    pendingApiRequest.value = true;
    isAddingUser.value = true;

    let maybeDisplayName = 'user';

    try {
      const selectedUser = otherOrgUsers.value.find((user: OrgUser) => user.UserId === selectedUserId.value);

      if (!selectedUser) {
        throw new Error('Selected user not found');
      }

      const { displayName, UserId } = selectedUser;
      maybeDisplayName = displayName; // Substute the word 'user' in the error toast message with the users display name

      const res = (await $api.labs.addLabUser(props.orgId, props.labId, UserId)) as EditUserResponse;

      if (!res) {
        throw new Error('User not added to Lab');
      }

      useToastStore().success(`Successfully added ${displayName} to ${props.labName}`);
      selectedUserId.value = undefined;
      emit('added-user-to-lab');
      refreshOrgUsersWithoutLabAccess();
    } catch (error) {
      useToastStore().error(`Failed to add ${maybeDisplayName} to ${props.labName}`);
      console.error(error);
    } finally {
      resetUiLoadingState();
    }
  }

  function hasLabAccess(user: OrganizationUserDetails, labUsers: LabUser[] = []) {
    return labUsers.some((labUser: LabUser) => labUser.UserId === user.UserId);
  }

  async function getOrgUsersWithoutLabAccess() {
    try {
      // Update the UI to reflect the pending request
      pendingApiRequest.value = true;
      loadingOrgUsers.value = true;

      const orgUsers = (await $api.orgs.usersDetailsByOrgId(props.orgId)) as OrganizationUserDetails[];
      const _otherOrgUsers = orgUsers.filter((user: OrganizationUserDetails) => !hasLabAccess(user, labUsers.value));
      otherOrgUsers.value = _otherOrgUsers.map((user: OrganizationUserDetails) => {
        const displayName = useUser().displayName({
          preferredName: user.PreferredName,
          firstName: user.FirstName,
          lastName: user.LastName,
          email: user.UserEmail,
        });
        return {
          ...user,
          displayName,
        } as OrgUser;
      });
    } catch (error) {
      console.error(error);
    } finally {
      resetUiLoadingState();
    }
  }

  // Reset the UI request pending and loading states
  function resetUiLoadingState() {
    useUiStore().setRequestComplete('getLabUsers');
    useUiStore().setRequestComplete('addUserToLab');
    pendingApiRequest.value = false;
    loadingOrgUsers.value = false;
    isAddingUser.value = false;
  }

  async function refreshOrgUsersWithoutLabAccess() {
    // Enable components in the parent page to reflect the pending request
    useUiStore().setRequestPending('getLabUsers');
    pendingApiRequest.value = true;
    await getOrgUsersWithoutLabAccess();
  }

  onMounted(async () => {
    await getOrgUsersWithoutLabAccess();
  });
</script>

<template>
  <EGCard :padding="4">
    <div class="flex space-x-4">
      <USelectMenu
        v-model="selectedUserId"
        :options="otherOrgUsers"
        option-attribute="displayName"
        value-attribute="UserId"
        :disabled="pendingApiRequest"
        :loading="loadingOrgUsers"
        placeholder="Select User"
        searchable
        searchable-placeholder="Search all users..."
        :search-attributes="['displayName', 'UserEmail']"
        clear-search-on-close
        class="grow"
        size="xl"
        :ui="{
          base: 'h-[52px] min-w-96',
        }"
      >
        <template #option="{ option: user }">
          <EGUserDisplay
            :display-name="user.displayName"
            :email="user.UserEmail"
            :status="user.OrganizationUserStatus"
            :show-avatar="true"
          />
        </template>

        <template #option-empty="{ query }">
          <q>{{ query }}</q>
          not found
        </template>

        <template #empty>
          <div v-if="labUsers.length === 0 && otherOrgUsers.length === 0">The organization has no users</div>
          <div v-if="labUsers.length > 0 && otherOrgUsers.length === 0">
            All organization users already have access to this lab
          </div>
        </template>
      </USelectMenu>
      <EGButton
        label="Add"
        :disabled="!canAddUser || pendingApiRequest"
        :loading="isAddingUser"
        icon="i-heroicons-plus"
        @click="handleAddSelectedUserToLab"
      />
    </div>
  </EGCard>
</template>
