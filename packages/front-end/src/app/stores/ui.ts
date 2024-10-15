import { defineStore } from 'pinia';

interface UiStoreState {
  isRequestPending: boolean;
  previousPageRoute: string;
}

const initialState = (): UiStoreState => ({
  isRequestPending: false,
  previousPageRoute: '',
});

const useUiStore = defineStore('uiStore', {
  state: initialState,

  actions: {
    // TODO: make this a keyed dict
    setRequestPending(val: boolean) {
      this.isRequestPending = val;
    },
    setPreviousPageRoute(route: string) {
      this.previousPageRoute = route;
    },
    reset() {
      Object.assign(this, initialState());
    },
  },
  persist: {
    paths: ['previousPageRoute'],
  },
});

export default useUiStore;
