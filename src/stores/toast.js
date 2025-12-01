import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])
  const nextId = ref(0)

  const removeToast = (id) => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  const addToast = (message, type = 'info', duration = 3000, position = 'top-right') => {
    const id = nextId.value++
    toasts.value.push({ id, message, type, duration, position })

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }

  return { toasts, addToast, removeToast }
})

