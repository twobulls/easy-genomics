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
export interface WipRun {
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
  wipSeqeraRuns: Record<string, WipRun>;

  // lookup object for Omics runs
  omicsRuns: Record<string, Record<string, OmicsRun>>;
  // ordered lists for Omics runs by lab
  omicsRunIdsByLab: Record<string, string[]>;
  // configs of new Omics runs yet to be launched
  wipOmicsRuns: Record<string, WipRun>;
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

    // Temp Runs

    _updateWipRun(type: 'seqera' | 'omics', tempId: string, updates: Partial<WipRun>, unsets: (keyof WipRun)[]): void {
      const store = type === 'seqera' ? this.wipSeqeraRuns : this.wipOmicsRuns;

      const existingWipRun: WipRun = store[tempId] || {};

      // remove unsets
      for (const unset of unsets) {
        delete existingWipRun[unset];
      }

      // apply updates and save
      store[tempId] = {
        ...existingWipRun,
        ...updates,
      };
    },

    _updateWipRunParams(type: 'seqera' | 'omics', tempId: string, updates: object, unsets: string[]): void {
      const store = type === 'seqera' ? this.wipSeqeraRuns : this.wipOmicsRuns;

      const wipRun = store[tempId] || {};
      const existingParams: any = wipRun.params || {};

      // remove unsets
      for (const unset of unsets) {
        delete existingParams[unset];
      }

      // apply updates
      wipRun.params = {
        ...existingParams,
        ...updates,
      };

      // save
      store[tempId] = wipRun;
    },

    updateWipSeqeraRun(tempId: string, updates: Partial<WipRun>, unsets: (keyof WipRun)[] = []): void {
      this._updateWipRun('seqera', tempId, updates, unsets);
    },

    updateWipOmicsRun(tempId: string, updates: Partial<WipRun>, unsets: (keyof WipRun)[] = []): void {
      this._updateWipRun('omics', tempId, updates, unsets);
    },

    updateWipSeqeraRunParams(tempId: string, updates: object, unsets: string[] = []): void {
      this._updateWipRunParams('seqera', tempId, updates, unsets);
    },

    updateWipOmicsRunParams(tempId: string, updates: object, unsets: string[] = []): void {
      this._updateWipRunParams('omics', tempId, updates, unsets);
    },
  },

  persist: true,
});

export default useRunStore;
