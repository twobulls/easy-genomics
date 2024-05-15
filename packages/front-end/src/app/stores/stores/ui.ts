import { defineStore } from 'pinia';

interface UiStoreState {
  isRequestPending: boolean;
}

const initialState = (): UiStoreState => ({
  isRequestPending: false,
});

const useUiStore = defineStore('uiStore', {
  state: initialState,

  actions: {
    setRequestPending(val: boolean) {
      this.isRequestPending = val;
    },
  },
});

export default useUiStore;
