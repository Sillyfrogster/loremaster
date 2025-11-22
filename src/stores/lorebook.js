import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useLorebookStore = defineStore('lorebook', () => {
  // State
  const entries = ref([])
  const lorebookName = ref(null)
  const searchQuery = ref('')
  const isImporting = ref(false)

  // Persistence: Load initial state
  const init = () => {
    const savedEntries = localStorage.getItem('loremaster_entries')
    const savedName = localStorage.getItem('loremaster_name')
    
    if (savedEntries) {
      try {
        let parsed = JSON.parse(savedEntries)
        // Normalize: Convert object-based entries to array if necessary
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          parsed = Object.values(parsed)
        }
        entries.value = Array.isArray(parsed) ? parsed : []
      } catch (e) {
        console.error('Failed to parse saved entries', e)
        entries.value = []
      }
    }
    
    if (savedName) {
      lorebookName.value = savedName
    }
  }
  
  // Initialize immediately
  init()

  // Persistence: Watch for changes
  watch(entries, (newEntries) => {
    localStorage.setItem('loremaster_entries', JSON.stringify(newEntries))
  }, { deep: true })

  watch(lorebookName, (newName) => {
    if (newName) {
      localStorage.setItem('loremaster_name', newName)
    } else {
      localStorage.removeItem('loremaster_name')
    }
  })

  // Getters (Computed)
  const filteredEntries = computed(() => {
    const currentEntries = entries.value
    // Safety check: ensure entries is an array
    if (!Array.isArray(currentEntries)) return []

    if (!searchQuery.value) return currentEntries
    const term = searchQuery.value.toLowerCase()
    return currentEntries.filter(e => 
      (e.comment && e.comment.toLowerCase().includes(term)) || 
      (e.content && e.content.toLowerCase().includes(term)) ||
      (e.key && Array.isArray(e.key) && e.key.some(k => k.toLowerCase().includes(term)))
    )
  })

  const stats = computed(() => {
    let active = 0, constant = 0, tokens = 0
    const currentEntries = entries.value

    if (Array.isArray(currentEntries)) {
      currentEntries.forEach(e => {
        if (e.enabled) active++
        if (e.constant) constant++
        if (e.content) tokens += Math.round(e.content.length / 4)
      })
    }
    return {
      total: Array.isArray(currentEntries) ? currentEntries.length : 0,
      active,
      constant,
      tokens
    }
  })

  const hasLorebook = computed(() => lorebookName.value !== null)

  // Actions
  const loadLorebook = async (data) => {
    isImporting.value = true
    
    // Simulate a small delay for the animation to be perceivable if the operation is too fast,
    // or strictly to show off the "slick" animation.
    await new Promise(resolve => setTimeout(resolve, 800))

    let newEntries = data.entries || []
    // Normalize: Convert object-based entries to array if necessary
    if (newEntries && typeof newEntries === 'object' && !Array.isArray(newEntries)) {
      newEntries = Object.values(newEntries)
    }

    entries.value = Array.isArray(newEntries) ? newEntries : []
    lorebookName.value = data.name || 'Untitled Lorebook'
    
    isImporting.value = false
  }

  const createLorebook = (name) => {
    entries.value = []
    lorebookName.value = name || 'New Lorebook'
  }

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
    lorebookName,
    searchQuery,
    isImporting,
    filteredEntries,
    stats,
    hasLorebook,
    loadLorebook,
    createLorebook,
    addEntry,
    updateEntry,
    deleteEntry
  }
})