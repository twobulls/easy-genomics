<script setup lang="ts">
  import { LabUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user-unified';
  import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
  import {
    LaboratoryRolesEnum,
    LaboratoryRolesEnumSchema,
  } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/roles';
  import { ButtonVariantEnum } from '@FE/types/buttons';
  import { DeletedResponse, EditUserResponse } from '@FE/types/api';
  import { useOrgsStore, usePipelineRunStore, useToastStore, useUiStore } from '@FE/stores';
  import useUser from '@FE/composables/useUser';
  import { LaboratoryUserDetails } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-user-details';
  import { LaboratoryUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-user';
  import { EGTabsStyles } from '@FE/styles/nuxtui/UTabs';
  import { getDate, getTime } from '@FE/utils/date-time';
  import EGModal from '@FE/components/EGModal';
  import { v4 as uuidv4 } from 'uuid';
  import { DescribeWorkflowResponse } from '@easy-genomics/shared-lib/lib/app/types/nf-tower/nextflow-tower-api';
  import { Workflow } from '@easy-genomics/shared-lib/src/app/types/nf-tower/nextflow-tower-api';

  const $route = useRoute();

  const pipelineRunStore = usePipelineRunStore();

  const { $api } = useNuxtApp();
  const $router = useRouter();
  const orgId = useOrgsStore().selectedOrg?.OrganizationId;
  const modal = useModal();

  const tabIndex = ref(0);
  const defaultTabIndex = 0;

  const labId = $route.params.labId as string;
  // on page load, load the cached version from the labs store, for immediate population of the lab name etc
  // for page function, we also need HasNextFlowTowerAccessToken which only comes from the individual loadLabData endpoint
  // so we also load up to date data from that endpoint and overwrite the lab variable when it's ready
  const lab = ref<Laboratory | null>(useLabsStore().labs[labId] || null);

  const labName = computed<string>(() => lab.value?.Name || '');

  const labUsers = ref<LabUser[]>([]);
  const canAddUsers = ref(false);
  const showAddUserModule = ref(false);
  const searchOutput = ref('');
  const pipelines = ref<[]>([]);
  const workflows = computed<Workflow[]>(() => pipelineRunStore.getPipelineRunsForLab(labId));

  // Dynamic remove user dialog values
  const isOpen = ref(false);
  const primaryMessage = ref('');
  const userToRemove = ref();

  // check permissions to be on this page
  if (!useUserStore().canViewLab(useUserStore().currentOrgId, labId)) {
    $router.push('/labs');
  }

  const missingPAT = ref<boolean>(false);

  const tabItems = computed(() => [
    ...(!missingPAT.value
      ? [
          { key: 'runs', label: 'Runs' },
          { key: 'pipelines', label: 'Pipelines' },
          { key: 'users', label: 'Lab Users' },
        ]
      : []),
    {
      key: 'details',
      label: 'Details',
    },
  ]);

  /**
   * Fetch Lab details, pipelines, workflows and Lab users before component mount
   */
  onBeforeMount(async () => {
    useUiStore().setRequestPending(true);
    await loadLabData();
    useUiStore().setRequestPending(false);
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
    primaryMessage.value = `Are you sure you want to remove ${user.displayName} from ${labName}?`;
    isOpen.value = true;
  }

  async function handleRemoveUserFromLab() {
    let maybeDisplayName = 'user';
    try {
      isOpen.value = false;
      useUiStore().setRequestPending(true);
      const { displayName, UserId } = userToRemove.value;
      maybeDisplayName = displayName;

      const res: DeletedResponse = await $api.labs.removeUser(labId, UserId);

      if (res?.Status !== 'Success') {
        throw new Error(`Failed to remove ${displayName} from ${labName}`);
      }

      useToastStore().success(`Successfully removed ${displayName} from ${labName}`);
    } catch (error) {
      useToastStore().error(`Failed to remove ${maybeDisplayName} from ${labName}`);
    } finally {
      await refreshLabUsers();
      userToRemove.value = undefined;
      useUiStore().setRequestPending(false);
    }
  }

  async function handleAssignLabRole({ user, role }: { user: LabUser; role: LaboratoryRolesEnum }) {
    const { displayName, UserId } = user;
    const isLabManager = role === LaboratoryRolesEnumSchema.enum.LabManager;

    try {
      useUiStore().setRequestPending(true);

      const res: EditUserResponse = await $api.labs.editUserLabAccess(labId, UserId, isLabManager);

      if (res?.Status !== 'Success') {
        throw new Error(`Failed to assign the ${role} role to ${displayName} in ${labName}`);
      }

      useToastStore().success(`Successfully assigned the ${role} role to ${displayName} in ${labName}`);
    } catch (error) {
      useToastStore().error(`Failed to assign the ${role} role to ${displayName} in ${labName}`);
    } finally {
      await refreshLabUsers();
      useUiStore().setRequestPending(false);
    }
  }

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
            $router.push({ path: `/labs/${labId}/${row.id}`, query: { tab: 'Run Results' } });
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
    try {
      const _labUsersDetails: LaboratoryUserDetails[] = await $api.labs.usersDetails(labId);
      const _labUsers: LaboratoryUser[] = await $api.labs.listLabUsersByLabId(labId);
      labUsers.value = _labUsersDetails.map((user) => getLabUser(user, _labUsers));
    } catch (error) {
      console.error('Error retrieving lab users', error);
      useToastStore().error('Failed to retrieve lab users');
    }
  }

  async function loadLabData(): Promise<void> {
    try {
      lab.value = await $api.labs.labDetails(labId);

      missingPAT.value = !lab.value.HasNextFlowTowerAccessToken;

      if (missingPAT.value) {
        showRedirectModal();
      } else {
        await Promise.all([getPipelines(), getWorkflows(), getLabUsers()]);
        canAddUsers.value = true;
      }
    } catch (error) {
      console.error('Error retrieving Lab data', error);
    }
  }

  async function getPipelines(): Promise<void> {
    try {
      const res = await $api.pipelines.list(labId);
      pipelines.value = res.pipelines;
    } catch (error) {
      console.error('Error retrieving pipelines', error);
    }
  }

  async function getWorkflows(): Promise<void> {
    try {
      await pipelineRunStore.loadPipelineRunsForLab(labId);
    } catch (error) {
      console.error('Error retrieving workflows/runs', error);
    }
  }

  // update UI with latest list of lab users and their assigned role
  async function refreshLabUsers() {
    useUiStore().setRequestPending(true);
    await getLabUsers();
    useUiStore().setRequestPending(false);
  }

  // update UI with latest list of workflow runs
  async function refreshWorkflows() {
    useUiStore().setRequestPending(true);
    await getWorkflows();
    useUiStore().setRequestPending(false);
  }

  function updateSearchOutput(newVal: any) {
    searchOutput.value = newVal;
  }

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

  async function handleUserAddedToLab() {
    showAddUserModule.value = false;
    await refreshLabUsers();
  }

  function onRunsRowClicked(row: Workflow) {
    viewRunDetails(row);
  }

  function onPipelinesRowClicked(row: Workflow) {
    viewRunPipeline(row);
  }

  function viewRunPipeline(pipeline: Workflow) {
    pipelineRunStore.reset();
    const { description: pipelineDescription, pipelineId, name: pipelineName } = toRaw(pipeline);
    pipelineRunStore.setLabId(labId);
    pipelineRunStore.setLabName(labName);
    pipelineRunStore.setPipelineId(pipelineId);
    pipelineRunStore.setPipelineName(pipelineName);
    pipelineRunStore.setPipelineDescription(pipelineDescription || '');
    pipelineRunStore.setTransactionId(uuidv4());
    $router.push({
      path: `/labs/${labId}/${pipelineId}/run-pipeline`,
    });
  }

  function viewRunDetails(row: Workflow) {
    $router.push({ path: `/labs/${labId}/${row.id}`, query: { tab: 'Run Details' } });
  }

  // watch route change to correspondingly change selected tab
  watch(
    () => $router.currentRoute.value.query.tab,
    (newVal) => {
      tabIndex.value = newVal ? tabItems.value.findIndex((tab) => tab.label === newVal) : 0;
    },
  );

  const isCancelDialogOpen = ref<boolean>(false);
  const runToCancel = ref<Workflow | null>(null);

  async function handleCancelDialogAction() {
    const runId = runToCancel.value?.id;
    const runName = runToCancel.value?.runName;

    if (!runId) {
      throw new Error("runToCancel workflow id should have a value but doesn't");
    }

    try {
      await $api.workflows.cancelPipelineRun(labId, runId);
      useToastStore().success(`${runName} has been successfully cancelled`);
    } catch (e) {
      useToastStore().error('Failed to cancel run');
    }

    isCancelDialogOpen.value = false;
    runToCancel.value = null;

    await refreshWorkflows();
  }
</script>

<template>
  <EGPageHeader
    :title="labName"
    description="View your Lab users, details and pipelines"
    :back-action="() => $router.push('/labs')"
  >
    <EGButton label="Add Lab Users" :disabled="!canAddUsers" @click="showAddUserModule = !showAddUserModule" />
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
    :default-index="defaultTabIndex"
    :items="tabItems"
    :model-value="tabIndex"
    @update:model-value="
      (newIndex) => {
        $router.push({ query: { ...$router.currentRoute.query, tab: tabItems[newIndex].label } });
        tabIndex = newIndex;
      }
    "
  >
    <template #item="{ item }">
      <div v-if="item.key === 'pipelines'" class="space-y-3">
        <EGTable
          :row-click-action="onPipelinesRowClicked"
          :table-data="pipelines"
          :columns="pipelinesTableColumns"
          :is-loading="useUiStore().isRequestPending"
          :show-pagination="!useUiStore().isRequestPending"
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
      <div v-else-if="item.key === 'runs'" class="space-y-3">
        <EGTable
          :row-click-action="onRunsRowClicked"
          :table-data="workflows"
          :columns="workflowsTableColumns"
          :is-loading="useUiStore().isRequestPending"
          :show-pagination="!useUiStore().isRequestPending"
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
      <div v-else-if="item.key === 'users'" class="space-y-3">
        <EGSearchInput
          @input-event="updateSearchOutput"
          placeholder="Search user"
          :disabled="useUiStore().isRequestPending"
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
          :is-loading="useUiStore().isRequestPending"
          :show-pagination="!useUiStore().isRequestPending"
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
                  useUiStore().isRequestPending || !useUserStore().canEditLab(useUserStore().currentOrgId, labId)
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
        <EGLabDetailsForm />
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
  />
</template>
