// this import triggers a bizarre eslint problem
// eslint-disable-next-line import/named
import { RunListItem as OmicsRun } from '@aws-sdk/client-omics';
import { Workflow as SeqeraRun } from '@easy-genomics/shared-lib/lib/app/types/nf-tower/nextflow-tower-api';
import { LaboratoryRun } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-run';
import { defineStore } from 'pinia';
import { FilePair } from '@FE/components/EGRunFormUploadData.vue';

/*
The WIP run is a construct for storing all of the data for a pipeline run that's being configured but hasn't been
launched yet. They're addressed by a temp id, which is generated on pipeline click and stored as a query parameter. This
allows multiple runs to be configured simultaneously without overwriting each other.
*/
export interface WipSeqeraRunData {
  laboratoryId?: string;
  pipelineId?: string;
  transactionId?: string;
  runName?: string;
  params?: object;
  sampleSheetS3Url?: string;
  s3Bucket?: string;
  s3Path?: string;
  files?: FilePair[];
  paramsRequired: string[];
}

export interface WipOmicsRunData {
  laboratoryId?: string;
  workflowId?: string;
  workflowName?: string;
  transactionId?: string;
  runName?: string;
  params?: object;
  sampleSheetS3Url?: string;
  s3Bucket?: string;
  s3Path?: string;
  files?: FilePair[];
  paramsRequired: string[];
}

interface RunState {
  // indexed by lab run id
  labRuns: Record<string, LaboratoryRun>;
  // ordered lists for lab runs by lab
  labRunIdsByLab: Record<string, string[]>;

  // lookup object for Seqera runs
  seqeraRuns: Record<string, Record<string, SeqeraRun>>;
  // ordered lists for Seqera runs by lab
  seqeraRunIdsByLab: Record<string, string[]>;
  // configs of new Seqera runs yet to be launched
  wipSeqeraRuns: Record<string, WipSeqeraRunData>;

  // lookup object for Omics runs
  omicsRuns: Record<string, Record<string, OmicsRun>>;
  // ordered lists for Omics runs by lab
  omicsRunIdsByLab: Record<string, string[]>;
  // configs of new Omics runs yet to be launched
  wipOmicsRuns: Record<string, WipOmicsRunData>;
}

const initialState = (): RunState => ({
  labRuns: {},
  labRunIdsByLab: {},

  seqeraRuns: {},
  seqeraRunIdsByLab: {},
  wipSeqeraRuns: {},

  omicsRuns: {},
  omicsRunIdsByLab: {},
  wipOmicsRuns: {},
});

const useRunStore = defineStore('runStore', {
  state: initialState,

  getters: {
    // Laboratory Runs

    labRunsForLab:
      (state: RunState) =>
      (labId: string): LaboratoryRun[] =>
        state.labRunIdsByLab[labId]?.map((labRunId) => state.labRuns[labRunId]) || [],

    labRunByExternalId:
      (state: RunState) =>
      (externalId: string): LaboratoryRun | null =>
        Object.values(state.labRuns).find((labRun) => labRun.ExternalRunId === externalId) ?? null,

    // Seqera Runs

    seqeraRunsForLab:
      (state: RunState) =>
      (labId: string): SeqeraRun[] =>
        state.seqeraRunIdsByLab[labId]?.map((runId) => state.seqeraRuns[labId][runId]) || [],

    // Omics Runs

    omicsRunsForLab:
      (state: RunState) =>
      (labId: string): OmicsRun[] =>
        state.omicsRunIdsByLab[labId]?.map((runId) => state.omicsRuns[labId][runId]) || [],
  },

  actions: {
    reset() {
      Object.assign(this, initialState());
    },

    // Laboratory Runs

    async loadLabRunsForLab(labId: string): Promise<void> {
      const { $api } = useNuxtApp();

      this.labRunIdsByLab[labId] = [];

      const labRuns = await $api.labs.listLabRuns(labId);
      for (const labRun of labRuns) {
        this.labRuns[labRun.RunId] = labRun;
        this.labRunIdsByLab[labId].push(labRun.RunId);
      }
    },

    // Seqera Runs

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
      const existingWipRun = this.wipSeqeraRuns[tempId] || {};
      const existingParams = existingWipRun.params || {};
      this.wipSeqeraRuns[tempId] = {
        ...existingWipRun,
        ...updates,
      };
      // need to merge params separately because they're nested
      if (updates.params) {
        this.wipSeqeraRuns[tempId].params = {
          ...existingParams,
          ...updates.params,
        };
      }
    },

    // Omics Runs

    async loadOmicsRunsForLab(labId: string): Promise<void> {
      const { $api } = useNuxtApp();

      // fetch new runs without modifying existing state
      const res = await $api.omicsRuns.list(labId);
      const runs: OmicsRun[] = res.items || [];

      // prepare temporary storage
      const newRuns: Record<string, OmicsRun> = {};
      const newRunIds: string[] = [];

      for (const run of runs) {
        if (run.id !== undefined) {
          newRuns[run.id] = run;
          newRunIds.push(run.id);
        }
      }

      // update state with the new data
      this.omicsRuns[labId] = newRuns;
      this.omicsRunIdsByLab[labId] = newRunIds;
    },

    async loadSingleOmicsRun(labId: string, runId: string): Promise<void> {
      const { $api } = useNuxtApp();

      const run: OmicsRun = await $api.omicsRuns.get(labId, runId);

      if (!this.omicsRuns[labId]) {
        this.omicsRuns[labId] = {};
      }
      this.omicsRuns[labId][runId] = run;
    },

    updateWipOmicsRun(tempId: string, updates: Partial<WipOmicsRunData>): void {
      const existingWipRun = this.wipOmicsRuns[tempId] || {};
      const existingParams = existingWipRun.params || {};
      this.wipOmicsRuns[tempId] = {
        ...existingWipRun,
        ...updates,
      };
      // need to merge params separately because they're nested
      if (updates.params) {
        this.wipOmicsRuns[tempId].params = {
          ...existingParams,
          ...updates.params,
        };
      }
    },
  },

  persist: true,
});

export default useRunStore;
