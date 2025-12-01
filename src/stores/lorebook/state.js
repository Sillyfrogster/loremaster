import { ref } from 'vue'

export function useLorebookState() {
  const library = ref([]) // [{ id, name, entryCount, lastEdited, created }]
  const currentLorebookId = ref(null)
  const entries = ref([])
  const lorebookName = ref(null)
  const searchQuery = ref('')
  const isImporting = ref(false)

  return {
    library,
    currentLorebookId,
    entries,
    lorebookName,
    searchQuery,
    isImporting
  }
}
