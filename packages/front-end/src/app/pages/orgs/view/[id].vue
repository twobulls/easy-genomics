<script setup lang="ts">
  import { OrganizationUserDetails } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization-user-details';
  import { UserSchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/user';
  import { useUiStore } from '~/stores/stores';
  import useUser from '~/composables/useUser';
  import { Organization } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization';

  const $route = useRoute();
  const disabledButtons = ref<Record<number, unknown>>({});
  const buttonRequestPending = ref<Record<number, unknown>>({});
  const hasNoData = ref(false);
  const isLoading = ref(true);
  const orgName = $route.query.name;
  const orgSettingsData = ref({} as Organization | undefined);
  const orgUsersDetailsData = ref<OrganizationUserDetails[]>([]);
  const showInviteModule = ref(false);
  const { $api } = useNuxtApp();
  const { resendInvite } = useUser();

  // Table-related refs and computed props
  const page = ref(1);
  const pageCount = ref(10);
  const searchOutput = ref('');
  const pageTotal = computed(() => orgUsersDetailsData.value.length);
  const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1);
  const pageTo = computed(() => Math.min(page.value * pageCount.value, pageTotal.value));
  const { showingResultsMsg } = useTable(pageFrom, pageTo, pageTotal);

  const columns = [
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

  // TODO: wire up action items when available
  const actionItems = (row: any) => [
    [
      {
        label: 'TBC',
        click: (row) => {},
      },
    ],
  ];

  function isInvited(status: string) {
    return status === UserSchema.shape.Status.enum.Invited;
  }

  useAsyncData('orgSettingsData', async () => {
    isLoading.value = true;
    try {
      useUiStore().setRequestPending(true);
      orgSettingsData.value = await $api.orgs.orgSettings($route.params.id as string);
      orgUsersDetailsData.value = await $api.orgs.usersDetails($route.params.id as string);

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
  const filteredRows = computed(() => {
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
  <div class="mb-16 flex flex-col justify-between">
    <a
      @click="$router.go(-1)"
      class="text-primary mb-4 flex cursor-pointer items-center gap-1 whitespace-nowrap text-base font-medium"
    >
      <i class="i-heroicons-arrow-left-solid"></i>
      <span>Back</span>
    </a>
    <div class="flex items-start justify-between">
      <div>
        <EGText tag="h1" class="mb-4">{{ orgName }}</EGText>
        <EGText tag="p" class="text-muted">View your entire Organization</EGText>
      </div>
      <div class="relative flex flex-col items-end">
        <EGButton label="Invite users" @click="() => (showInviteModule = true)" />
        <div class="absolute top-[60px] w-[500px]" v-if="showInviteModule">
          <EGInviteModule @invite-clicked="invite($event)" />
        </div>
      </div>
    </div>
  </div>

  <UTabs
    :ui="{
      base: 'focus:outline-none',
      list: {
        base: 'border-b-2 rounded-none mb-4  mt-2',
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
        <EGSearchInput @output="updateSearchOutput" placeholder="Search user" class="my-6 w-[408px]" />

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
            :rows="filteredRows"
            :columns="columns"
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
                  label="Resend invite"
                  class="mr-2"
                  v-if="isInvited(row.OrganizationUserStatus)"
                  @click="resend(row, index)"
                  :disabled="isButtonDisabled(index) || isButtonRequestPending(index)"
                  :loading="isButtonRequestPending(index)"
                />
                <EGActionButton :items="actionItems(row)" />
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
