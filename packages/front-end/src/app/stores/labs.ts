import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
import { defineStore } from 'pinia';

interface LabsStoreState {
  // indexed by labId
  labs: Record<string, Laboratory>;
  // ordered lists for labs by org
  labIdsByOrg: Record<string, string[]>;
}

const initialState = (): LabsStoreState => ({
  labs: {},
  labIdsByOrg: {},
});

const useLabsStore = defineStore('labsStore', {
  state: initialState,

  getters: {
    labsForOrg:
      (state: LabsStoreState) =>
      (orgId: string): Laboratory[] =>
        state.labIdsByOrg[orgId]?.map((labId) => state.labs[labId]) || [],
  },

  actions: {
    reset() {
      Object.assign(this, initialState());
    },

    async loadLab(labId: string): Promise<void> {
      const { $api } = useNuxtApp();
      const lab = await $api.labs.labDetails(labId);

      this.labs[lab.LaboratoryId] = lab;
    },

    async loadLabsForOrg(orgId: string): Promise<void> {
      const { $api } = useNuxtApp();
      const labs = await $api.labs.list(orgId);

      this.labIdsByOrg[orgId] = [];

      for (const lab of labs) {
        this.labs[lab.LaboratoryId] = lab;
        this.labIdsByOrg[orgId].push(lab.LaboratoryId);
      }
    },
  },

  persist: true,
});

export default useLabsStore;
