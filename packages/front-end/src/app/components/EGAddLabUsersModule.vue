<script setup lang="ts">
  import { LabUser, OrgUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user-unified';
  import { OrganizationUserDetails } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization-user-details';
  import { EditUserResponse } from '@FE/types/api';
  import { UserStatusSchema } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/status';

  const props = defineProps<{
    orgId: string;
    labId: string;
    labName: string;
    labUsers: LabUser[];
  }>();

  const emit = defineEmits(['added-user-to-lab']);

  const { $api } = useNuxtApp();

  const uiStore = useUiStore();

  const otherOrgUsers = ref<OrgUser[]>([]);
  const selectedUserId = ref<string | undefined>(undefined);

  // refresh org users without lab access if labUsers changes
  watch(
    () => props.labUsers,
    async (_newLabUsers) => await getOrgUsersWithoutLabAccess(),
  );

  onMounted(async () => await getOrgUsersWithoutLabAccess());

  async function handleAddSelectedUserToLab() {
    uiStore.setRequestPending('addUserToLab');

    try {
      const selectedUser = otherOrgUsers.value.find((user: OrgUser) => user.UserId === selectedUserId.value);

      if (!selectedUser) {
        throw new Error('Selected user not found');
      }

      const { displayName, UserId } = selectedUser;

      const res = (await $api.labs.addLabUser(props.labId, UserId)) as EditUserResponse;

      if (!res) {
        throw new Error('User not added to Lab');
      }

      useToastStore().success(`Successfully added ${displayName} to ${props.labName}`);
      selectedUserId.value = undefined;
      emit('added-user-to-lab');
      await getOrgUsersWithoutLabAccess();
    } finally {
      uiStore.setRequestComplete('addUserToLab');
    }
  }

  function hasLabAccessAlready(user: OrganizationUserDetails) {
    return props.labUsers.some((labUser: LabUser) => labUser.UserId === user.UserId);
  }

  async function getOrgUsersWithoutLabAccess() {
    uiStore.setRequestPending('getLabUsers');

    try {
      const orgUsers = (await $api.orgs.usersDetailsByOrgId(props.orgId)) as OrganizationUserDetails[];
      const _otherOrgUsers = orgUsers.filter((user: OrganizationUserDetails) => !hasLabAccessAlready(user));
      otherOrgUsers.value = _otherOrgUsers.map((user: OrganizationUserDetails) => {
        const nameData = {
          preferredName: user.PreferredName || null,
          firstName: user.FirstName || null,
          lastName: user.LastName || null,
          email: user.UserEmail || null,
        };
        const displayName = useUser().displayName(nameData);
        const initials = useUser().initials(nameData);

        return {
          ...user,
          displayName,
          initials,
        };
      });
    } finally {
      uiStore.setRequestComplete('getLabUsers');
    }
  }
</script>

<template>
  <EGCard :padding="4">
    <div class="flex space-x-4">
      <USelectMenu
        v-model="selectedUserId"
        :options="otherOrgUsers"
        option-attribute="displayName"
        value-attribute="UserId"
        :disabled="uiStore.anyRequestPending(['getLabUsers', 'addUserToLab'])"
        :loading="uiStore.isRequestPending('getLabUsers')"
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
            :initials="user.initials"
            :name="user.displayName"
            :email="user.UserEmail"
            :inactive="user.OrganizationUserStatus !== UserStatusSchema.enum.Active"
          />
        </template>

        <template #option-empty="{ query }">
          <q>{{ query }}</q>
          not found
        </template>

        <template #empty>
          <div v-if="props.labUsers.length === 0 && otherOrgUsers.length === 0">The organization has no users</div>
          <div v-if="props.labUsers.length > 0 && otherOrgUsers.length === 0">
            All organization users already have access to this lab
          </div>
        </template>
      </USelectMenu>
      <EGButton
        label="Add"
        :disabled="selectedUserId === undefined || uiStore.anyRequestPending(['getLabUsers', 'addUserToLab'])"
        :loading="uiStore.isRequestPending('addUserToLab')"
        icon="i-heroicons-plus"
        @click="handleAddSelectedUserToLab"
      />
    </div>
  </EGCard>
</template>
