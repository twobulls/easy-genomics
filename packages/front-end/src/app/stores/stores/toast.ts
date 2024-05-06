import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';

const initialState = (): State => ({
  toasts: [],
});

const useToastStore = defineStore('toastStore', {
  state: initialState,

  actions: {
    remove(id: string) {
      this.toasts = this.toasts.filter((toast) => toast.id !== id);
    },

    info(title: string) {
      this.toasts.push({ id: `toast-${uuidv4()}`, title: title, variant: 'info' });
    },
    success(title: string) {
      this.toasts.push({ id: `toast-${uuidv4()}`, title: title, variant: 'success' });
    },
    warning(title: string) {
      this.toasts.push({ id: `toast-${uuidv4()}`, title: title, variant: 'warning' });
    },
    error(title: string) {
      this.toasts.push({ id: `toast-${uuidv4()}`, title: title, variant: 'error' });
    },
  },
});

export default useToastStore;
