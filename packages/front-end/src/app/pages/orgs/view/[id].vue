<script setup lang="ts">
  import { OrganizationUserDetails } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization-user-details';
  import { UserSchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/user';
  import { useOrgsStore, useToastStore, useUiStore } from '~/stores/stores';
  import useUser from '~/composables/useUser';
  import { Organization } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization';
  import { ButtonVariantEnum } from '~/types/buttons';
  import { DeletedResponse } from '~/types/api';

  const $route = useRoute();
  const disabledButtons = ref<Record<number, unknown>>({});
  const buttonRequestPending = ref<Record<number, unknown>>({});
  const hasNoData = ref(false);
  const isLoading = ref(true);
  const orgId = $route.params.id;
  const orgName = $route.query.name;
  const orgDescription = $route.query.desc;
  const orgSettingsData = ref({} as Organization | undefined);
  const orgUsersDetailsData = ref<OrganizationUserDetails[]>([]);
  const showInviteModule = ref(false);
  const { $api } = useNuxtApp();
  const { resendInvite } = useUser();

  // Dynamic remove user dialog values
  const isOpen = ref(false);
  const primaryMessage = ref('');
  const selectedUserId = ref('');
  const isRemovingUser = ref(false);

  // Table-related refs and computed props
  const page = ref(1);
  const pageCount = ref(10);
  const searchOutput = ref('');
  const pageTotal = computed(() => orgUsersDetailsData.value.length);
  const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1);
  const pageTo = computed(() => Math.min(page.value * pageCount.value, pageTotal.value));
  const { showingResultsMsg } = useTable(pageFrom, pageTo, pageTotal);

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

  async function editUser(user: OrganizationUserDetails) {
    await navigateTo({
      path: `/orgs/edit-user`,
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
        label: 'Remove from Org',
        click: () => {
          selectedUserId.value = row.UserId;
          primaryMessage.value = `Are you sure you want to remove ${useUser().displayName({
            preferredName: row.PreferredName,
            firstName: row.FirstName,
            lastName: row.LastName,
          })} from the Organization?`;
          isOpen.value = true;
        },
      },
    ],
  ];

  async function handleRemoveOrgUser() {
    isOpen.value = false;
    isRemovingUser.value = true;
    try {
      if (!selectedUserId.value) {
        throw new Error('No selectedUserId');
      }

      const res: DeletedResponse = await $api.orgs.removeUser(orgId, selectedUserId.value);

      if (res?.Status === 'Success') {
        useToastStore().success(`${useUser().displayName} has been removed from ${orgName}`);
        await getOrgData(false);
      } else {
        throw new Error('User not removed from Organization');
      }
    } catch (error) {
      useToastStore().error(`Failed to remove user from ${orgName}`);
      throw error;
    } finally {
      selectedUserId.value = '';
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
  async function getOrgData(shouldGetOrgSettings: boolean = true) {
    isLoading.value = true;
    try {
      if (shouldGetOrgSettings) {
        orgSettingsData.value = await $api.orgs.orgSettings(orgId);
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

  onMounted(async () => {
    await getOrgData();
  });

  useAsyncData('orgSettingsData', async () => {
    isLoading.value = true;
    try {
      useUiStore().setRequestPending(true);
      orgSettingsData.value = await $api.orgs.orgSettings(orgId);
      orgUsersDetailsData.value = await $api.orgs.usersDetailsByOrgId(orgId);

      if (orgUsersDetailsData.value.length === 0) {
        hasNoData.value = true;
      }
    } catch (error) {
      console.error(error);
    } finally {
      isLoading.value = false;
      useUiStore().setRequestPending(false);
    }
    return orgSettingsData.value;
  });

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
        })
      ).toLowerCase();

      const email = String(person.UserEmail).toLowerCase();

      return fullName.includes(searchOutput.value.toLowerCase()) || email.includes(searchOutput.value.toLowerCase());
    });
  });

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
</script>

