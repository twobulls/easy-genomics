import { defineStore } from 'pinia';
import { OrganizationUserDetails } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization-user-details';
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
