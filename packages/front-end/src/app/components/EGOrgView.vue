<script setup lang="ts">
  import { OrganizationUserDetails } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization-user-details';
  import { OrgUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user-unified';
  import { UserSchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/user';
  import { useOrgsStore, useToastStore, useUiStore } from '@FE/stores';
  import useUser from '@FE/composables/useUser';
  import { ButtonVariantEnum } from '@FE/types/buttons';
  import { DeletedResponse } from '@FE/types/api';
  import type { FormSubmitEvent } from '#ui/types';
  import { OrgDetailsForm } from '@FE/types/forms';
  import { VALIDATION_MESSAGES } from '@FE/constants/validation';

  const props = defineProps<{
    orgId: string;
    superuser?: boolean;
  }>();

  const { $api } = useNuxtApp();
  const router = useRouter();
  const { resendInvite, labsCount } = useUser($api);

  const disabledButtons = ref<Record<number, boolean>>({});
  const buttonRequestPending = ref<Record<number, boolean>>({});
  const hasNoData = ref(false);
  const isLoading = computed<boolean>(() => useUiStore().anyRequestPending(['fetchOrgData', 'editOrg']));
  const orgSettingsData = ref({} as Organization | undefined);
  const orgUsersDetailsData = ref<OrgUser[]>([]);
  const showInviteModule = ref(false);

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

  if (props.superuser) {
    tabItems.unshift({
      slot: 'labs',
      label: 'All Labs',
    });
  }

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
        orgId: props.orgId,
      },
    });
  }

  function onRowClicked(row: OrgUser) {
    editUser(row.UserId);
  }

  function actionItems(user: OrgUser) {
    const items: object[] = [
      [
        {
          label: 'Edit User Access',
          click: async () => editUser(user.UserId),
        },
      ],
    ];

    if (props.superuser) {
      items.push([
        {
          label: 'Remove From Org',
          class: 'text-alert-danger-dark',
          click: () => {
            selectedUserId.value = user.UserId;
            primaryMessage.value = `Are you sure you want to remove ${user.displayName} from ${org.value.Name}?`;
            isOpen.value = true;
          },
        },
      ]);
    }

    return items;
  }

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

      const res: DeletedResponse = await $api.orgs.removeUser(props.orgId, selectedUserId.value);

      if (res?.Status === 'Success') {
        useToastStore().success(`${displayName} has been removed from ${org.value.Name}`);
        await fetchOrgData(false);
      } else {
        throw new Error('User not removed from Organization');
      }
    } catch (error) {
      useToastStore().error(`Failed to remove ${displayName} from  ${org.value.Name}`);
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
    useUiStore().setRequestPending('fetchOrgData');
    try {
      if (shouldGetOrgSettings) {
        await useOrgsStore().loadOrg(props.orgId);
      }

      const orgUsers: OrganizationUserDetails[] = await $api.orgs.usersDetailsByOrgId(props.orgId);

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
      useUiStore().setRequestComplete('fetchOrgData');
    }
    return orgSettingsData.value;
  }

  // must be declared after store is set in fetchOrgData()
  const org = computed(() => useOrgsStore().orgs[props.orgId] || {});

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
      const orgUsers: OrganizationUserDetails[] = await $api.orgs.usersDetailsByOrgId(props.orgId);

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
      useUiStore().setRequestPending('editOrg');
      const { Name, Description } = event.data;
      await $api.orgs.update(props.orgId, { Name, Description });
      await fetchOrgData();
      useToastStore().success('Organization updated');
    } catch (error) {
      useToastStore().error(VALIDATION_MESSAGES.network);
    } finally {
      useUiStore().setRequestComplete('editOrg');
    }
  }

  // Note: the UTabs :ui element has to be defined locally to get Tailwind to pick up the classes used.
  // To keep the app styling consistent, any changes made here need to be duplicated to all other UTabs.
  const EGTabsStyles = {
    base: 'focus:outline-none',
    list: {
      base: 'border-b-8 mb-4 mt-0',
      padding: 'p-0',
      height: 'h-14',
      marker: {
        wrapper: 'duration-200 ease-out absolute bottom-0 ',
        base: 'absolute bottom-0 rounded-none h-0.5',
        background: 'bg-primary',
        shadow: 'shadow-none',
      },
      tab: {
        base: 'font-serif w-auto inline-flex justify-start ui-focus-visible:outline-0 ui-focus-visible:ring-2 ui-focus-visible:ring-primary-500 ui-not-focus-visible:outline-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-75 duration-200 ease-out',
        active: 'text-primary h-14',
        inactive: 'font-serif',
        height: 'h-14',
        padding: 'p-0',
        size: 'text-lg',
      },
    },
  };
</script>

<template>
  <EGPageHeader
    :title="org.Name"
    :description="org.Description"
    :back-action="() => $router.push('/orgs')"
    :show-back="true"
    :is-loading="isLoading"
    :skeleton-config="{ titleLines: 1, descriptionLines: 1 }"
  >
    <EGButton label="Invite users" @click="() => (showInviteModule = !showInviteModule)" />
    <div class="mt-2 w-[500px]" v-if="showInviteModule">
      <EGInviteModule @invite-success="refreshUserList($event)" :org-id="props.orgId" />
    </div>
  </EGPageHeader>

  <UTabs :ui="EGTabsStyles" :default-index="0" :items="tabItems">
    <template #details>
      <EGFormOrgDetails @submit-form-org-details="onSubmit($event)" :name="org.Name" :description="org.Description" />
    </template>

    <template #labs v-if="props.superuser">
      <EGLabsList superuser :org-id="props.orgId" />
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
