<script setup lang="ts">
  import { LabUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user-unified';
  import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
  import {
    LaboratoryRolesEnum,
    LaboratoryRolesEnumSchema,
  } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/roles';
  import { ButtonVariantEnum } from '@FE/types/buttons';
  import { DeletedResponse, EditUserResponse } from '@FE/types/api';
  import { useRunStore, useToastStore, useUiStore } from '@FE/stores';
  import useUser from '@FE/composables/useUser';
  import { LaboratoryUserDetails } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-user-details';
  import { LaboratoryUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-user';
  import { getDate, getTime } from '@FE/utils/date-time';
  import EGModal from '@FE/components/EGModal';
  import { v4 as uuidv4 } from 'uuid';
  import {
    Workflow as SeqeraRun,
    Pipeline as SeqeraPipeline,
  } from '@easy-genomics/shared-lib/src/app/types/nf-tower/nextflow-tower-api';
  import { WorkflowListItem as OmicsWorkflow, RunListItem as OmicsRun } from '@aws-sdk/client-omics';

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

  const orgId = labStore.labs[props.labId].OrganizationId;
  const labUsers = ref<LabUser[]>([]);
  const seqeraPipelines = ref<SeqeraPipeline[]>([]);
  const omicsWorkflows = ref<OmicsWorkflow[]>([]);
  const canAddUsers = ref(false);
  const showAddUserModule = ref(false);
  const searchOutput = ref('');
  const runToCancel = ref<GenericRun | null>(null);
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

  const seqeraRuns = computed<SeqeraRun[]>(() => runStore.seqeraRunsForLab(props.labId));
  const omicsRuns = computed<OmicsRun[]>(() => runStore.omicsRunsForLab(props.labId));

  type GenericRun = {
    type: 'seqera' | 'omics';
    id: string;
    name: string;
    subName: string;
    time: string;
    status: string;
    owner: string;
  };

  function seqeraToGeneric(seqeraRun: SeqeraRun): GenericRun {
    return {
      type: 'seqera',
      id: seqeraRun.id!,
      name: seqeraRun.runName,
      subName: seqeraRun.projectName,
      time: seqeraRun.lastUpdated?.replace(/\.\d\d\dZ/, 'Z') || '-',
      status: seqeraRun.status || '-',
      owner: seqeraRun.userName || '-',
    };
  }

  function omicsToGeneric(omicsRun: OmicsRun): GenericRun {
    return {
      type: 'omics',
      id: omicsRun.id!,
      name: omicsRun.name || '-',
      subName: '',
      time: omicsRun.creationTime?.toString()?.replace(/\.\d\d\dZ/, 'Z') || '-',
      status: omicsRun.status || '-',
      owner: '-',
    };
  }

  const combinedRuns = computed<GenericRun[]>(() => {
    if (uiStore.anyRequestPending(['getSeqeraRuns', 'getOmicsRuns'])) {
      return [];
    }

    return seqeraRuns.value
      .map(seqeraToGeneric)
      .concat(omicsRuns.value.map(omicsToGeneric))
      .sort((a, b) => (a.time > b.time ? -1 : 1));
  });

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
    { key: 'platform', label: 'Platform' },
    { key: 'actions', label: 'Actions' },
  ];

  const tabItems = computed<{ key: string; label: string }[]>(() => {
    const items = [];

    if (!missingPAT.value) {
      if (!props.superuser) {
        if (lab.value?.NextFlowTowerEnabled) {
          items.push({ key: 'seqeraPipelines', label: 'Seqera Pipelines' });
        }
        if (lab.value?.AwsHealthOmicsEnabled) {
          items.push({ key: 'omicsWorkflows', label: 'HealthOmics Workflows' });
        }
        items.push({ key: 'runs', label: 'Lab Runs' });
      }
      items.push({ key: 'users', label: 'Lab Users' });
    }

    items.push({ key: 'details', label: 'Details' });

    return items;
  });

  const seqeraPipelinesActionItems = (pipeline: any) => [
    [{ label: 'Run', click: () => viewRunSeqeraPipeline(pipeline) }],
  ];

  const omicsWorkflowsActionItems = (workflow: any) => [
    [{ label: 'Run', click: () => viewRunOmicsWorkflow(workflow) }],
  ];

  function viewRunDetails(run: GenericRun) {
    $router.push({ path: `/labs/${props.labId}/${run.type}-run/${run.id}`, query: { tab: 'Run Details' } });
  }

  function viewRunResults(run: GenericRun) {
    $router.push({ path: `/labs/${props.labId}/${run.type}-run/${run.id}`, query: { tab: 'Run Results' } });
  }

  function initCancelRun(run: GenericRun) {
    runToCancel.value = run;

    if (run.type === 'seqera') {
      isCancelSeqeraDialogOpen.value = true;
    } else {
      isCancelOmicsDialogOpen.value = true;
    }
  }

  function runsActionItems(run: GenericRun): object[] {
    const buttons: object[][] = [
      [{ label: 'View Details', click: () => viewRunDetails(run) }],
      [{ label: 'View Results', click: () => viewRunResults(run) }],
    ];

    if (['SUBMITTED', 'RUNNING'].includes(run.status)) {
      buttons.push([{ label: 'Cancel Run', click: () => initCancelRun(run), isHighlighted: true }]);
    }

    return buttons;
  }

  /**
   * Fetch Lab details, pipelines, workflows, runs, and Lab users before component mount and start periodic fetching
   */
  onBeforeMount(loadLabData);

  // set tabIndex according to query param
  onMounted(() => {
    const queryTabMatchIndex = tabItems.value.findIndex((tab) => tab.label === props.initialTab);
    tabIndex.value = queryTabMatchIndex !== -1 ? queryTabMatchIndex : 0;

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

  async function getSeqeraPipelines(): Promise<void> {
    useUiStore().setRequestPending('getSeqeraPipelines');
    try {
      const res = await $api.seqeraPipelines.list(props.labId);

      if (!res.pipelines) {
        throw new Error('response did not contain pipeline object');
      }

      seqeraPipelines.value = res.pipelines;
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

  function viewRunSeqeraPipeline(pipeline: SeqeraRun) {
    const seqeraRunTempId = uuidv4();

    const { description: pipelineDescription, pipelineId, name: pipelineName } = toRaw(pipeline);

    runStore.updateWipSeqeraRun(seqeraRunTempId, {
      pipelineId,
      pipelineName,
      pipelineDescription: pipelineDescription || '',
      transactionId: uuidv4(),
    });

    $router.push({
      path: `/labs/${props.labId}/run-pipeline/${pipelineId}`,
      query: {
        seqeraRunTempId,
      },
    });
  }

  function viewRunOmicsWorkflow(workflow: OmicsRun) {
    useToastStore().info('Running HealthOmics Workflows is not yet implemented');
    return;

    const omicsRunTempId = uuidv4();

    runStore.updateWipOmicsRun(omicsRunTempId, {
      laboratoryId: props.labId,
      workflowId: workflow.id,
      workflowName: workflow.name,
      transactionId: uuidv4(),
    });

    $router.push({
      path: `/labs/${props.labId}/run-workflow/${workflow.id}`,
      query: {
        omicsRunTempId,
      },
    });
  }

  async function handleCancelDialogAction() {
    const runId = runToCancel.value?.id;
    const runName = runToCancel.value?.name;
    const runType = runToCancel.value?.type;

    if (!runId || !runName || !runType) {
      throw new Error('runToCancel is missing required information');
    }

    try {
      if (runType === 'seqera') {
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

  watch(lab, async (lab) => {
    if (lab !== null) {
      if (lab.HasNextFlowTowerAccessToken) {
        // load pipelines/runs/labUsers after lab loads
        if (props.superuser) {
          // superuser doesn't view pipelines or runs so don't fetch those
          await getLabUsers();
        } else {
          await Promise.all([
            getSeqeraPipelines(),
            getOmicsWorkflows(),
            pollFetchSeqeraRuns(),
            pollFetchOmicsRuns(),
            getLabUsers(),
          ]);
          canAddUsers.value = useUserStore().canAddLabUsers(props.labId);
        }
      } else {
        // missing personal access token message
        missingPAT.value = true;
        showRedirectModal();
      }
    }
  });

  // Note: the UTabs :ui attribute has to be defined locally in this file - if it is imported from another file,
  //  Tailwind won't pick up and include the classes used and styles will be missing.
  // To keep the tab styling consistent throughout the app, any changes made here need to be duplicated to all other
  //  UTabs that use an "EGTabsStyles" as input to the :ui attribute.
  const EGTabsStyles = {
    base: 'focus:outline-none',
    list: {
      base: '!flex border-b-2 rounded-none mb-4 mt-0',
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
          :is-loading="useUiStore().anyRequestPending(['loadLabData', 'getSeqeraRuns', 'getOmicsRuns'])"
          :show-pagination="!useUiStore().anyRequestPending(['loadLabData', 'getSeqeraRuns', 'getOmicsRuns'])"
        >
          <template #runName-data="{ row: run }">
            <div v-if="run.name" class="text-body text-sm font-medium">{{ run.name }}</div>
            <div v-if="run.subName" class="text-muted text-xs font-normal">{{ run.subName }}</div>
          </template>

          <template #lastUpdated-data="{ row: run }">
            <div class="text-body text-sm font-medium">{{ getDate(run.time) }}</div>
            <div class="text-muted">{{ getTime(run.time) }}</div>
          </template>

          <template #status-data="{ row: run }">
            <EGStatusChip :status="run.status" />
          </template>

          <template #owner-data="{ row: run }">
            <div class="text-body text-sm font-medium">{{ run.owner }}</div>
          </template>

          <template #platform-data="{ row: run }">
            <div class="text-body text-sm font-medium">{{ run.type === 'seqera' ? 'Seqera' : 'HealthOmics' }}</div>
          </template>

          <template #actions-data="{ row }">
            <div class="flex justify-end">
              <EGActionButton :items="runsActionItems(row)" class="ml-2" @click="$event.stopPropagation()" />
            </div>
          </template>

          <template #empty-state>
            <div class="text-muted flex h-24 items-center justify-center font-normal">
              There are no Omics Runs in your Lab
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
                  !useUserStore().canEditLabUsers(labId) ||
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
        <EGFormLabDetails @updated="loadLabData" />
      </div>
    </template>
  </UTabs>

  <EGDialog
    action-label="Cancel Run"
    :action-variant="ButtonVariantEnum.enum.destructive"
    @action-triggered="handleCancelDialogAction"
    :primary-message="`Are you sure you would like to cancel ${runToCancel?.name}?`"
    secondary-message="This will stop any progress made."
    v-model="isCancelSeqeraDialogOpen"
    :buttons-disabled="uiStore.isRequestPending('cancelSeqeraRun')"
  />

  <EGDialog
    action-label="Cancel Run"
    :action-variant="ButtonVariantEnum.enum.destructive"
    @action-triggered="handleCancelDialogAction"
    :primary-message="`Are you sure you would like to cancel ${runToCancel?.name}?`"
    secondary-message="This will stop any progress made."
    v-model="isCancelOmicsDialogOpen"
    :buttons-disabled="uiStore.isRequestPending('cancelOmicsRun')"
  />
</template>
