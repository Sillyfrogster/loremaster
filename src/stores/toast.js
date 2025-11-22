import { defineStore } from 'pinia';

export const useToastStore = defineStore('toast', {
  state: () => ({
    toasts: [],
    nextId: 0,
  }),
  actions: {
    addToast(message, type = 'info', duration = 3000, position = 'top-right') {
      const id = this.nextId++;
      this.toasts.push({ id, message, type, duration, position });

      // Automatically remove toast after its duration
      setTimeout(() => {
        this.removeToast(id);
      }, duration);
    },
    removeToast(id) {
      this.toasts = this.toasts.filter((toast) => toast.id !== id);
    },
  },
});
