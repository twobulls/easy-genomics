import { Organization } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization';
import { defineStore } from 'pinia';

interface OrgsStoreState {
  // indexed by orgId
  orgs: Record<string, Organization>;
}

const initialState = (): OrgsStoreState => ({
  orgs: {},
});

const useOrgsStore = defineStore('orgsStore', {
  state: initialState,

  actions: {
    reset() {
      Object.assign(this, initialState());
    },

    async loadOrgs(): Promise<void> {
      const { $api } = useNuxtApp();
      const freshOrgs: Record<string, Organization> = {};

      for (const org of await $api.orgs.list()) {
        freshOrgs[org.OrganizationId] = org;
      }

      this.orgs = freshOrgs;
    },

    async loadOrg(orgId: string): Promise<void> {
      const { $api } = useNuxtApp();
      const org = await $api.orgs.orgSettings(orgId);

      this.orgs[org.OrganizationId] = org;
    },
  },

  getters: {},

  persist: {
    storage: localStorage,
  },
});

export default useOrgsStore;
