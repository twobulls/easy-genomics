import { Workflow } from '@easy-genomics/shared-lib/lib/app/types/nf-tower/nextflow-tower-api';
import { defineStore } from 'pinia';

interface LabsStoreState {
  labId: string;
  labName: string;
  workflow: Workflow | undefined;
}

const initialState = (): LabsStoreState => ({
  labId: '',
  labName: '',
  workflow: undefined,
});

const useLabsStore = defineStore('labsStore', {
  state: initialState,

  actions: {
    setLabId(labId: string) {
      this.labId = labId;
    },

    setLabName(labName: string) {
      this.labName = labName;
    },

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
