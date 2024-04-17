<script setup lang="ts">
  import { LaboratoryUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-user';
  import { User } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user';

  const { $api } = useNuxtApp();
  const isLoading = ref(true);
  const allUsers = ref(Array<User>);
  const labUsers = ref(Array<LaboratoryUser>);
  const page = ref(1);
  const pageCount = ref(10);
  const $router = useRouter();
  const $route = useRoute();
  const labName = $route.query.labName;

  const columns = [
    {
      key: 'fullName',
      label: 'Name',
      sortable: true,
    },
    {
      key: 'assignedRoles',
      label: 'Assigned Roles',
    },
    {
      key: 'actions',
      label: '',
    },
  ];

  const sortedData = computed(() => {
    return labUsersMeta.value
      .slice((page.value - 1) * pageCount.value, page.value * pageCount.value)
      .sort((a, b) => a.Name.localeCompare(b.Name));
  });

  const actionItems = (row: Array<{}>) => [
    [
      {
        label: 'Reassign roles',
        click: () => {},
      },
    ],
    [
      {
        label: 'Remove',
        click: () => {},
      },
    ],
  ];

  const labUsersMeta = computed(() => {
    return labUsers.value.map((user) => {
      const userMeta = allUsers.value.find((u) => u.UserId === user.UserId);
      userMeta.fullName = `${userMeta.FirstName} ${userMeta.LastName}`;
      userMeta.assignedRoles = `${userMeta.FirstName} ${userMeta.LastName}`;

      return {
        ...user,
        ...userMeta,
      };
    });
  });

  const pageTotal = computed(() => labUsersMeta.value.length);
  const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1);
  const pageTo = computed(() => Math.min(page.value * pageCount.value, pageTotal.value));
  const { showingResultsMsg } = useTable(pageFrom, pageTo, pageTotal);

  try {
    allUsers.value = await $api.users.list();
    labUsers.value = await $api.labs.users($route.params.id);
    isLoading.value = false;
  } catch (error) {
    console.error(error);
    isLoading.value = false;
    throw error;
  }

  const q = ref('');
  const filteredRows = computed(() => {
    if (!q.value) {
      return people;
    }

    return people.filter((person) => {
      return Object.values(person).some((value) => {
        return String(value).toLowerCase().includes(q.value.toLowerCase());
      });
    });
  });
</script>

<template>
  <div class="mb-11 flex flex-col justify-between">
    <a
      @click="$router.go(-1)"
      class="text-primary mb-4 flex items-center gap-1 whitespace-nowrap text-base font-medium"
    >
      <i class="i-heroicons-arrow-left-solid"></i>
      <span>Back</span>
    </a>
    <EGText tag="h1" class="mb-4">{{ labName }}</EGText>
    <EGText tag="p" class="text-muted">Lab summary, statistics and its users</EGText>
  </div>

  <UTabs
    :ui="{
      wrapper: 'relative space-y-2',
      container: 'relative w-full',
      base: 'focus:outline-none',
      list: {
        base: 'relative border-2 border-bottom border-primary rounded-md',
        background: '',
        rounded: 'rounded-lg',
        shadow: '',
        padding: 'p-1',
        height: 'h-10',
        width: 'w-full',
        marker: {
          wrapper: ' absolute top-[4px] left-[4px] duration-200 ease-out focus:outline-none',
          base: 'w-full h-full',
          background: 'bg-white dark:bg-gray-900',
          rounded: 'rounded-md',
          shadow: 'shadow-sm',
        },
        tab: {
          base: 'font-heading relative inline-flex items-center justify-center flex-shrink-0 w-full ui-focus-visible:outline-0 ui-focus-visible:ring-2 ui-focus-visible:ring-primary-500 dark:ui-focus-visible:ring-primary-400 ui-not-focus-visible:outline-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-75 transition-colors duration-200 ease-out',
          background: '',
          active: 'text-primary bg-none',
          inactive: 'text-heading',
          height: 'h-8',
          padding: 'px-3',
          size: 'text-sm',
          font: 'font-medium',
          rounded: 'rounded-md',
          shadow: '',
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
        <template v-if="!isLoading">
          <EGSearchInput />

          <UCard
            class="rounded-2xl border-none shadow-none"
            :ui="{
              body: 'p-0',
            }"
          >
            <UTable class="LabsTable rounded-2xl" :rows="sortedData" :columns="columns">
              <template #actions-data="{ row }">
                <EGActionButton :items="actionItems(row)" />
              </template>
              <template #empty-state>&nbsp;</template>
            </UTable>
          </UCard>

          <div class="text-muted flex h-16 flex-wrap items-center justify-between">
            <div class="text-xs leading-5">{{ showingResultsMsg }}</div>
            <div class="flex justify-end px-3" v-if="pageTotal > pageCount">
              <UPagination v-model="page" :page-count="10" :total="labUsersMeta.length" />
            </div>
          </div>
        </template>
      </div>
      <div v-else-if="item.key === 'workflow'" class="space-y-3">Workflow TBD</div>
    </template>
  </UTabs>
</template>

<style>
  .LabsTable {
    font-size: 14px;
    width: 100%;
    table-layout: auto;

    thead {
      border-bottom: 1px solid #e5e5e5;

      button {
        color: black;
      }

      tr {
        height: 50px;
        background-color: #efefef;

        th:first-child {
          padding-left: 40px;
        }
      }
    }

    tbody tr td:nth-child(1) {
      color: black;
      font-weight: 600;
      padding-left: 40px;
    }

    tbody tr td:nth-child(2) {
      min-width: 500px;
      font-size: 12px;
      color: #818181;
    }

    tbody tr td:last-child {
      width: 50px;
      padding-right: 40px;
    }
  }
</style>
