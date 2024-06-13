<script setup lang="ts">
import { OrganizationUserDetails } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization-user-details';
import { UserSchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/user';
import { useOrgsStore, useToastStore, useUiStore } from '~/stores/stores';
import useUser from '~/composables/useUser';
import { Organization } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization';
import { ButtonVariantEnum } from '~/types/buttons';
import { DeletedResponse } from '~/types/api';
import type { FormSubmitEvent } from '#ui/types';
import { OrgDetailsFormSchema } from '~/types/forms';
import { ERRORS } from '~/constants/validation';
import EGFormOrgDetails from '~/components/EGFormOrgDetails.vue';

const router = useRouter();
const $route = useRoute();
const disabledButtons = ref<Record<number, boolean>>({});
const buttonRequestPending = ref<Record<number, boolean>>({});
const hasNoData = ref(false);
const isLoading = ref(true);
const orgId = $route.params.id;
const orgSettingsData = ref({} as Organization | undefined);
const orgUsersDetailsData = ref<OrganizationUserDetails[]>([]);
const showInviteModule = ref(false);
const { $api } = useNuxtApp();
const { resendInvite, labsCount } = useUser();

// Dynamic remove user dialog values
const isOpen = ref(false);
const primaryMessage = ref('');
const selectedUserId = ref('');
const isRemovingUser = ref(false);

// Table-related refs and computed props
const searchOutput = ref('');

const tableColumns = [
  {
    key: 'Name',
    label: 'Name',
  },
  {
    key: 'status',
    label: 'Status',
  },
  {
    key: 'labs',
    label: 'Labs',
  },
  {
    key: 'actions',
    label: 'Actions',
  },
];

function editUser(user: OrganizationUserDetails) {
  router.push({
    path: '/orgs/edit-user',
    query: {
      userId: user.UserId,
      orgId,
    },
  });
}

const actionItems = (row: OrganizationUserDetails) => [
  [
    {
      label: 'Edit User Access',
      click: async () => editUser(row),
    },
  ],
  [
    {
      label: 'Remove From Org',
      class: 'text-alert-danger-dark',
      click: () => {
        selectedUserId.value = row.UserId;
        primaryMessage.value = `Are you sure you want to remove ${useUser().displayName({
          preferredName: row.PreferredName,
          firstName: row.FirstName,
          lastName: row.LastName,
          email: row.UserEmail,
        })} from ${useOrgsStore().selectedOrg!.Name}?`;
        isOpen.value = true;
      },
    },
  ],
];

/**
 * Filter rows based on search input for both name and email
 */
const filteredTableData = computed(() => {
  if (!searchOutput.value && !hasNoData.value) {
    return orgUsersDetailsData.value;
  }
  return orgUsersDetailsData.value.filter((person: OrganizationUserDetails) => {
    const fullName = String(
      useUser().displayName({
        preferredName: person.PreferredName || '',
        firstName: person.FirstName || '',
        lastName: person.LastName || '',
        email: person.UserEmail,
      })
    ).toLowerCase();

    const email = String(person.UserEmail).toLowerCase();

    return fullName.includes(lowerCasedSearch.value) || email.includes(lowerCasedSearch.value);
  });
});

const lowerCasedSearch = computed(() => searchOutput.value.toLowerCase());

onBeforeMount(async () => {
  await fetchOrgData();
});

async function handleRemoveOrgUser() {
  isOpen.value = false;
  isRemovingUser.value = true;

  const userToRemove = orgUsersDetailsData.value.find((user) => user.UserId === selectedUserId.value);
  const displayName = useUser().displayName({
    preferredName: userToRemove?.PreferredName,
    firstName: userToRemove?.FirstName,
    lastName: userToRemove?.LastName,
    email: userToRemove?.UserEmail,
  });

  try {
    if (!selectedUserId.value) {
      throw new Error('No selectedUserId');
    }

    const res: DeletedResponse = await $api.orgs.removeUser(orgId, selectedUserId.value);

    if (res?.Status === 'Success') {
      useToastStore().success(`${displayName} has been removed from ${useOrgsStore().selectedOrg!.Name}`);
      await fetchOrgData(false);
    } else {
      throw new Error('User not removed from Organization');
    }
  } catch (error) {
    useToastStore().error(`Failed to remove ${displayName} from  ${useOrgsStore().selectedOrg!.Name}`);
    throw error;
  } finally {
    selectedUserId.value = '';
    isOpen.value = false;
    isRemovingUser.value = false;
  }
}

function isInvited(status: string) {
  return status === UserSchema.shape.Status.enum.Invited;
}

/**
 * Fetches Organization data - org users and (optionally) org settings
 * @param shouldGetOrgSettings
 */
async function fetchOrgData(shouldGetOrgSettings: boolean = true) {
  isLoading.value = true;
  try {
    if (shouldGetOrgSettings) {
      orgSettingsData.value = await $api.orgs.orgSettings(orgId);
      useOrgsStore().setSelectedOrg(orgSettingsData.value!);
    }
    orgUsersDetailsData.value = await $api.orgs.usersDetailsByOrgId(orgId);

    if (orgUsersDetailsData.value.length === 0) {
      hasNoData.value = true;
    }
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    isLoading.value = false;
  }
  return orgSettingsData.value;
}

async function resend(userDetails: OrganizationUserDetails, index: number) {
  const { OrganizationId, UserEmail } = userDetails;
  setButtonRequestPending(true, index);

  try {
    await resendInvite({ OrganizationId, UserEmail });
    disableButton(index);
  } catch (error) {
    console.error(error);
  } finally {
    setButtonRequestPending(false, index);
  }
}

function disableButton(index: number) {
  disabledButtons.value[index] = true;
  buttonRequestPending.value[index] = false;
}

function setButtonRequestPending(isPending: boolean, index: number) {
  buttonRequestPending.value[index] = isPending;
}

async function refreshUserList() {
  orgUsersDetailsData.value = await $api.orgs.usersDetailsByOrgId($route.params.id as string);
  showInviteModule.value = false;
  hasNoData.value = orgUsersDetailsData.value.length === 0;
}

function isButtonRequestPending(index: number) {
  return buttonRequestPending.value[index];
}

function isButtonDisabled(index: number) {
  return disabledButtons.value[index];
}

function updateSearchOutput(newVal: string) {
  searchOutput.value = newVal;
}

async function onSubmit(event: FormSubmitEvent<OrgDetailsFormSchema>) {
  try {
    useUiStore().setRequestPending(true);
    const { Name, Description } = event.data;
    await $api.orgs.update(useOrgsStore().selectedOrg?.OrganizationId, { Name, Description });
    await fetchOrgData();
    useToastStore().success('Organization updated');
  } catch (error) {
    useToastStore().error(ERRORS.network);
  } finally {
    useUiStore().setRequestPending(false);
  }
}
</script>

<template>
  <EGPageHeader :title="useOrgsStore().selectedOrg!.Name" :description="useOrgsStore().selectedOrg!.Description">
    <EGButton label="Invite users" @click="() => (showInviteModule = !showInviteModule)" />
    <div class="mt-2 w-[500px]" v-if="showInviteModule">
      <EGInviteModule @invite-success="refreshUserList($event)" :org-id="$route.params.id" />
    </div>
  </EGPageHeader>

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
  }" :default-index="0" :items="[
      {
        slot: 'users',
        label: 'All users',
      },
      {
        slot: 'details',
        label: 'Details',
      },
    ]">
    <template #details>
      <EGFormOrgDetails @submit-form-org-details="onSubmit($event)" :name="useOrgsStore().selectedOrg?.Name"
        :description="useOrgsStore().selectedOrg?.Description" />
    </template>

    <template #users>
      <EGEmptyDataCTA v-if="!isLoading && hasNoData" message="You don't have any users in this lab yet."
        img-src="/images/empty-state-user.jpg" />

      <template v-if="!hasNoData">
        <EGSearchInput @input-event="updateSearchOutput" placeholder="Search user" class="my-6 w-[408px]"
          :disabled="isLoading" />

        <EGDialog actionLabel="Remove User" :actionVariant="ButtonVariantEnum.enum.destructive" cancelLabel="Cancel"
          :cancelVariant="ButtonVariantEnum.enum.secondary" @action-triggered="handleRemoveOrgUser"
          :primaryMessage="primaryMessage" v-model="isOpen" />

        <EGDialog actionLabel="Remove User" :actionVariant="ButtonVariantEnum.enum.destructive" cancelLabel="Cancel"
          :cancelVariant="ButtonVariantEnum.enum.secondary" @action-triggered="handleRemoveOrgUser"
          :primaryMessage="primaryMessage" v-model="isOpen" />

        <EGTable :table-data="filteredTableData" :columns="tableColumns" :is-loading="isLoading"
          :action-items="actionItems" :show-pagination="!isLoading">
          <template #Name-data="{ row }">
            <div class="flex items-center">
              <EGUserAvatar class="mr-4" :name="useUser().displayName({
                preferredName: row.PreferredName,
                firstName: row.FirstName,
                lastName: row.LastName,
                email: row.UserEmail,
              })
                " :email="row.UserEmail" :is-active="row.OrganizationUserStatus === 'Active'" />
              <div class="flex flex-col">
                <div>
                  {{
                    row.FirstName
                      ? useUser().displayName({
                        preferredName: row.PreferredName,
                        firstName: row.FirstName,
                        lastName: row.LastName,
                        email: row.UserEmail,
                      })
                      : ''
                  }}
                </div>
                <div class="text-muted text-xs font-normal">{{ (row as OrganizationUserDetails).UserEmail }}</div>
              </div>
            </div>
          </template>
          <template #status-data="{ row }">
            <span class="text-muted">{{ (row as OrganizationUserDetails).OrganizationUserStatus }}</span>
          </template>
          <template #labs-data="{ row }">
            <span class="text-muted">{{ labsCount(row) }}</span>
          </template>
          <template #actions-data="{ row, index }">
            <div class="flex justify-end">
              <EGButton size="sm" variant="secondary" label="Resend Invite"
                v-if="isInvited((row as OrganizationUserDetails).OrganizationUserStatus)"
                @click="resend(row as OrganizationUserDetails, index)"
                :disabled="isButtonDisabled(index) || isButtonRequestPending(index)"
                :loading="isButtonRequestPending(index)" />
              <EGActionButton v-if="row.OrganizationUserStatus === 'Active'" :items="actionItems(row)" class="ml-2" />
            </div>
          </template>
        </EGTable>

        <div class="text-muted my-6 text-center text-xs">
          This organisation can only be removed by contacting your System administrator at: [System admin email]
        </div>
      </template>
    </template>
  </UTabs>
</template>
