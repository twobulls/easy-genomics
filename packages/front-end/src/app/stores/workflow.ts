import { Workflow as NextFlowRun } from '@easy-genomics/shared-lib/lib/app/types/nf-tower/nextflow-tower-api';
import { defineStore } from 'pinia';

/*
The WIP NextFlow Run is a construct for storing all of the data for a pipeline run that's being configured but hasn't
been launched yet. They're addressed by workflowTempId which is generated on pipeline click and stored as a query
parameter. This allows multiple runs to be configured simultaneously without overwriting each other.
*/
export interface WipNextFlowRunData {
  laboratoryId?: string;
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
  // lookup object for NextFlow runs
  nextFlowRuns: Record<string, Record<string, NextFlowRun>>;
  // ordered lists for NextFlow runs by lab
  nextFlowRunIdsByLab: Record<string, string[]>;
  // configs of new NextFlow runs yet to be launched
  wipNextFlowRuns: Record<string, WipNextFlowRunData>;
}

const initialState = (): WorkflowState => ({
  nextFlowRuns: {},
  nextFlowRunIdsByLab: {},
  wipNextFlowRuns: {},
});

const useWorkflowStore = defineStore('workflowStore', {
  state: initialState,

  getters: {
    nextFlowRunsForLab:
      (state: WorkflowState) =>
      (labId: string): NextFlowRun[] =>
        state.nextFlowRunIdsByLab[labId]?.map((pipelineId) => state.nextFlowRuns[labId][pipelineId]) || [],
  },

  actions: {
    reset() {
      Object.assign(this, initialState());
    },

    async loadNextFlowRunsForLab(labId: string): Promise<void> {
      const { $api } = useNuxtApp();

      // fetch new runs without modifying existing state
      const runs: NextFlowRun[] = await $api.workflows.list(labId);

      // prepare temporary storage
      const newRuns: Record<string, NextFlowRun> = {};
      const newRunIds: string[] = [];

      for (const run of runs) {
        if (run.id !== undefined) {
          newRuns[run.id] = run;
          newRunIds.push(run.id);
        }
      }

      // update state with the new data
      this.nextFlowRuns[labId] = newRuns;
      this.nextFlowRunIdsByLab[labId] = newRunIds;
    },

    async loadSingleNextFlowRun(labId: string, runId: string): Promise<void> {
      const { $api } = useNuxtApp();

      const run: NextFlowRun = await $api.workflows.get(labId, runId);

      if (!this.nextFlowRuns[labId]) {
        this.nextFlowRuns[labId] = {};
      }
      this.nextFlowRuns[labId][run.id] = run;
    },

    updateWipNextFlowRun(tempId: string, updates: Partial<WipNextFlowRunData>): void {
      this.wipNextFlowRuns[tempId] = {
        ...(this.wipNextFlowRuns[tempId] || {}),
        ...updates,
      };
    },
  },

  persist: true,
});

export default useWorkflowStore;
