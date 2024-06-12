<script setup lang="ts">
import { LabUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user-unified';
import { OrganizationUserDetails } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization-user-details';
import { useToastStore } from '~/stores/stores';

const props = defineProps<{
  orgId: string;
  labId: string;
  labName: string;
  labUsers: LabUser[];
}>();

const emit = defineEmits(['added-user-to-lab']);

const { $api } = useNuxtApp();

const otherOrgUsers = ref<OrgUser[]>([])
const selectedUserId = ref()

const pendingApiRequest = ref(true) // Whether this module is loading all org users, or adding a user to a lab
const canAddUser = ref(false) // Control the disabled state of the add button
const isAddingUser = ref(false) // Control the loading state of the add button

watchEffect(() => {
  canAddUser.value = !!selectedUserId.value
})

async function handleAddSelectedUserToLab() {
  const selectedUser = otherOrgUsers.value.find((user: OrganizationUserDetails) => user.UserId === selectedUserId.value)
  const { displayName, UserId } = selectedUser
  pendingApiRequest.value = true
  isAddingUser.value = true

  try {
    const res = await $api.labs.addLabUser(props.labId, UserId) as EditUserResponse

    if (!res) {
      throw new Error('User not added to Lab')
    }

    useToastStore().success(`Successfully added ${displayName} to ${props.labName}`)
    selectedUserId.value = undefined
    selectedUser.value = undefined
    emit('added-user-to-lab')
    refreshOrgUsers()
  } catch (error) {
    useToastStore().error(`Failed to add ${displayName} to ${props.labName}`)
    console.error(error)
  } finally {
    pendingApiRequest.value = false
    isAddingUser.value = false
  }

}

function hasLabAccess(user: OrganizationUserDetails, labUsers: LabUser[] = []) {
  return labUsers.some((labUser: LabUser) => labUser.UserId === user.UserId)
}

async function getOrgUsersWithoutLabAccess() {
  try {
    const orgUsers = await $api.orgs.usersDetailsByOrgId(props.orgId) as OrganizationUserDetails[]
    const _otherOrgUsers = orgUsers.filter((user: OrganizationUserDetails) => !hasLabAccess(user, props.labUsers))
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
      }
    })
  } catch (error) {
    console.error(error)
  } finally {
    pendingApiRequest.value = false
  }
}

async function refreshOrgUsers() {
  pendingApiRequest.value = true
  await getOrgUsersWithoutLabAccess()
}

onMounted(async () => {
  await getOrgUsersWithoutLabAccess()
})
</script>

<template>
  <EGCard :padding="4">
    <div class="flex space-x-4">
      <USelectMenu v-model="selectedUserId" :options="otherOrgUsers" option-attribute="displayName"
        value-attribute="UserId" :disabled="pendingApiRequest" :loading="false" placeholder="Select User" searchable
        searchable-placeholder="Search all users..." :search-attributes="['displayName', 'UserEmail']"
        clear-search-on-close class="grow" size="xl" :ui="{
          base: 'h-[52px] min-w-96',
        }">

        <template #option="{ option: user }">
          <EGUserDisplay :display-name="user.displayName" :email="user.UserEmail" :status="user.OrganizationUserStatus"
            :show-avatar="true" />
        </template>

        <template #option-empty="{ query }">
          <q>{{ query }}</q> not found
        </template>

        <template #empty>
          <div v-if="props.labUsers.length === 0 && otherOrgUsers.length === 0">The organization has no users
          </div>
          <div v-if="props.labUsers.length > 0 && otherOrgUsers.length === 0">All organization users already have
            access to this lab</div>
        </template>
      </USelectMenu>
      <EGButton label="Add" :disabled="!canAddUser || pendingApiRequest" :loading="isAddingUser" icon="i-heroicons-plus"
        @click="handleAddSelectedUserToLab" />
    </div>
  </EGCard>
</template>
