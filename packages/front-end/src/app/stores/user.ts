import { defineStore } from 'pinia';

const initialState = () => ({
  currentOrg: {},
});

const useUiStore = defineStore('uiStore', {
  state: initialState,

  actions: {
    setOrgAccess(val: any) {
      this.currentOrg = val;
    },
  },
});

export default useUiStore;
