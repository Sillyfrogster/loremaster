import { ref, computed } from 'vue'

// Create state outside the function to make it a Singleton (shared state across components)
const entries = ref([
  { uid: 1, comment: 'Magic System', key: ['magic', 'mana'], content: 'Magic rules...', enabled: true, constant: false, selective: true },
  { uid: 2, comment: 'The Void', key: ['void', 'darkness', 'abyss'], content: 'The Void consumes all.', enabled: true, constant: true, selective: false },
  // ... add more mock data here
])

const searchQuery = ref('')

export function useLorebook() {
  
  // Computed: Filter entries based on search
  const filteredEntries = computed(() => {
    if (!searchQuery.value) return entries.value
    const term = searchQuery.value.toLowerCase()
    return entries.value.filter(e => 
      e.comment.toLowerCase().includes(term) || 
      e.content.toLowerCase().includes(term) ||
      e.key.some(k => k.includes(term))
    )
  })

  // Computed: Statistics
  const stats = computed(() => {
    let active = 0, constant = 0, tokens = 0
    entries.value.forEach(e => {
      if (e.enabled) active++
      if (e.constant) constant++
      if (e.content) tokens += Math.round(e.content.length / 4)
    })
    return {
      total: entries.value.length,
      active,
      constant,
      tokens
    }
  })

  // Actions
  const addEntry = (entry) => {
    entries.value.push({ ...entry, uid: Date.now() })
  }

  const updateEntry = (updatedEntry) => {
    const index = entries.value.findIndex(e => e.uid === updatedEntry.uid)
    if (index !== -1) entries.value[index] = updatedEntry
  }

  const deleteEntry = (uid) => {
    entries.value = entries.value.filter(e => e.uid !== uid)
  }

  return {
    entries,
    filteredEntries,
    searchQuery,
    stats,
    addEntry,
    updateEntry,
    deleteEntry
  }
}