<script setup lang="ts">
  import { LaboratoryUserDetails } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-user-details';
  import { ButtonVariantEnum } from '~/types/buttons';
  import { DeletedResponse } from '~/types/api';
  import { useToastStore } from '~/stores/stores';

  const { $api } = useNuxtApp();
  const $router = useRouter();
  const $route = useRoute();
  const labName = $route.query.name;
  const hasNoData = ref(false);
  const isLoading = ref(true);
  const isRemovingUser = ref(false);
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

  async function handleRemoveUser() {
    isOpen.value = false;
    isRemovingUser.value = true;
    try {
      if (!selectedUserId.value) {
        throw new Error('No selectedUserId');
      }

      const res: DeletedResponse = await $api.labs.removeUser(laboratoryId, selectedUserId.value);

      if (res.deleted) {
        useToastStore().success('User removed from lab');
        await getLabUsers();
      } else {
        throw new Error('User not deleted');
      }
    } catch (error) {
      useToastStore().error('Failed to remove user from lab');
    } finally {
      selectedUserId.value = '';
      isRemovingUser.value = false;
    }
  }

  const columns = [
    {
      key: 'UserDisplayName',
      label: 'Name',
    },
    {
      key: 'assignedRole',
      label: 'Assigned Role',
    },
    {
      key: 'actions',
      label: '',
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
        label: 'Remove from lab',
        click: () => {
          selectedUserId.value = row.UserId;
          primaryMessage.value = `Are you sure you want to remove ${row.UserDisplayName} from ${labName}?`;
          isOpen.value = true;
        },
      },
    ],
  ];

  async function getLabUsers() {
    isLoading.value = true;
    try {
      labUsersDetailsData.value = await $api.labs.usersDetailsFromOrgId($route.params.id);

      if (labUsersDetailsData.value.length === 0) {
        hasNoData.value = true;
      }
    } catch (error) {
      console.error(error);
    } finally {
      isLoading.value = false;
    }
  }

  function updateSearchOutput(newVal: any) {
    searchOutput.value = newVal;
  }

  const filteredRows = computed(() => {
    if (!searchOutput.value && !hasNoData.value) {
      return labUsersDetailsData.value.map((person) => ({
        ...person,
        assignedRole: person.LabManager ? 'Lab Manager' : person.LabTechnician ? 'Lab Technician' : 'Unknown',
      }));
    }

    return labUsersDetailsData.value
      .filter((person) => {
        return String(person.UserDisplayName).toLowerCase().includes(searchOutput.value.toLowerCase());
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
          v-if="!isLoading && hasNoData"
          message="You don't have any users in this lab yet."
          img-src="/images/empty-state-user.jpg"
          :button-action="() => {}"
          button-label="Invite new users"
        />

        <template v-if="!hasNoData">
          <EGSearchInput @output="updateSearchOutput" placeholder="Search user" class="my-6 w-[408px]" />

          <EGDialog
            actionLabel="Remove User"
            :actionVariant="ButtonVariantEnum.enum.destructive"
            cancelLabel="Cancel"
            :cancelVariant="ButtonVariantEnum.enum.secondary"
            @action-triggered="handleRemoveUser"
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
              :loading="isLoading || isRemovingUser"
              class="LabsUsersTable rounded-2xl"
              :loading-state="{ icon: '', label: '' }"
              :rows="filteredRows"
              :columns="columns"
            >
              <template #UserDisplayName-data="{ row }">
                <div class="flex items-center">
                  <EGUserAvatar
                    class="mr-4"
                    :name="row.UserDisplayName"
                    :email="row.UserEmail"
                    :lab-manager="row.LabManager"
                    :lab-technician="row.LabTechnician"
                  />
                  <div class="flex flex-col">
                    <div v-if="row.UserDisplayName">{{ row.UserDisplayName }}</div>
                    <div class="text-muted text-xs font-normal">{{ row.UserEmail }}</div>
                  </div>
                </div>
              </template>
              <template #assignedRole-data="{ row }">
                <span class="text-black">{{ row.assignedRole }}</span>
              </template>
              <template #actions-data="{ row }">
                <div class="flex items-center">
                  <EGActionButton :items="actionItems(row)" />
                </div>
              </template>
              <div class="text-muted text-normal flex h-12 items-center justify-center">No results found</div>
            </UTable>
          </UCard>

          <div class="text-muted flex h-16 flex-wrap items-center justify-between" v-if="!searchOutput && !isLoading">
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
