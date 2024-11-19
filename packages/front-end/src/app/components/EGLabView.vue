<script setup lang="ts">
  import { LabUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user-unified';
  import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
  import {
    LaboratoryRolesEnum,
    LaboratoryRolesEnumSchema,
  } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/roles';
  import { ButtonVariantEnum } from '@FE/types/buttons';
  import { DeletedResponse, EditUserResponse } from '@FE/types/api';
  import { useWorkflowStore, useToastStore, useUiStore } from '@FE/stores';
  import useUser from '@FE/composables/useUser';
  import { LaboratoryUserDetails } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-user-details';
  import { LaboratoryUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-user';
  import { EGTabsStyles } from '@FE/styles/nuxtui/UTabs';
  import { getDate, getTime } from '@FE/utils/date-time';
  import EGModal from '@FE/components/EGModal';
  import { v4 as uuidv4 } from 'uuid';
  import { Workflow } from '@easy-genomics/shared-lib/src/app/types/nf-tower/nextflow-tower-api';

  const props = defineProps<{
    superuser?: boolean;
    labId: string;
    initialTab: string | undefined;
  }>();

  const { $api } = useNuxtApp();
  const $router = useRouter();
  const modal = useModal();

  const workflowStore = useWorkflowStore();
  const labStore = useLabsStore();
  const uiStore = useUiStore();

  const orgId = labStore.labs[props.labId].OrganizationId;

  const labUsers = ref<LabUser[]>([]);
  const canAddUsers = ref(false);
  const showAddUserModule = ref(false);
  const searchOutput = ref('');
  const pipelines = ref<[]>([]);

  // Dynamic remove user dialog values
  const isOpen = ref(false);
  const primaryMessage = ref('');
  const userToRemove = ref();

  let intervalId: number | undefined;

  const missingPAT = ref<boolean>(false);

  const tabIndex = ref(0);
  // set tabIndex according to query param
  onMounted(() => {
    const queryTabMatchIndex = tabItems.value.findIndex((tab) => tab.label === props.initialTab);
    tabIndex.value = queryTabMatchIndex !== -1 ? queryTabMatchIndex : 0;
  });

  /**
   * Fetch Lab details, pipelines, workflows and Lab users before component mount and start periodic fetching
   */
  onBeforeMount(loadLabData);

  onUnmounted(() => {
    if (intervalId) {
      clearTimeout(intervalId);
    }
  });
  async function pollFetchWorkflows() {
    await getWorkflows();
    intervalId = window.setTimeout(pollFetchWorkflows, 2 * 60 * 1000);
  }

  const lab = computed<Laboratory | null>(() => labStore.labs[props.labId] ?? null);
  const labName = computed<string>(() => lab.value?.Name || '');

  const workflows = computed<Workflow[]>(() => workflowStore.workflowsForLab(props.labId));

  const filteredTableData = computed(() => {
    let filteredLabUsers = labUsers.value;

    if (searchOutput.value.trim()) {
      filteredLabUsers = labUsers.value
        .filter((labUser: LabUser) => {
          const searchString = `${labUser.displayName} ${labUser.UserEmail}`.toLowerCase();
          return searchString.includes(searchOutput.value.toLowerCase());
        })
        .map((labUser) => labUser);
    }

    return filteredLabUsers.sort((userA, userB) => {
      // Lab Manager users first
      if (userA.LabManager && !userB.LabManager) return -1;
      if (!userA.LabManager && userB.LabManager) return 1;
      // then Lab Technicians
      if (userA.LabTechnician && !userB.LabTechnician) return -1;
      if (!userA.LabTechnician && userB.LabTechnician) return 1;
      // then sort by name
      return useSort().stringSortCompare(userA.displayName, userB.displayName);
    });
  });

  const usersTableColumns = [
    {
      key: 'displayName',
      label: 'Name',
      sortable: true,
      sort: useSort().stringSortCompare,
    },
    {
      key: 'actions',
      label: 'Lab Access',
    },
  ];

  const pipelinesTableColumns = [
    {
      key: 'Name',
      label: 'Name',
    },
    {
      key: 'description',
      label: 'Description',
    },
    {
      key: 'actions',
      label: 'Actions',
    },
  ];

  const workflowsTableColumns = [
    {
      key: 'runName',
      label: 'Run Name',
    },
    {
      key: 'lastUpdated',
      label: 'Last Updated',
    },
    {
      key: 'status',
      label: 'Status',
    },
    {
      key: 'owner',
      label: 'Owner',
    },
    {
      key: 'actions',
      label: 'Actions',
    },
  ];

  const tabItems = computed<{ key: string; label: string }[]>(() => {
    const items = [];

    if (!missingPAT.value) {
      if (!props.superuser) {
        items.push({ key: 'runs', label: 'Runs' });
        items.push({ key: 'pipelines', label: 'Pipelines' });
      }
      items.push({ key: 'users', label: 'Lab Users' });
    }

    items.push({ key: 'details', label: 'Details' });

    return items;
  });

  const pipelinesActionItems = (pipeline: any) => [
    [
      {
        label: 'Run',
        click: () => viewRunPipeline(pipeline),
      },
    ],
  ];

  function workflowsActionItems(row: Workflow): object[] {
    const buttons: object[][] = [
      [
        {
          label: 'View Details',
          click: () => viewRunDetails(row),
        },
      ],
      [
        {
          label: 'View Results',
          click: () => {
            $router.push({ path: `/labs/${props.labId}/${row.id}`, query: { tab: 'Run Results' } });
          },
        },
      ],
    ];

    if (['SUBMITTED', 'RUNNING'].includes(row.status || '')) {
      buttons.push([
        {
          label: 'Cancel Run',
          click: () => {
            runToCancel.value = row;
            isCancelDialogOpen.value = true;
          },
          isHighlighted: true,
        },
      ]);
    }

    return buttons;
  }

  watch(lab, async (lab) => {
    if (lab !== null) {
      if (lab.HasNextFlowTowerAccessToken) {
        // load pipelines/workflows/labUsers after lab loads
        if (props.superuser) {
          // superuser doesn't view pipelines or workflows so don't fetch those
          await getLabUsers();
        } else {
          await Promise.all([getPipelines(), pollFetchWorkflows(), getLabUsers()]);
          canAddUsers.value = useUserStore().canAddLabUsers(orgId, props.labId);
        }
      } else {
        // missing personal access token message
        missingPAT.value = true;
        showRedirectModal();
      }
    }
  });

  function showRedirectModal() {
    modal.open(EGModal, {
      title: `No Personal Access Token found`,
      message:
        "A Personal Access Token is required to run a pipeline. Please click 'Edit' in the next screen to set it.",
      confirmLabel: 'Okay',
      confirmAction() {
        tabIndex.value = 0;
        $router.push({ query: { ...$router.currentRoute.query, tab: tabItems.value[tabIndex.value].label } });
        modal.close();
      },
    });
  }

  function showRemoveUserDialog(user: LabUser) {
    userToRemove.value = user;
    primaryMessage.value = `Are you sure you want to remove ${user.displayName} from ${labName.value}?`;
    isOpen.value = true;
  }

  async function handleRemoveUserFromLab() {
    let maybeDisplayName = 'user';
    try {
      isOpen.value = false;
      useUiStore().setRequestPending('removeUserFromLab');
      const { displayName, UserId } = userToRemove.value;
      maybeDisplayName = displayName;

      const res: DeletedResponse = await $api.labs.removeUser(props.labId, UserId);

      if (res?.Status !== 'Success') {
        throw new Error(`Failed to remove ${displayName} from ${labName.value}`);
      }

      useToastStore().success(`Successfully removed ${displayName} from ${labName.value}`);
    } catch (error) {
      useToastStore().error(`Failed to remove ${maybeDisplayName} from ${labName.value}`);
    } finally {
      await getLabUsers();
      userToRemove.value = undefined;
      useUiStore().setRequestComplete('removeUserFromLab');
    }
  }

  async function handleAssignLabRole({ user, role }: { user: LabUser; role: LaboratoryRolesEnum }) {
    const { displayName, UserId } = user;
    const isLabManager = role === LaboratoryRolesEnumSchema.enum.LabManager;

    try {
      useUiStore().setRequestPending('assignLabRole');

      const res: EditUserResponse = await $api.labs.editUserLabAccess(props.labId, UserId, isLabManager);

      if (res?.Status !== 'Success') {
        throw new Error(`Failed to assign the ${role} role to ${displayName} in ${labName.value}`);
      }

      useToastStore().success(`Successfully assigned the ${role} role to ${displayName} in ${labName.value}`);
    } catch (error) {
      useToastStore().error(`Failed to assign the ${role} role to ${displayName} in ${labName.value}`);
    } finally {
      await getLabUsers();
      useUiStore().setRequestComplete('assignLabRole');
    }
  }

  function getAssignedLabRole(labUserDetails: LaboratoryUserDetails): LaboratoryRolesEnum {
    if (labUserDetails.LabManager) {
      return LaboratoryRolesEnumSchema.enum.LabManager;
    }
    return LaboratoryRolesEnumSchema.enum.LabTechnician;
  }

  function getLabUser(labUserDetails: LaboratoryUserDetails, labUsers: LaboratoryUser[]): LabUser {
    const labUser = labUsers.find((labUser) => labUser.UserId === labUserDetails.UserId);
    if (!labUser) {
      throw new Error(`Lab user not found for user ID: ${labUserDetails.UserId}`);
    }
    const assignedRole = getAssignedLabRole(labUserDetails);

    const displayName = useUser().displayName({
      preferredName: labUserDetails.PreferredName,
      firstName: labUserDetails.FirstName,
      lastName: labUserDetails.LastName,
      email: labUserDetails.UserEmail,
    });

    return {
      ...labUserDetails,
      status: labUser.Status,
      assignedRole,
      displayName,
    } as LabUser;
  }

  async function getLabUsers(): Promise<void> {
    useUiStore().setRequestPending('getLabUsers');
    try {
      const _labUsersDetails: LaboratoryUserDetails[] = await $api.labs.usersDetails(props.labId);
      const _labUsers: LaboratoryUser[] = await $api.labs.listLabUsersByLabId(props.labId);
      labUsers.value = _labUsersDetails.map((user) => getLabUser(user, _labUsers));
    } catch (error) {
      console.error('Error retrieving lab users', error);
      useToastStore().error('Failed to retrieve lab users');
    } finally {
      useUiStore().setRequestComplete('getLabUsers');
    }
  }

  async function loadLabData(): Promise<void> {
    useUiStore().setRequestPending('loadLabData');
    try {
      await labStore.loadLab(props.labId);
    } catch (error) {
      console.error('Error retrieving Lab data', error);
    } finally {
      useUiStore().setRequestComplete('loadLabData');
    }
  }

  async function getPipelines(): Promise<void> {
    useUiStore().setRequestPending('getPipelines');
    try {
      const res = await $api.pipelines.list(props.labId);
      pipelines.value = res.pipelines;
    } catch (error) {
      console.error('Error retrieving pipelines', error);
    } finally {
      useUiStore().setRequestComplete('getPipelines');
    }
  }

  async function getWorkflows(): Promise<void> {
    useUiStore().setRequestPending('getWorkflows');
    try {
      await workflowStore.loadWorkflowsForLab(props.labId);
    } catch (error) {
      console.error('Error retrieving workflows/runs', error);
    } finally {
      useUiStore().setRequestComplete('getWorkflows');
    }
  }

  function updateSearchOutput(newVal: any) {
    searchOutput.value = newVal;
  }

  async function handleUserAddedToLab() {
    showAddUserModule.value = false;
    await getLabUsers();
  }

  function onRunsRowClicked(row: Workflow) {
    viewRunDetails(row);
  }

  function onPipelinesRowClicked(row: Workflow) {
    viewRunPipeline(row);
  }

  function viewRunPipeline(pipeline: Workflow) {
    const workflowTempId = uuidv4();

    const { description: pipelineDescription, pipelineId, name: pipelineName } = toRaw(pipeline);

    workflowStore.updateWipWorkflow(workflowTempId, {
      pipelineId,
      pipelineName,
      pipelineDescription: pipelineDescription || '',
      transactionId: uuidv4(),
    });

    $router.push({
      path: `/labs/${props.labId}/${pipelineId}/run-pipeline`,
      query: {
        workflowTempId,
      },
    });
  }

  function viewRunDetails(row: Workflow) {
    $router.push({ path: `/labs/${props.labId}/${row.id}`, query: { tab: 'Run Details' } });
  }

  const isCancelDialogOpen = ref<boolean>(false);
  const runToCancel = ref<Workflow | null>(null);

  async function handleCancelDialogAction() {
    const runId = runToCancel.value?.id;
    const runName = runToCancel.value?.runName;

    if (!runId) {
      throw new Error("runToCancel workflow id should have a value but doesn't");
    }

    uiStore.setRequestPending('cancelWorkflow');

    try {
      await $api.workflows.cancelPipelineRun(props.labId, runId);
      useToastStore().success(`${runName} has been successfully cancelled`);
    } catch (e) {
      useToastStore().error('Failed to cancel run');
    }

    isCancelDialogOpen.value = false;
    runToCancel.value = null;
    uiStore.setRequestComplete('cancelWorkflow');

    await getWorkflows();
  }
</script>

<template>
  <EGPageHeader
    :title="labName"
    description="View your Lab users, details and pipelines"
    :back-action="() => (superuser ? $router.push(`/orgs/${orgId}`) : $router.push('/labs'))"
    :show-back="true"
  >
    <EGButton
      label="Add Lab Users"
      v-if="!superuser"
      :disabled="!canAddUsers"
      @click="showAddUserModule = !showAddUserModule"
    />
    <EGAddLabUsersModule
      v-if="showAddUserModule"
      @added-user-to-lab="handleUserAddedToLab()"
      :org-id="orgId"
      :lab-id="labId"
      :lab-name="labName"
      :lab-users="labUsers"
      class="mt-2"
    />
  </EGPageHeader>

  <UTabs
    v-if="lab"
    :ui="EGTabsStyles"
    :default-index="0"
    :items="tabItems"
    :model-value="tabIndex"
    @update:model-value="
      (newIndex) => {
        $router.push({ query: { ...$router.currentRoute.query, tab: tabItems[newIndex].label } });
        tabIndex = newIndex;
      }
    "
  >
    <!-- Pipelines tab -->
    <template #item="{ item }">
      <div v-if="item.key === 'pipelines'" class="space-y-3">
        <EGTable
          :row-click-action="onPipelinesRowClicked"
          :table-data="pipelines"
          :columns="pipelinesTableColumns"
          :is-loading="useUiStore().anyRequestPending(['loadLabData', 'getPipelines'])"
          :show-pagination="!useUiStore().anyRequestPending(['loadLabData', 'getPipelines'])"
        >
          <template #Name-data="{ row: pipeline }">
            <div class="flex items-center">
              {{ pipeline?.name }}
            </div>
          </template>

          <template #description-data="{ row: pipeline }">
            {{ pipeline?.description }}
          </template>

          <template #actions-data="{ row }">
            <div class="flex justify-end">
              <EGActionButton :items="pipelinesActionItems(row)" class="ml-2" @click="$event.stopPropagation()" />
            </div>
          </template>

          <template #empty-state>
            <div class="text-muted flex h-24 items-center justify-center font-normal">
              There are no Pipelines assigned to this Lab
            </div>
          </template>
        </EGTable>
      </div>
      <!-- Runs tab -->
      <div v-else-if="item.key === 'runs'" class="space-y-3">
        <EGTable
          :row-click-action="onRunsRowClicked"
          :table-data="workflows"
          :columns="workflowsTableColumns"
          :is-loading="useUiStore().anyRequestPending(['loadLabData', 'getWorkflows'])"
          :show-pagination="!useUiStore().anyRequestPending(['loadLabData', 'getWorkflows'])"
        >
          <template #runName-data="{ row: workflow }">
            <div class="text-body text-sm font-medium">{{ workflow.runName }}</div>
            <div class="text-muted text-xs font-normal">{{ workflow.projectName }}</div>
          </template>

          <template #lastUpdated-data="{ row: workflow }">
            <div class="text-body text-sm font-medium">{{ getDate(workflow.lastUpdated) }}</div>
            <div class="text-muted">{{ getTime(workflow.lastUpdated) }}</div>
          </template>

          <template #status-data="{ row: workflow }">
            <EGStatusChip :status="workflow.status" />
          </template>

          <template #owner-data="{ row: workflow }">
            <div class="text-body text-sm font-medium">{{ workflow?.userName ?? '-' }}</div>
          </template>

          <template #actions-data="{ row }">
            <div class="flex justify-end">
              <EGActionButton :items="workflowsActionItems(row)" class="ml-2" @click="$event.stopPropagation()" />
            </div>
          </template>

          <template #empty-state>
            <div class="text-muted flex h-24 items-center justify-center font-normal">
              There are no Runs in your Lab
            </div>
          </template>
        </EGTable>
      </div>
      <!-- Lab Users tab -->
      <div v-else-if="item.key === 'users'" class="space-y-3">
        <EGSearchInput
          @input-event="updateSearchOutput"
          placeholder="Search user"
          :disabled="useUiStore().anyRequestPending(['loadLabData', 'getLabUsers', 'addUserToLab'])"
          class="my-6 w-[408px]"
        />

        <EGDialog
          actionLabel="Remove User"
          :actionVariant="ButtonVariantEnum.enum.destructive"
          cancelLabel="Cancel"
          :cancelVariant="ButtonVariantEnum.enum.secondary"
          @action-triggered="handleRemoveUserFromLab"
          :primaryMessage="primaryMessage"
          v-model="isOpen"
        />

        <EGTable
          :table-data="filteredTableData"
          :columns="usersTableColumns"
          :is-loading="useUiStore().anyRequestPending(['loadLabData', 'getLabUsers', 'assignLabRole'])"
          :show-pagination="!useUiStore().anyRequestPending(['loadLabData', 'getLabUsers', 'assignLabRole'])"
        >
          <template #Name-data="{ row: labUser }">
            <div class="flex items-center">
              <EGUserDisplay
                :display-name="labUser?.displayName"
                :email="labUser?.UserEmail"
                :status="labUser?.status"
                :showAvatar="true"
              />
            </div>
          </template>

          <template #assignedRole-data="{ row: labUser }">
            <span class="text-black">{{ labUser?.assignedRole }}</span>
          </template>

          <template #actions-data="{ row: labUser }">
            <div class="flex items-center">
              <EGUserRoleDropdownNew
                :show-remove-from-lab="true"
                :key="labUser?.LabManager"
                :disabled="
                  useUiStore().anyRequestPending(['loadLabData', 'getLabUsers']) ||
                  !useUserStore().canEditLab(labId) ||
                  useUserStore().isSuperuser
                "
                :user="labUser"
                @assign-lab-role="handleAssignLabRole($event)"
                @remove-user-from-lab="showRemoveUserDialog($event.user)"
              />
            </div>
          </template>

          <template #empty-state>
            <div class="text-muted flex h-24 items-center justify-center font-normal">
              There are no users in your Lab
            </div>
          </template>
        </EGTable>
      </div>
      <div v-else-if="item.key === 'details'" class="space-y-3">
        <EGLabDetailsForm @updated="loadLabData" />
      </div>
    </template>
  </UTabs>

  <EGDialog
    action-label="Cancel Run"
    :action-variant="ButtonVariantEnum.enum.destructive"
    @action-triggered="handleCancelDialogAction"
    :primary-message="`Are you sure you would like to cancel ${runToCancel?.runName}?`"
    secondary-message="This will stop any progress made."
    v-model="isCancelDialogOpen"
    :buttons-disabled="uiStore.isRequestPending('cancelWorkflow')"
  />
</template>
