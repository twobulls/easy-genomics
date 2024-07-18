import { Workflow } from '@easy-genomics/shared-lib/lib/app/types/nf-tower/nextflow-tower-api';
import { defineStore } from 'pinia';

interface LabsStoreState {
  workflow: Workflow | undefined;
}

const initialState = (): LabsStoreState => ({
  workflow: undefined,
});

const useLabsStore = defineStore('labsStore', {
  state: initialState,

  actions: {
    setSelectedWorkflow(workflow: Workflow) {
      this.workflow = workflow;
    },

    reset() {
      Object.assign(this, initialState());
    },
  },

  getters: {},

  persist: true,
});

export default useLabsStore;
