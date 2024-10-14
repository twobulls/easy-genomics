import { Workflow } from '@easy-genomics/shared-lib/lib/app/types/nf-tower/nextflow-tower-api';
import { defineStore } from 'pinia';

interface WipPipelineRunData {
  // TODO: can we refactor the lab info out because it's always in the url?
  labId?: string;
  labName?: string;
  pipelineId?: number;
  pipelineName?: string;
  pipelineDescription?: string;
  transactionId?: string;
  userPipelineRunName?: string;
  params?: object;
  sampleSheetCsv?: string;
  S3Url?: string;
}

interface PipeLineRunState {
  // lookup object for pipeline runs
  pipelineRuns: Record<string, Record<string, Workflow>>;
  // ordered lists for pipelines by lab
  pipelineRunIdsOrders: Record<string, string[]>;
  // configs of new pipeline runs yet to be launched
  wipPipelineRuns: Record<string, WipPipelineRunData>;
}

const initialState = (): PipeLineRunState => ({
  pipelineRuns: {},
  pipelineRunIdsOrders: {},
  wipPipelineRuns: {},
});

const usePipelineRunStore = defineStore('pipelineRunStore', {
  state: initialState,

  actions: {
    reset() {
      Object.assign(this, initialState());
    },

    async loadPipelineRunsForLab(labId: string): Promise<void> {
      const { $api } = useNuxtApp();

      this.pipelineRuns[labId] = {};
      this.pipelineRunIdsOrders[labId] = [];

      const pipelineRuns: Workflow[] = await $api.workflows.list(labId);

      for (const pipelineRun of pipelineRuns) {
        if (pipelineRun.id !== undefined) {
          this.pipelineRuns[labId][pipelineRun.id] = pipelineRun;
          this.pipelineRunIdsOrders[labId].push(pipelineRun.id);
        }
      }
    },

    async loadSinglePipelineRun(labId: string, workflowId: string): Promise<void> {
      const { $api } = useNuxtApp();

      const pipelineRun: Workflow = await $api.workflows.get(labId, workflowId);

      if (!this.pipelineRuns[labId]) {
        this.pipelineRuns[labId] = {};
      }
      this.pipelineRuns[labId][pipelineRun.id] = pipelineRun;
    },

    getPipelineRunsForLab(labId: string): Workflow[] {
      return this.pipelineRunIdsOrders[labId]?.map((pipelineId) => this.pipelineRuns[labId][pipelineId]) || [];
    },

    updateWipPipelineRun(tempId: string, updates: Partial<WipPipelineRunData>): void {
      this.wipPipelineRuns[tempId] = {
        ...(this.wipPipelineRuns[tempId] || {}),
        ...updates,
      };
    },
  },

  persist: {
    storage: localStorage,
  },
});

export default usePipelineRunStore;
