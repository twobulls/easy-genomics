import { Workflow } from '@easy-genomics/shared-lib/lib/app/types/nf-tower/nextflow-tower-api';
import { defineStore } from 'pinia';

/*
The WIP Workflow is a construct for storing all of the data for a pipeline run that's being configured but hasn't been
launched yet. They're addressed by workflowTempId which is generated on pipeline click and stored as a query parameter.
This allows multiple workflows to be configured simultaneously without overwriting each other.
*/
export interface WipWorkflowData {
  pipelineId?: number;
  pipelineName?: string;
  pipelineDescription?: string;
  transactionId?: string;
  userPipelineRunName?: string;
  params?: object;
  sampleSheetS3Url?: string;
  s3Bucket?: string;
  s3Path?: string;
}

interface WorkflowState {
  // lookup object for workflows
  workflows: Record<string, Record<string, Workflow>>;
  // ordered lists for pipelines by lab
  workflowIdsByLab: Record<string, string[]>;
  // configs of new workflows yet to be launched
  wipWorkflows: Record<string, WipWorkflowData>;
}

const initialState = (): WorkflowState => ({
  workflows: {},
  workflowIdsByLab: {},
  wipWorkflows: {},
});

const useWorkflowStore = defineStore('workflowStore', {
  state: initialState,

  getters: {
    workflowsForLab:
      (state: WorkflowState) =>
      (labId: string): Workflow[] =>
        state.workflowIdsByLab[labId]?.map((pipelineId) => state.workflows[labId][pipelineId]) || [],
  },

  actions: {
    reset() {
      Object.assign(this, initialState());
    },

    async loadWorkflowsForLab(labId: string): Promise<void> {
      const { $api } = useNuxtApp();

      // fetch new workflows without modifying existing state
      const workflows: Workflow[] = await $api.workflows.list(labId);

      // prepare temporary storage
      const newWorkflows: Record<string, Workflow> = {};
      const newWorkflowIds: string[] = [];

      for (const workflow of workflows) {
        if (workflow.id !== undefined) {
          newWorkflows[workflow.id] = workflow;
          newWorkflowIds.push(workflow.id);
        }
      }

      // update state with the new data
      this.workflows[labId] = newWorkflows;
      this.workflowIdsByLab[labId] = newWorkflowIds;
    },

    async loadSingleWorkflow(labId: string, workflowId: string): Promise<void> {
      const { $api } = useNuxtApp();

      const workflow: Workflow = await $api.workflows.get(labId, workflowId);

      if (!this.workflows[labId]) {
        this.workflows[labId] = {};
      }
      this.workflows[labId][workflow.id] = workflow;
    },

    updateWipWorkflow(tempId: string, updates: Partial<WipWorkflowData>): void {
      this.wipWorkflows[tempId] = {
        ...(this.wipWorkflows[tempId] || {}),
        ...updates,
      };
    },
  },

  persist: true,
});

export default useWorkflowStore;
