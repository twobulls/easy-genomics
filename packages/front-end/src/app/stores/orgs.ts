import { Organization } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization';
import { OrganizationUserDetails } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization-user-details';
import { OrganizationAccessDetails } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user';
import { defineStore } from 'pinia';
import useUser from '@FE/composables/useUser';

interface OrgsStoreState {
  selectedUser: OrganizationUserDetails | undefined;
  selectedOrg: Organization | undefined;
}

const initialState = (): OrgsStoreState => ({
  selectedUser: undefined,
  selectedOrg: undefined,
});

const useOrgsStore = defineStore('orgsStore', {
  state: initialState,

  actions: {
    setSelectedUser(user: OrganizationUserDetails) {
      this.selectedUser = user;
    },

    setSelectedOrg(org: Organization) {
      this.selectedOrg = {
        ...org,
      };
    },

    reset() {
      Object.assign(this, initialState());
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

  persist: true,
});

export default useOrgsStore;
