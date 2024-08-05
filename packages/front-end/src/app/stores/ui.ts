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
});

export default useUiStore;
