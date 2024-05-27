import { OrganizationUserDetails } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization-user-details';
import { defineStore } from 'pinia';
import useUser from '~/composables/useUser';
import { OrganizationAccessDetails } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user';

interface OrgsStoreState {
  selectedUser: OrganizationUserDetails | undefined;
}

const initialState = (): OrgsStoreState => ({
  selectedUser: undefined,
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
  },

  getters: {
    // return the selected user's display name
    getUserDisplayName(): string {
      return String(
        useUser().displayName({
          preferredName: this.selectedUser?.PreferredName || '',
          firstName: this.selectedUser?.FirstName || '',
          lastName: this.selectedUser?.LastName || '',
        })
      );
    },

    getUserLabAccess(): OrganizationAccessDetails | undefined {
      return this.selectedUser?.OrganizationAccess?.LaboratoryAccess;
    },
  },

  persist: true,
});

export default useOrgsStore;
