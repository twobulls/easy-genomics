<script setup lang="ts">
  import { LaboratoryUserDetails } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-user-details';
  import { ButtonVariantEnum } from '~/types/buttons';
  import { DeletedResponse } from '~/types/api';
  import { useToastStore, useUiStore } from '~/stores/stores';
  import EGUserRoleDropdown from '~/components/EGUserRoleDropdown.vue';
  import { EditLaboratoryUser } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/laboratory-user';
  import { LaboratoryUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-user';
  import useUser from '~/composables/useUser';

  const { $api } = useNuxtApp();
  const $route = useRoute();
  const labName = $route.query.name;
  const hasNoData = ref(false);
  const labUsersDetailsData = ref<LaboratoryUserDetails[]>([]);
  const page = ref(1);
  const pageCount = ref(10);
  const searchOutput = ref('');
  const pageTotal = computed(() => labUsersDetailsData.value.length);
  const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1);
  const pageTo = computed(() => Math.min(page.value * pageCount.value, pageTotal.value));
  const { showingResultsMsg } = useTable(pageFrom, pageTo, pageTotal);
  const laboratoryId = $route.params.id;

  // Dynamic remove user dialog values
  const isOpen = ref(false);
  const primaryMessage = ref('');
  const selectedUserId = ref('');

  async function handleRemoveLabUser() {
    isOpen.value = false;
    try {
      if (!selectedUserId.value) {
        throw new Error('No selectedUserId');
      }

      useUiStore().setRequestPending(true);

      const res: DeletedResponse = await $api.labs.removeUser(laboratoryId, selectedUserId.value);

      if (res?.Status === 'Success') {
        useToastStore().success('User removed from Lab');
        await getLabUsers();
      } else {
        throw new Error('User not removed from Lab');
      }
    } catch (error) {
      useToastStore().error('Failed to remove user from Lab');
      throw error;
    } finally {
      await getLabUsers();
      selectedUserId.value = '';
      useUiStore().setRequestPending(false);
    }
  }

  async function handleAssignRole(userDetails: EditLaboratoryUser) {
    try {
      useUiStore().setRequestPending(true);
      const res: LaboratoryUser = await $api.labs.editLabUser(userDetails);
      if (res) {
        useToastStore().success('Assigned new role');
      } else {
        throw new Error('Failed to assign new role');
      }
    } catch (error) {
      console.error('Error assigning new role', error);
      useToastStore().error('Failed to assign new role');
    } finally {
      await getLabUsers();
      useUiStore().setRequestPending(false);
    }
  }

  const tableColumns = [
    {
      key: 'Name',
      label: 'Name',
    },
    {
      key: 'actions',
      label: 'Lab Access',
    },
  ];

  const actionItems = (row: LaboratoryUserDetails) => [
    [
      {
        label: 'Edit lab access',
        click: () => {},
      },
    ],
    [
      {
        label: 'Remove From Lab',
        click: () => {
          selectedUserId.value = row.UserId;
          primaryMessage.value = `Are you sure you want to remove ${useUser().displayName({
            preferredName: row.PreferredName,
            firstName: row.FirstName,
            lastName: row.LastName,
            email: row.UserEmail,
          })} from ${labName}?`;
          isOpen.value = true;
        },
      },
    ],
  ];

  async function getLabUsers() {
    try {
      useUiStore().setRequestPending(true);
      labUsersDetailsData.value = await $api.labs.usersDetails($route.params.id);

      if (labUsersDetailsData.value.length === 0) {
        hasNoData.value = true;
      }
    } catch (error) {
      console.error('Error retrieving lab users', error);
      useToastStore().error('Failed to retrieve lab users');
    } finally {
      useUiStore().setRequestPending(false);
    }
  }

  function updateSearchOutput(newVal: any) {
    searchOutput.value = newVal;
  }

  const filteredTableData = computed(() => {
    if (!searchOutput.value && !hasNoData.value) {
      return labUsersDetailsData.value.map((person: LaboratoryUserDetails) => ({
        ...person,
        assignedRole: person.LabManager ? 'Lab Manager' : person.LabTechnician ? 'Lab Technician' : 'Unknown',
      }));
    }

    return labUsersDetailsData.value
      .filter((person: LaboratoryUserDetails) => {
        const fullName = String(
          useUser().displayName({
            preferredName: person.PreferredName || '',
            firstName: person.FirstName || '',
            lastName: person.LastName || '',
            email: person.UserEmail,
          })
        ).toLowerCase();

        const email = String(person.UserEmail).toLowerCase();

        return fullName.includes(searchOutput.value.toLowerCase()) || email.includes(searchOutput.value.toLowerCase());
      })
      .map((person) => ({
        ...person,
        assignedRole: person.LabManager ? 'Lab Manager' : person.LabTechnician ? 'Lab Technician' : 'Unknown',
      }));
  });

  onMounted(async () => {
    await getLabUsers();
  });
</script>

<template>
  <div class="mb-11 flex flex-col justify-between">
    <EGBack />
    <div class="flex items-start justify-between">
      <div>
        <EGText tag="h1" class="mb-4">{{ labName }}</EGText>
        <EGText tag="p" class="text-muted">Lab summary, statistics and its users</EGText>
      </div>
      <EGButton label="Invite new user" />
    </div>
  </div>

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
    :default-index="1"
    :items="[
      {
        key: 'details',
        label: 'Details',
        disabled: true,
      },
      {
        key: 'users',
        label: 'Users',
      },
      {
        key: 'workflow',

        label: 'Workflow',
        disabled: true,
      },
    ]"
  >
    <template #item="{ item }">
      <div v-if="item.key === 'details'" class="space-y-3">Details TBD</div>
      <div v-else-if="item.key === 'users'" class="space-y-3">
        <EGEmptyDataCTA
          v-if="!useUiStore().isRequestPending && hasNoData"
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
            @action-triggered="handleRemoveLabUser"
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
              :loading="useUiStore().isRequestPending"
              class="LabsUsersTable rounded-2xl"
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
                        email: row.UserEmail,
                      })
                    "
                    :email="row.UserEmail"
                    :is-active="row.OrganizationUserStatus === 'Active'"
                  />
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
                    <div class="text-muted text-xs font-normal">{{ row.UserEmail }}</div>
                  </div>
                </div>
              </template>
              <template #assignedRole-data="{ row: user }">
                <span class="text-black">{{ user.assignedRole }}</span>
              </template>
              <template #actions-data="{ row: user }">
                <div class="flex items-center">
                  <EGUserRoleDropdown
                    :disabled="useUiStore().isRequestPending"
                    :user="user"
                    @assign-role="handleAssignRole"
                    @remove-user-from-lab="removeUserFromLab"
                  />
                </div>
              </template>
              <template #empty-state>
                <div class="text-muted flex h-12 items-center justify-center font-normal">No results found</div>
              </template>
            </UTable>
          </UCard>

          <div
            class="text-muted flex h-16 flex-wrap items-center justify-between"
            v-if="!searchOutput && !useUiStore().isRequestPending"
          >
            <div class="text-xs leading-5">{{ showingResultsMsg }}</div>
            <div class="flex justify-end px-3" v-if="pageTotal > pageCount">
              <UPagination v-model="page" :page-count="10" :total="labUsersDetailsData.length" />
            </div>
          </div>
        </template>
      </div>
      <div v-else-if="item.key === 'workflow'" class="space-y-3">Workflow TBD</div>
    </template>
  </UTabs>
</template>

<style>
  .LabsUsersTable {
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
