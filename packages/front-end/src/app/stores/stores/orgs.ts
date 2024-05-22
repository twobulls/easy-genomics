import { OrganizationUserDetails } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization-user-details';
import { defineStore } from 'pinia';
import useUser from '~/composables/useUser';

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
  },

  getters: {
    // return the selected user's display name
    userDisplayName(): string {
      return String(
        useUser().displayName({
          preferredName: this.selectedUser?.PreferredName || '',
          firstName: this.selectedUser?.FirstName || '',
          lastName: this.selectedUser?.LastName || '',
        })
      );
    },

    reset() {
      Object.assign(this, initialState());
    },
  },

  persist: true,
});

export default useOrgsStore;
