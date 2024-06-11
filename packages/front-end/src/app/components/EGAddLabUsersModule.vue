<script setup lang="ts">
import { LabUserSchema, LabUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/lab-user';
import { OrganizationUserDetails } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization-user-details';

const props = defineProps<{
  orgId: string;
  labId: string;
  labUsers: LabUser[];
}>();

// GET All Organiztion Users API
// {{BASE_API_URL}}/easy-genomics/organization/user/list-organization-users-details?organizationId=61c86013-74f2-4d30-916a-70b03a97ba14
// list-organisation-user-details (by organisationId) in Postman

const { $api } = useNuxtApp();
const usersWithoutLabAccess = ref<OrganizationUserDetails[]>([])
const selectedUser = ref()
const isLoading = ref(false)

function hasLabAccess(user: OrganizationUserDetails, labUsers: LabUser[]) {
  return labUsers.some((labUser: LabUser) => labUser.UserId === user.UserId)
}

async function getOrgUsersWithoutLabAccess({ orgId, labUsers }: { orgId: string, labUsers: LabUser[] }) {
  try {
    isLoading.value = true
    const orgUsers = await $api.orgs.usersDetailsByOrgId(orgId)
    usersWithoutLabAccess.value = orgUsers.filter((user: OrganizationUserDetails) => !hasLabAccess(user, labUsers))
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await getOrgUsersWithoutLabAccess({ orgId: props.orgId, labUsers: props.labUsers })
})
</script>

<template>
  <EGCard :padding="4">
    <div class="flex space-x-4">
      <USelectMenu v-model="selectedUser" :options="usersWithoutLabAccess" option-attribute="UserEmail"
        value-attribute="UserId" :disabled="false" :loading="false" placeholder="Select User" searchable
        searchable-placeholder="Search all users..." :search-attributes="['UserEmail']" clear-search-on-close
        class="grow" size="xl" :ui="{
          base: 'h-[52px] min-w-96',
        }">

        <template #option="{ option: user }">
          <EGUserDisplay :display-name="user.displayName" :email="user.UserEmail" :org-status="user.Status"
            :show-avatar="true" />
        </template>

        <template #option-empty="{ query }">
          <q>{{ query }}</q> not found
        </template>
      </USelectMenu>
      <EGButton label="Add" type="submit" :disabled="false" icon="i-heroicons-plus" />
    </div>
  </EGCard>
</template>
