<script setup lang="ts">
  import { OrganizationUserDetails } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization-user-details';
  import { OrgUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user-unified';
  import { UserSchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/user';
  import { useOrgsStore, useToastStore, useUiStore } from '@FE/stores';
  import useUser from '@FE/composables/useUser';
  import { Organization } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization';
  import { ButtonVariantEnum } from '@FE/types/buttons';
  import { DeletedResponse } from '@FE/types/api';
  import type { FormSubmitEvent } from '#ui/types';
  import { OrgDetailsForm } from '@FE/types/forms';
  import { VALIDATION_MESSAGES } from '@FE/constants/validation';
  import { EGTabsStyles } from '@FE/styles/nuxtui/UTabs';

  const router = useRouter();
  const $route = useRoute();
  const disabledButtons = ref<Record<number, boolean>>({});
  const buttonRequestPending = ref<Record<number, boolean>>({});
  const hasNoData = ref(false);
  const isLoading = ref(true);
  const orgId = $route.params.orgId;
  const orgSettingsData = ref({} as Organization | undefined);
  const orgUsersDetailsData = ref<OrgUser[]>([]);
  const showInviteModule = ref(false);
  const { $api } = useNuxtApp();
  const { resendInvite, labsCount } = useUser($api);

  // Dynamic remove user dialog values
  const isOpen = ref(false);
  const primaryMessage = ref('');
  const selectedUserId = ref('');
  const isRemovingUser = ref(false);

  // Table-related refs and computed props
  const searchOutput = ref('');

  const tabItems = [
    {
      slot: 'users',
      label: 'All users',
    },
    {
      slot: 'details',
      label: 'Details',
    },
  ];

  const tableColumns = [
    {
      key: 'displayName',
      label: 'Name',
      sortable: true,
      sort: useSort().stringSortCompare,
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

  function editUser(userId: string) {
    router.push({
      path: '/orgs/edit-user',
      query: {
        userId,
        orgId,
      },
    });
  }

  function onRowClicked(row: OrgUser) {
    editUser(row.UserId);
  }

  const actionItems = (user: OrgUser) => [
    [
      {
        label: 'Edit User Access',
        click: async () => editUser(user.UserId),
      },
    ],
    [
      {
        label: 'Remove From Org',
        class: 'text-alert-danger-dark',
        click: () => {
          selectedUserId.value = user.UserId;
          primaryMessage.value = `Are you sure you want to remove ${user.displayName} from ${useOrgsStore().selectedOrg!.Name}?`;
          isOpen.value = true;
        },
      },
    ],
  ];

  /**
   * Filter rows based on search input for both name and email
   */
  const filteredTableData = computed(() => {
    let data = orgUsersDetailsData.value;

    if (searchOutput.value || hasNoData.value) {
      data = data.filter((user: OrgUser) => {
        const fullName = user.displayName.toLowerCase();
        const email = String(user.UserEmail).toLowerCase();

        return fullName.includes(lowerCasedSearch.value) || email.includes(lowerCasedSearch.value);
      });
    }

    return data.sort((userA, userB) => useSort().stringSortCompare(userA.displayName, userB.displayName));
  });

  const lowerCasedSearch = computed(() => searchOutput.value.toLowerCase());

  onBeforeMount(async () => {
    await fetchOrgData();
  });

  async function handleRemoveOrgUser() {
    isOpen.value = false;
    isRemovingUser.value = true;

    const userToRemove = orgUsersDetailsData.value.find((user) => user.UserId === selectedUserId.value);
    const displayName = userToRemove?.displayName;

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

      const orgUsers: OrganizationUserDetails[] = await $api.orgs.usersDetailsByOrgId(orgId);

      if (orgUsers?.length === 0) {
        hasNoData.value = true;
      }

      // Add displayName to each of the user records for display and sorting purposes
      orgUsersDetailsData.value = orgUsers.map((user) => ({
        ...user,
        displayName: useUser().displayName({
          preferredName: user.PreferredName,
          firstName: user.FirstName,
          lastName: user.LastName,
          email: user.UserEmail,
        }),
      }));
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      isLoading.value = false;
    }
    return orgSettingsData.value;
  }

  async function resend(userDetails: OrgUser, index: number) {
    const { OrganizationId, UserEmail } = userDetails;

    if (!UserEmail) {
      console.error('UserEmail is missing');
      return;
    }

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
    try {
      const orgUsers: OrganizationUserDetails[] = await $api.orgs.usersDetailsByOrgId(orgId);

      if (orgUsers?.length === 0) {
        hasNoData.value = true;
      }

      // Add displayName to each of the user records for display and sorting purposes
      orgUsersDetailsData.value = orgUsers.map((user) => ({
        ...user,
        displayName: useUser().displayName({
          preferredName: user.PreferredName,
          firstName: user.FirstName,
          lastName: user.LastName,
          email: user.UserEmail,
        }),
      }));
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      showInviteModule.value = false;
    }
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

  async function onSubmit(event: FormSubmitEvent<OrgDetailsForm>) {
    try {
      useUiStore().setRequestPending(true);
      const { Name, Description } = event.data;
      await $api.orgs.update(useOrgsStore().selectedOrg?.OrganizationId, { Name, Description });
      await fetchOrgData();
      useToastStore().success('Organization updated');
    } catch (error) {
      useToastStore().error(VALIDATION_MESSAGES.network);
    } finally {
      useUiStore().setRequestPending(false);
    }
  }
</script>

<template>
  <EGPageHeader
    :title="useOrgsStore().selectedOrg!.Name"
    :description="useOrgsStore().selectedOrg!.Description"
    :back-action="() => $router.push('/orgs')"
  >
    <EGButton label="Invite users" @click="() => (showInviteModule = !showInviteModule)" />
    <div class="mt-2 w-[500px]" v-if="showInviteModule">
      <EGInviteModule @invite-success="refreshUserList($event)" :org-id="orgId" />
    </div>
  </EGPageHeader>

  <UTabs :ui="EGTabsStyles" :default-index="0" :items="tabItems">
    <template #details>
      <EGFormOrgDetails
        @submit-form-org-details="onSubmit($event)"
        :name="useOrgsStore().selectedOrg?.Name"
        :description="useOrgsStore().selectedOrg?.Description"
      />
    </template>

    <template #users>
      <EGEmptyDataCTA
        v-if="!isLoading && hasNoData"
        message="You don't have any users in this lab yet."
        img-src="/images/empty-state-user.jpg"
      />

      <template v-if="!hasNoData">
        <EGSearchInput
          @input-event="updateSearchOutput"
          placeholder="Search user"
          class="my-6 w-[408px]"
          :disabled="isLoading"
        />

        <EGDialog
          actionLabel="Remove User"
          :actionVariant="ButtonVariantEnum.enum.destructive"
          cancelLabel="Cancel"
          :cancelVariant="ButtonVariantEnum.enum.secondary"
          @action-triggered="handleRemoveOrgUser"
          :primaryMessage="primaryMessage"
          v-model="isOpen"
        />

        <EGDialog
          actionLabel="Remove User"
          :actionVariant="ButtonVariantEnum.enum.destructive"
          cancelLabel="Cancel"
          :cancelVariant="ButtonVariantEnum.enum.secondary"
          @action-triggered="handleRemoveOrgUser"
          :primaryMessage="primaryMessage"
          v-model="isOpen"
        />

        <EGTable
          :table-data="filteredTableData"
          :columns="tableColumns"
          :is-loading="isLoading"
          :action-items="actionItems"
          :show-pagination="!isLoading"
          :row-click-action="onRowClicked"
        >
          <template #Name-data="{ user: row }">
            <div class="flex items-center">
              <EGUserAvatar
                class="mr-4"
                :name="row.displayName"
                :email="row.UserEmail"
                :is-active="row.OrganizationUserStatus === 'Active'"
              />
              <div class="flex flex-col">
                <div>
                  {{ row.FirstName ? row.FirstName : row.displayName }}
                </div>
                <div class="text-muted text-xs font-normal">{{ (row as OrgUser).UserEmail }}</div>
              </div>
            </div>
          </template>
          <template #status-data="{ row }">
            <span class="text-muted">{{ (row as OrgUser).OrganizationUserStatus }}</span>
          </template>
          <template #labs-data="{ row }">
            <span class="text-muted">{{ labsCount(row) }}</span>
          </template>
          <template #actions-data="{ row, index }">
            <div class="flex items-center justify-end">
              <EGButton
                class="relative z-10"
                size="sm"
                variant="secondary"
                label="Resend Invite"
                v-if="isInvited((row as OrgUser).OrganizationUserStatus)"
                @click="
                  $event.stopPropagation();
                  resend(row as OrgUser, index);
                "
                :disabled="isButtonDisabled(index) || isButtonRequestPending(index)"
                :loading="isButtonRequestPending(index)"
              />
              <EGActionButton @click="$event.stopPropagation()" :items="actionItems(row)" class="ml-2" />
            </div>
          </template>
        </EGTable>

        <div class="text-muted my-6 text-center text-xs">
          This organization can only be removed by contacting your System administrator at: [System admin email]
        </div>
      </template>
    </template>
  </UTabs>
</template>
