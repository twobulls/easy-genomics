<script setup lang="ts">
  import { LaboratoryUserDetails } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-user-details';
  import { UTabsStyles } from '~/styles/nuxtui/UTabs';

  const { $api } = useNuxtApp();
  const $router = useRouter();
  const $route = useRoute();
  const labName = $route.query.labName;
  const hasNoData = ref(false);
  const isLoading = ref(true);
  const labUsersDetailsData = ref<LaboratoryUserDetails[]>([]);
  const page = ref(1);
  const pageCount = ref(10);
  const searchOutput = ref('');
  const pageTotal = computed(() => labUsersDetailsData.value.length);
  const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1);
  const pageTo = computed(() => Math.min(page.value * pageCount.value, pageTotal.value));
  const { showingResultsMsg } = useTable(pageFrom, pageTo, pageTotal);

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

  const actionItems = (row: Array<{}>) => [
    [
      {
        label: 'Edit lab access',
        click: () => {},
      },
    ],
    [
      {
        label: 'Remove from lab',
        click: () => {},
      },
    ],
  ];

  onBeforeMount(async () => {
    try {
      labUsersDetailsData.value = await $api.labs.usersDetails($route.params.id);

      if (!labUsersDetailsData.value.length) {
        hasNoData.value = true;
      }
      isLoading.value = false;
    } catch (error) {
      isLoading.value = false;
      console.error(error);
      throw error;
    }
  });

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
</script>

<template>
  <div class="mb-11 flex flex-col justify-between">
    <a
      @click="$router.go(-1)"
      class="text-primary mb-4 flex cursor-pointer items-center gap-1 whitespace-nowrap text-base font-medium"
    >
      <i class="i-heroicons-arrow-left-solid"></i>
      <span>Back</span>
    </a>
    <div class="flex items-start justify-between">
      <div>
        <EGText tag="h1" class="mb-4">{{ labName }}</EGText>
        <EGText tag="p" class="text-muted">Lab summary, statistics and its users</EGText>
      </div>
      <EGButton label="Invite new user" class="self-start" />
    </div>
  </div>

  <UTabs
    :ui="UTabsStyles"
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

        <template v-else-if="!isLoading">
          <EGSearchInput @output="updateSearchOutput" placeholder="Search user" class="my-6 w-[408px]" />

          <UCard
            class="rounded-2xl border-none shadow-none"
            :ui="{
              body: 'p-0',
            }"
          >
            <UTable
              :loading="isLoading"
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
              <template #empty-state>&nbsp;</template>
            </UTable>
          </UCard>

          <div class="text-muted flex h-16 flex-wrap items-center justify-between" v-if="!searchOutput">
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
