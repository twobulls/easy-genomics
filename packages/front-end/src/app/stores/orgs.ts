import { Organization } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization';
import { OrganizationUserDetails } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization-user-details';
import { OrganizationAccessDetails } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user';
import { defineStore } from 'pinia';
import useUser from '@FE/composables/useUser';

interface OrgsStoreState {
  selectedUser: OrganizationUserDetails | undefined;

  // indexed by labId
  orgs: Record<string, Organization>;
}

const initialState = (): OrgsStoreState => ({
  selectedUser: undefined,
  orgs: {},
});

const useOrgsStore = defineStore('orgsStore', {
  state: initialState,

  actions: {
    setSelectedUser(user: OrganizationUserDetails) {
      this.selectedUser = user;
    },

    reset() {
      Object.assign(this, initialState());
    },

    async loadOrgs(): Promise<void> {
      const { $api } = useNuxtApp();
      const orgs = await $api.orgs.list();

      for (const org of orgs) {
        console.log('updated', new Date());
        this.orgs[org.OrganizationId] = org;
      }

      // TODO: clear out stale entries
    },

    async loadOrg(orgId: string): Promise<void> {
      const { $api } = useNuxtApp();
      const org = await $api.orgs.orgSettings(orgId);

      console.log('updated', new Date());
      this.orgs[org.OrganizationId] = org;
    },
  },

  getters: {
    // return the selected user's display name
    getSelectedUserDisplayName(): string {
      return String(
        useUser().displayName({
          preferredName: this.selectedUser?.PreferredName || '',
          firstName: this.selectedUser?.FirstName || '',
          lastName: this.selectedUser?.LastName || '',
          email: this.selectedUser?.UserEmail || '',
        }),
      );
    },

    getUserLabAccess(): OrganizationAccessDetails | undefined {
      return this.selectedUser?.OrganizationAccess?.LaboratoryAccess;
    },
  },

  persist: {
    storage: localStorage,
  },
});

export default useOrgsStore;
