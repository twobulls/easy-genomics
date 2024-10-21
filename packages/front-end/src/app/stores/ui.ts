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
  | 'updateUser'
  | 'getPipelines'
  | 'getWorkflows'
  | 'loadWorkflow'
  | 'createOrg'
  | 'fetchOrgData'
  | 'editOrg'
  | 'createLab'
  | 'updateLab'
  | 'getLabs'
  | 'deleteLab'
  | 'fetchOrgLabs'
  | 'fetchUserLabs'
  | 'loadLabData'
  | `addUserToLabButton-${string}-${string}`;

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

  getters: {
    isRequestPending:
      (state: UiStoreState) =>
      (val: PendingRequest): boolean =>
        state.pendingRequests.has(val),

    anyRequestPending:
      (state: UiStoreState) =>
      (vals: PendingRequest[]): boolean =>
        vals.some((val) => state.pendingRequests.has(val)),
  },

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

    setPreviousPageRoute(route: string) {
      this.previousPageRoute = route;
    },
  },

  persist: {
    pick: ['previousPageRoute'],
  },
});

export default useUiStore;
