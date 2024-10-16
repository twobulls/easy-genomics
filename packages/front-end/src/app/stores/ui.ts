import { defineStore } from 'pinia';

type PendingRequest =
  | 'signIn'
  | 'forgotPassword'
  | 'resetPassword'
  | 'sendInvite'
  | 'acceptInvite'
  | 'removeUserFromLab'
  | 'assignLabRole'
  | 'getLabUsers'
  | 'addUserToLab'
  | 'removeUserFromLab'
  | 'updateUser'
  | 'getPipelines'
  | 'getWorkflows'
  | 'createOrg'
  | 'fetchOrgData'
  | 'editOrg'
  | 'createLab'
  | 'getLabs'
  | 'deleteLab'
  | 'fetchOrgLabs'
  | 'fetchUserLabs'
  | 'loadLabData';

interface UiStoreState {
  pendingRequests: Set<string>;
  previousPageRoute: string;
}

const initialState = (): UiStoreState => ({
  pendingRequests: new Set<string>(),
  previousPageRoute: '',
});

const useUiStore = defineStore('uiStore', {
  state: initialState,

  actions: {
    reset() {
      Object.assign(this, initialState());
    },

    setRequestPending(val: PendingRequest): void {
      this.pendingRequests.add(val);
    },
    setRequestComplete(val: PendingRequest): void {
      this.pendingRequests.delete(val);
    },
    isRequestPending(val: PendingRequest): boolean {
      return this.pendingRequests.has(val);
    },
    anyRequestPending(vals: PendingRequest[]): boolean {
      return vals.some((val) => this.pendingRequests.has(val));
    },

    setPreviousPageRoute(route: string) {
      this.previousPageRoute = route;
    },
  },

  persist: {
    pick: ['previousPageRoute'],
  },
});

export default useUiStore;
