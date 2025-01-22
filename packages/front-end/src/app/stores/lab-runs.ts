import { LaboratoryRun } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-run';
import { defineStore } from 'pinia';

// TODO: this should probably be refactored into the run store

interface LabRunsStoreState {
  // indexed by lab run id
  labRuns: Record<string, LaboratoryRun>;
  // ordered lists for lab runs by lab
  labRunIdsByLab: Record<string, string[]>;
}

const initialState = (): LabRunsStoreState => ({
  labRuns: {},
  labRunIdsByLab: {},
});

const useLabRunsStore = defineStore('labRunsStore', {
  state: initialState,

  getters: {
    labRunsForLab:
      (state: LabRunsStoreState) =>
      (labId: string): LaboratoryRun[] =>
        state.labRunIdsByLab[labId]?.map((labRunId) => state.labRuns[labRunId]) || [],

    labRunByExternalId:
      (state: LabRunsStoreState) =>
      (externalId: string): LaboratoryRun | null =>
        Object.values(state.labRuns).find((labRun) => labRun.ExternalRunId === externalId) ?? null,
  },

  actions: {
    reset() {
      Object.assign(this, initialState());
    },

    async loadLabRunsForLab(labId: string): Promise<void> {
      const { $api } = useNuxtApp();

      this.labRunIdsByLab[labId] = [];

      const labRuns = await $api.labs.listLabRuns(labId);
      for (const labRun of labRuns) {
        this.labRuns[labRun.RunId] = labRun;
        this.labRunIdsByLab[labId].push(labRun.RunId);
      }
    },
  },

  persist: true,
});

export default useLabRunsStore;