<template>
  <EGPageHeader :title="orgName" :description="orgDescription">
    <EGButton label="Invite users" @click="() => (showInviteModule = !showInviteModule)" />
    <div class="mt-2 w-[500px]" v-if="showInviteModule">
      <EGInviteModule @invite-success="refreshUserList($event)" :org-id="$route.params.id" />
    </div>
  </EGPageHeader>

  <UTabs
    :ui="{
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
    }"
    :default-index="0"
    :items="[
      {
        slot: 'users',
        label: 'All users',
      },
      {
        slot: 'details',
        label: 'Details',
      },
    ]"
  >
    <template #details>
      <USkeleton
        class="flex h-60 flex-col rounded-2xl bg-gray-200 p-6 max-md:px-5"
        :ui="{ rounded: 'rounded-full' }"
        v-if="isLoading"
      />
      <EGCard v-else>
        <EGFormGroup label="Organization name" name="Name">
          <EGInput :placeholder="orgSettingsData.Name" disabled />
        </EGFormGroup>
        <EGFormGroup label="Organization description" name="Description">
          <EGInput :placeholder="orgSettingsData.Description" disabled />
        </EGFormGroup>
      </EGCard>
    </template>

    <template #users>
      <EGEmptyDataCTA
        v-if="!isLoading && hasNoData"
        message="You don't have any users in this lab yet."
        img-src="/images/empty-state-user.jpg"
        :button-action="() => {}"
        button-label="Invite new users"
      />

      <template v-if="!hasNoData">
        <EGSearchInput @input-event="updateSearchOutput" placeholder="Search user" class="my-6 w-[408px]" />

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

        <UCard
          class="rounded-2xl border-none shadow-none"
          :ui="{
            body: 'p-0',
          }"
        >
          <UTable
            :loading="isLoading"
            class="OrgUsersTable rounded-xl"
            :loading-state="{ icon: '', label: '' }"
            :rows="filteredTableData"
            :columns="tableColumns"
          >
            <template #Name-data="{ row }">
              <div class="flex items-center">
                <EGUserAvatar
                  class="mr-4"
                  :name="
                    useUser().displayName({
                      preferredName: row.PreferredName,
                      firstName: row.FirstName,
                      lastName: row.LastName,
                    })
                  "
                  :email="row.UserEmail"
                  :is-active="row.OrganizationUserStatus === 'Active'"
                />
                <div class="flex flex-col">
                  <div>
                    {{
                      useUser().displayName({
                        preferredName: row.PreferredName,
                        firstName: row.FirstName,
                        lastName: row.LastName,
                      })
                    }}
                  </div>
                  <div class="text-muted text-xs font-normal">{{ row.UserEmail }}</div>
                </div>
              </div>
            </template>
            <template #status-data="{ row }">
              <span class="text-muted">{{ row.OrganizationUserStatus }}</span>
            </template>
            <template #labs-data="{ row }">
              <span class="text-muted">{{ row.LabCount }}</span>
            </template>
            <template #actions-data="{ row, index }">
              <div class="flex justify-end">
                <EGButton
                  size="sm"
                  variant="secondary"
                  label="Resend invite"
                  v-if="isInvited(row.OrganizationUserStatus)"
                  @click="resend(row, index)"
                  :disabled="isButtonDisabled(index) || isButtonRequestPending(index)"
                  :loading="isButtonRequestPending(index)"
                />
                <EGActionButton v-if="row.OrganizationUserStatus === 'Active'" :items="actionItems(row)" class="ml-2" />
              </div>
            </template>
            <template #empty-state>
              <div class="text-muted text-normal flex h-12 items-center justify-center">No results found</div>
            </template>
          </UTable>
        </UCard>

        <div class="text-muted flex h-16 flex-wrap items-center justify-between" v-if="!searchOutput">
          <div class="text-xs leading-5">{{ showingResultsMsg }}</div>
          <div class="flex justify-end px-3" v-if="pageTotal > pageCount">
            <UPagination v-model="page" :page-count="10" :total="orgUsersDetailsData.length" />
          </div>
        </div>
        <div class="text-muted my-6 text-center text-xs">
          This organisation can only be removed by contacting your System administrator at: [System admin email]
        </div>
      </template>
    </template>
  </UTabs>
</template>

<style>
  .OrgUsersTable {
    font-size: 14px;
    width: 100%;
    table-layout: auto;

    thead {
      button {
        color: black;
      }

      tr {
        background-color: #efefef;

        th:first-child {
          padding-left: 40px;
          width: 400px;
        }
        th:last-child {
          text-align: right;
          padding-right: 40px;
        }
      }
    }

    tbody tr td:nth-child(1) {
      color: black;
      font-weight: 600;
      padding-left: 40px;
    }

    tbody tr td:nth-child(2) {
      font-size: 12px;
      color: #818181;
    }

    tbody tr td:last-child {
      width: 50px;
      padding-right: 40px;
    }
  }
</style>
