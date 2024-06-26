import { defineStore } from 'pinia';

const initialState = () => ({
  currentOrg: {
    OrganizationId: '',
    OrganizationName: '',
  },
});

/**
 * @description User store to manage current signed-in user state
 */
const useUserStore = defineStore('userStore', {
  state: initialState,

  getters: {
    currentOrgName: (state) => state.currentOrg.OrganizationName,
    currentOrgId: (state) => state.currentOrg.OrganizationId,
  },

  actions: {
    setOrgAccess(val: any) {
      this.currentOrg = val;
    },
    reset() {
      Object.assign(this, initialState());
    },
  },

  persist: true,
});

export default useUserStore;
