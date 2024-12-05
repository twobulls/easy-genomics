import { Workflow as SeqeraRun } from '@easy-genomics/shared-lib/lib/app/types/nf-tower/nextflow-tower-api';
import { defineStore } from 'pinia';

/*
The WIP run is a construct for storing all of the data for a pipeline run that's being configured but hasn't been
launched yet. They're addressed by a temp id, which is generated on pipeline click and stored as a query parameter. This
allows multiple runs to be configured simultaneously without overwriting each other.
*/
export interface WipSeqeraRunData {
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

interface RunState {
  // lookup object for Seqera runs
  seqeraRuns: Record<string, Record<string, SeqeraRun>>;
  // ordered lists for Seqera runs by lab
  seqeraRunIdsByLab: Record<string, string[]>;
  // configs of new Seqera runs yet to be launched
  wipSeqeraRuns: Record<string, WipSeqeraRunData>;
}

const initialState = (): RunState => ({
  seqeraRuns: {},
  seqeraRunIdsByLab: {},
  wipSeqeraRuns: {},
});

const useRunStore = defineStore('runStore', {
  state: initialState,

  getters: {
    seqeraRunsForLab:
      (state: RunState) =>
      (labId: string): SeqeraRun[] =>
        state.seqeraRunIdsByLab[labId]?.map((pipelineId) => state.seqeraRuns[labId][pipelineId]) || [],
  },

  actions: {
    reset() {
      Object.assign(this, initialState());
    },

    async loadSeqeraRunsForLab(labId: string): Promise<void> {
      const { $api } = useNuxtApp();

      // fetch new runs without modifying existing state
      const runs: SeqeraRun[] = await $api.seqeraRuns.list(labId);

      // prepare temporary storage
      const newRuns: Record<string, SeqeraRun> = {};
      const newRunIds: string[] = [];

      for (const run of runs) {
        if (run.id !== undefined) {
          newRuns[run.id] = run;
          newRunIds.push(run.id);
        }
      }

      // update state with the new data
      this.seqeraRuns[labId] = newRuns;
      this.seqeraRunIdsByLab[labId] = newRunIds;
    },

    async loadSingleSeqeraRun(labId: string, runId: string): Promise<void> {
      const { $api } = useNuxtApp();

      const run: SeqeraRun = await $api.seqeraRuns.get(labId, runId);

      if (!this.seqeraRuns[labId]) {
        this.seqeraRuns[labId] = {};
      }
      this.seqeraRuns[labId][run.id] = run;
    },

    updateWipSeqeraRun(tempId: string, updates: Partial<WipSeqeraRunData>): void {
      this.wipSeqeraRuns[tempId] = {
        ...(this.wipSeqeraRuns[tempId] || {}),
        ...updates,
      };
    },
  },

  persist: true,
});

export default useRunStore;
