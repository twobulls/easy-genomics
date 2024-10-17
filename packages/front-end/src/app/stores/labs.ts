import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
import { defineStore } from 'pinia';

interface LabsStoreState {
  // indexed by labId
  labs: Record<string, Laboratory>;
}

const initialState = (): LabsStoreState => ({
  labs: {},
});

const useLabsStore = defineStore('labsStore', {
  state: initialState,

  actions: {
    reset() {
      Object.assign(this, initialState());
    },

    async loadLabsForOrg(orgId: string): Promise<void> {
      const { $api } = useNuxtApp();
      const labs = await $api.labs.list(orgId);

      for (const lab of labs) {
        this.labs[lab.LaboratoryId] = lab;
      }
    },

    async loadAllLabsForCurrentUser(): Promise<void> {
      const currentUserPermissions = useUserStore().currentUserPermissions.orgPermissions;
      if (currentUserPermissions === null) {
        return;
      }

      const orgIds = Object.keys(currentUserPermissions);
      await Promise.all(orgIds.map(this.loadLabsForOrg));
    },
  },
});

export default useLabsStore;
