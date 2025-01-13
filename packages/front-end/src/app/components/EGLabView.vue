<script setup lang="ts">
  import { LabUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user-unified';
  import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
  import {
    LaboratoryRolesEnum,
    LaboratoryRolesEnumSchema,
  } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/roles';
  import { ButtonVariantEnum } from '@FE/types/buttons';
  import { DeletedResponse, EditUserResponse } from '@FE/types/api';
  import { useRunStore, useSeqeraPipelinesStore, useToastStore, useUiStore } from '@FE/stores';
  import useUser from '@FE/composables/useUser';
  import { LaboratoryUserDetails } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-user-details';
  import { LaboratoryUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-user';
  // import { getDate, getTime } from '@FE/utils/date-time';
  import EGModal from '@FE/components/EGModal';
  import { v4 as uuidv4 } from 'uuid';
  import { Pipeline as SeqeraPipeline } from '@easy-genomics/shared-lib/src/app/types/nf-tower/nextflow-tower-api';
  import { WorkflowListItem as OmicsWorkflow } from '@aws-sdk/client-omics';
  import { LaboratoryRun } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-run';

  const props = defineProps<{
    superuser?: boolean;
    labId: string;
    initialTab: string | undefined;
  }>();

  const { $api } = useNuxtApp();
  const $router = useRouter();
  const modal = useModal();

  const runStore = useRunStore();
  const labStore = useLabsStore();
  const uiStore = useUiStore();
  const userStore = useUserStore();
  const seqeraPipelinesStore = useSeqeraPipelinesStore();
  const labRunsStore = useLabRunsStore();

  const orgId = labStore.labs[props.labId].OrganizationId;
  const labUsers = ref<LabUser[]>([]);
  const seqeraPipelines = computed<SeqeraPipeline[]>(() => seqeraPipelinesStore.pipelinesForLab(props.labId));
  const omicsWorkflows = ref<OmicsWorkflow[]>([]);
  const canAddUsers = computed<boolean>(() => userStore.canAddLabUsers(props.labId));
  const showAddUserModule = ref(false);
  const searchOutput = ref('');
  const runToCancel = ref<LaboratoryRun | null>(null);
  const isCancelSeqeraDialogOpen = ref<boolean>(false);
  const isCancelOmicsDialogOpen = ref<boolean>(false);
  const isOpen = ref(false);
  const primaryMessage = ref('');
  const userToRemove = ref();
  const missingPAT = ref<boolean>(false);
  const tabIndex = ref(0);
  let intervalId: number | undefined;

  const lab = computed<Laboratory | null>(() => labStore.labs[props.labId] ?? null);
  const labName = computed<string>(() => lab.value?.Name || '');

  const combinedRuns = computed<LaboratoryRun[]>(() => labRunsStore.labRunsForLab(props.labId));

  const filteredTableData = computed(() => {
    let filteredLabUsers = labUsers.value;

    if (searchOutput.value.trim()) {
      filteredLabUsers = labUsers.value.filter((labUser: LabUser) => {
        const searchString = `${labUser.displayName} ${labUser.UserEmail}`.toLowerCase();
        return searchString.includes(searchOutput.value.toLowerCase());
      });
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
    { key: 'displayName', label: 'Name', sortable: true, sort: useSort().stringSortCompare },
    { key: 'actions', label: 'Lab Access' },
  ];

  const seqeraPipelinesTableColumns = [
    { key: 'Name', label: 'Name' },
    { key: 'description', label: 'Description' },
    { key: 'actions', label: 'Actions' },
  ];

  const omicsWorkflowsTableColumns = [
    { key: 'Name', label: 'Name' },
    { key: 'description', label: 'Description' },
    { key: 'actions', label: 'Actions' },
  ];

  const runsTableColumns = [
    { key: 'runName', label: 'Run Name' },
    { key: 'lastUpdated', label: 'Last Updated' },
    { key: 'status', label: 'Status' },
    { key: 'owner', label: 'Owner' },
    { key: 'actions', label: 'Actions' },
  ];

  const tabItems = computed<{ key: string; label: string }[]>(() => {
    const seqeraPipelinesTab = { key: 'seqeraPipelines', label: 'Seqera Pipelines' };
    const omicsWorkflowsTab = { key: 'omicsWorkflows', label: 'HealthOmics Workflows' };
    const runsTab = { key: 'runs', label: 'Lab Runs' };
    const usersTab = { key: 'users', label: 'Lab Users' };
    const detailsTab = { key: 'details', label: 'Details' };

    const seqeraAvailable = lab.value?.NextFlowTowerEnabled && !missingPAT.value;
    const omicsAvailable = lab.value?.AwsHealthOmicsEnabled;

    const items = [];

    if (!props.superuser) {
      if (seqeraAvailable) items.push(seqeraPipelinesTab);
      if (omicsAvailable) items.push(omicsWorkflowsTab);
      if (seqeraAvailable || omicsAvailable) items.push(runsTab);
    }
    items.push(usersTab);
    items.push(detailsTab);

    return items;
  });

  const seqeraPipelinesActionItems = (pipeline: any) => [
    [{ label: 'Run', click: () => viewRunSeqeraPipeline(pipeline) }],
  ];

  const omicsWorkflowsActionItems = (workflow: any) => [
    [{ label: 'Run', click: () => viewRunOmicsWorkflow(workflow) }],
  ];

  function viewRunDetails(run: LaboratoryRun) {
    $router.push({
      path: `/labs/${props.labId}/run/${run.RunId}`,
      query: { tab: 'Run Details' },
    });
  }

  function viewRunResults(run: LaboratoryRun) {
    $router.push({
      path: `/labs/${props.labId}/run/${run.RunId}`,
      query: { tab: 'Run Results' },
    });
  }

  function initCancelRun(run: LaboratoryRun) {
    runToCancel.value = run;

    if (run.Type === 'Seqera Cloud') {
      isCancelSeqeraDialogOpen.value = true;
    } else {
      isCancelOmicsDialogOpen.value = true;
    }
  }

  function runsActionItems(run: LaboratoryRun): object[] {
    const buttons: object[][] = [
      [{ label: 'View Details', click: () => viewRunDetails(run) }],
      [{ label: 'View Results', click: () => viewRunResults(run) }],
    ];

    if (['SUBMITTED', 'RUNNING'].includes(run.Status)) {
      buttons.push([{ label: 'Cancel Run', click: () => initCancelRun(run), isHighlighted: true }]);
    }

    return buttons;
  }

  /**
   * Fetch Lab details, pipelines, workflows, runs, and Lab users before component mount and start periodic fetching
   */
  onBeforeMount(async () => {
    await loadLabData();
    await fetchLaboratoryRuns();
  });

  function setTabIndex() {
    const tabMatchIndex = tabItems.value.findIndex((tab) => tab.label === props.initialTab);
    tabIndex.value = tabMatchIndex !== -1 ? tabMatchIndex : 0;
  }

  onMounted(() => {
    // set tabIndex according to initialTab prop
    setTabIndex();

    if (intervalId) {
      clearTimeout(intervalId);
    }
  });

  onBeforeRouteLeave(() => {
    if (intervalId) {
      clearTimeout(intervalId);
    }
  });

  async function pollFetchSeqeraRuns() {
    await getSeqeraRuns();
    intervalId = window.setTimeout(pollFetchSeqeraRuns, 2 * 60 * 1000);
  }

  async function pollFetchOmicsRuns() {
    await getOmicsRuns();
    intervalId = window.setTimeout(pollFetchOmicsRuns, 2 * 60 * 1000);
  }

  function showRedirectModal() {
    modal.open(EGModal, {
      title: `No Personal Access Token found`,
      message:
        "A Personal Access Token is required to run a pipeline. Please click 'Edit' in the next screen to set it.",
      confirmLabel: 'Okay',
      confirmAction() {
        tabIndex.value = tabItems.value.findIndex((tab) => tab.key === 'details');
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
      preferredName: labUserDetails.PreferredName ?? null,
      firstName: labUserDetails.FirstName ?? null,
      lastName: labUserDetails.LastName ?? null,
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

  // this anticipates these store values being needed on run click
  async function fetchLaboratoryRuns(): Promise<void> {
    uiStore.setRequestPending('loadLabRuns');
    try {
      await labRunsStore.loadLabRunsForLab(props.labId);
    } finally {
      uiStore.setRequestComplete('loadLabRuns');
    }
  }

  async function getSeqeraPipelines(): Promise<void> {
    useUiStore().setRequestPending('getSeqeraPipelines');
    try {
      await seqeraPipelinesStore.loadPipelinesForLab(props.labId);
    } catch (error) {
      console.error('Error retrieving pipelines', error);
    } finally {
      useUiStore().setRequestComplete('getSeqeraPipelines');
    }
  }

  async function getOmicsWorkflows(): Promise<void> {
    useUiStore().setRequestPending('getOmicsWorkflows');
    try {
      const res = await $api.omicsWorkflows.list(props.labId);

      if (res.items === undefined) {
        throw new Error('response did not contain omics workflows');
      }

      omicsWorkflows.value = res.items;
    } catch (error) {
      console.error('Error retrieving pipelines', error);
    } finally {
      useUiStore().setRequestComplete('getOmicsWorkflows');
    }
  }

  async function getSeqeraRuns(): Promise<void> {
    useUiStore().setRequestPending('getSeqeraRuns');
    try {
      await runStore.loadSeqeraRunsForLab(props.labId);
    } catch (error) {
      console.error('Error retrieving Seqera runs', error);
    } finally {
      useUiStore().setRequestComplete('getSeqeraRuns');
    }
  }

  async function getOmicsRuns(): Promise<void> {
    useUiStore().setRequestPending('getOmicsRuns');
    try {
      await runStore.loadOmicsRunsForLab(props.labId);
    } catch (error) {
      console.error('Error retrieving Omics runs', error);
    } finally {
      useUiStore().setRequestComplete('getOmicsRuns');
    }
  }

  function updateSearchOutput(newVal: any) {
    searchOutput.value = newVal;
  }

  async function handleUserAddedToLab() {
    showAddUserModule.value = false;
    await getLabUsers();
  }

  function viewRunSeqeraPipeline(pipeline: SeqeraPipeline) {
    $router.push({
      path: `/labs/${props.labId}/run-pipeline/${pipeline.pipelineId}`,
      query: {
        seqeraRunTempId: uuidv4(),
      },
    });
  }

  function viewRunOmicsWorkflow(workflow: OmicsWorkflow) {
    useToastStore().info('Running HealthOmics Workflows is not yet implemented');
    return;

    $router.push({
      path: `/labs/${props.labId}/run-workflow/${workflow.id}`,
      query: {
        omicsRunTempId: uuidv4(),
      },
    });
  }

  async function handleCancelDialogAction() {
    const runId = runToCancel.value?.RunId;
    const runName = runToCancel.value?.Title;
    const runType = runToCancel.value?.Type;

    if (!runId || !runName || !runType) {
      throw new Error('runToCancel is missing required information');
    }

    try {
      if (runType === 'Seqera Cloud') {
        uiStore.setRequestPending('cancelSeqeraRun');
        await $api.seqeraRuns.cancelPipelineRun(props.labId, runId);
      } else {
        uiStore.setRequestPending('cancelOmicsRun');
        // await $api.omicsRuns.cancelPipelineRun(props.labId, runId); // TODO
      }
    } catch (e) {
      useToastStore().error('Failed to cancel run');
    }

    isCancelSeqeraDialogOpen.value = false;
    isCancelOmicsDialogOpen.value = false;
    uiStore.setRequestComplete('cancelSeqeraRun');
    uiStore.setRequestComplete('cancelOmicsRun');

    await getSeqeraRuns();
    await getOmicsRuns();
  }

  async function handleDetailsUpdated() {
    await loadLabData();

    // the tabs can change after details are updated from adding/removing a compute integration, so update tab index
    setTimeout(setTabIndex, 100); // there's a slight delay to get around a race condition
  }

  watch(lab, async (lab) => {
    if (lab === null) {
      return;
    }

    const promises = [getLabUsers()];

    if (props.superuser) {
      // superuser doesn't view pipelines/workflows or runs so just fetch the users
      await Promise.all(promises);
      return;
    }

    if (lab.NextFlowTowerEnabled) {
      if (!lab.HasNextFlowTowerAccessToken) {
        // Seqera enabled but creds not present, show the modal
        missingPAT.value = true;
        showRedirectModal();
      } else {
        // fetch the Seqera stuff
        promises.push(getSeqeraPipelines());
        promises.push(pollFetchSeqeraRuns());
      }
    }

    if (lab.AwsHealthOmicsEnabled) {
      // fetch the Omics stuff
      promises.push(getOmicsWorkflows());
      promises.push(pollFetchOmicsRuns());
    }

    await Promise.all(promises);
  });

  // Note: the UTabs :ui attribute has to be defined locally in this file - if it is imported from another file,
  //  Tailwind won't pick up and include the classes used and styles will be missing.
  // To keep the tab styling consistent throughout the app, any changes made here need to be duplicated to all other
  //  UTabs that use an "EGTabsStyles" as input to the :ui attribute.
  const EGTabsStyles = {
    base: 'focus:outline-none',
    list: {
      base: '!flex border-b-2 rounded-none mb-6 mt-0',
      padding: 'p-0',
      height: 'h-14',
      marker: {
        wrapper: 'duration-200 ease-out absolute bottom-0 ',
        base: 'absolute bottom-0 rounded-none h-0.5',
        background: 'bg-primary',
        shadow: 'shadow-none',
      },
      tab: {
        base: 'font-serif w-auto inline-flex justify-start ui-focus-visible:outline-0 ui-focus-visible:ring-2 ui-focus-visible:ring-primary-500 ui-not-focus-visible:outline-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-75 duration-200 ease-out mr-16',
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
    :title="labName"
    description="View your Lab users, details and pipelines/workflows"
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
    <template #item="{ item }">
      <!-- Seqera Pipelines tab -->
      <div v-if="item.key === 'seqeraPipelines'" class="space-y-3">
        <EGTable
          :row-click-action="viewRunSeqeraPipeline"
          :table-data="seqeraPipelines"
          :columns="seqeraPipelinesTableColumns"
          :is-loading="useUiStore().anyRequestPending(['loadLabData', 'getSeqeraPipelines'])"
          :show-pagination="!useUiStore().anyRequestPending(['loadLabData', 'getSeqeraPipelines'])"
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
              <EGActionButton :items="seqeraPipelinesActionItems(row)" class="ml-2" @click="$event.stopPropagation()" />
            </div>
          </template>

          <template #empty-state>
            <div class="text-muted flex h-24 items-center justify-center font-normal">
              There are no Pipelines assigned to this Lab
            </div>
          </template>
        </EGTable>
      </div>

      <!-- HealthOmics Pipelines tab -->
      <div v-if="item.key === 'omicsWorkflows'" class="space-y-3">
        <EGTable
          :row-click-action="viewRunOmicsWorkflow"
          :table-data="omicsWorkflows"
          :columns="omicsWorkflowsTableColumns"
          :is-loading="useUiStore().anyRequestPending(['loadLabData', 'getOmicsWorkflows'])"
          :show-pagination="!useUiStore().anyRequestPending(['loadLabData', 'getOmicsWorkflows'])"
        >
          <template #Name-data="{ row: workflow }">
            <div class="flex items-center">
              {{ workflow?.name }}
            </div>
          </template>

          <template #description-data="{ row: workflow }">
            {{ workflow?.description }}
          </template>

          <template #actions-data="{ row: workflow }">
            <div class="flex justify-end">
              <EGActionButton
                :items="omicsWorkflowsActionItems(workflow)"
                class="ml-2"
                @click="$event.stopPropagation()"
              />
            </div>
          </template>

          <template #empty-state>
            <div class="text-muted flex h-24 items-center justify-center font-normal">
              There are no Workflows assigned to this Lab
            </div>
          </template>
        </EGTable>
      </div>

      <!-- Runs tab -->
      <div v-else-if="item.key === 'runs'" class="space-y-3">
        <EGTable
          :row-click-action="viewRunDetails"
          :table-data="combinedRuns"
          :columns="runsTableColumns"
          :is-loading="useUiStore().anyRequestPending(['loadLabData', 'loadLabRuns'])"
          :show-pagination="!useUiStore().anyRequestPending(['loadLabData', 'loadLabRuns'])"
        >
          <template #runName-data="{ row: run }">
            <div v-if="run.RunName" class="text-body text-sm font-medium">{{ run.RunName }}</div>
            <div v-if="run.WorkflowName" class="text-muted text-xs font-normal">{{ run.WorkflowName }}</div>
          </template>

          <template #lastUpdated-data="{ row: run }">
            <div class="text-body text-sm font-medium">{{ getDate(run.ModifiedAt ?? run.CreatedAt) }}</div>
            <div class="text-muted">{{ getTime(run.ModifiedAt ?? run.CreatedAt) }}</div>
          </template>

          <template #status-data="{ row: run }">
            <EGStatusChip :status="run.Status" />
          </template>

          <template #owner-data="{ row: run }">
            <div class="text-body text-sm font-medium">{{ run.Owner }}</div>
          </template>

          <template #actions-data="{ row }">
            <div class="flex justify-end">
              <EGActionButton :items="runsActionItems(row)" class="ml-2" @click="$event.stopPropagation()" />
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
          <template #displayName-data="{ row: labUser }">
            <div class="flex items-center">
              <EGUserDisplay :name="labUser.displayName" :email="labUser.UserEmail" />
            </div>
          </template>

          <template #actions-data="{ row: labUser }">
            <div class="flex items-center">
              <EGUserRoleDropdownNew
                :show-remove-from-lab="true"
                :key="labUser?.LabManager"
                :disabled="
                  useUiStore().anyRequestPending(['loadLabData', 'getLabUsers']) ||
                  !userStore.canEditLabUsers(labId) ||
                  userStore.isSuperuser
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
        <EGFormLabDetails @updated="handleDetailsUpdated" />
      </div>
    </template>
  </UTabs>

  <EGDialog
    action-label="Cancel Run"
    :action-variant="ButtonVariantEnum.enum.destructive"
    @action-triggered="handleCancelDialogAction"
    :primary-message="`Are you sure you would like to cancel ${runToCancel?.Title}?`"
    secondary-message="This will stop any progress made."
    v-model="isCancelSeqeraDialogOpen"
    :buttons-disabled="uiStore.isRequestPending('cancelSeqeraRun')"
  />

  <EGDialog
    action-label="Cancel Run"
    :action-variant="ButtonVariantEnum.enum.destructive"
    @action-triggered="handleCancelDialogAction"
    :primary-message="`Are you sure you would like to cancel ${runToCancel?.Title}?`"
    secondary-message="This will stop any progress made."
    v-model="isCancelOmicsDialogOpen"
    :buttons-disabled="uiStore.isRequestPending('cancelOmicsRun')"
  />
</template>
