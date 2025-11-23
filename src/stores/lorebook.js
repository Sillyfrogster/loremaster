import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useLorebookStore = defineStore('lorebook', () => {
  // --- State ---
  // Library Metadata: [{ id, name, lastEdited, entryCount }]
  const library = ref([])
  const currentLorebookId = ref(null)
  
  // Active Lorebook State
  const entries = ref([])
  const lorebookName = ref(null)
  
  // UI State
  const searchQuery = ref('')
  const isImporting = ref(false)

  // --- Helpers ---
  const generateId = () => 'book_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)

  const saveLibraryToStorage = () => {
    localStorage.setItem('loremaster_library', JSON.stringify(library.value))
  }

  const saveActiveBookToStorage = () => {
    if (!currentLorebookId.value) return
    localStorage.setItem(`loremaster_book_${currentLorebookId.value}`, JSON.stringify(entries.value))
  }

  const updateCurrentMeta = () => {
    if (!currentLorebookId.value) return
    const index = library.value.findIndex(b => b.id === currentLorebookId.value)
    if (index !== -1) {
      library.value[index] = {
        ...library.value[index],
        name: lorebookName.value,
        entryCount: entries.value.length,
        lastEdited: Date.now()
      }
      saveLibraryToStorage()
    }
  }

  // --- Actions ---

  const loadBook = (id) => {
    const bookMeta = library.value.find(b => b.id === id)
    if (!bookMeta) return false

    // Save current if we are switching away from a valid book
    // (Though watchers usually handle this, explicit save before switch is safer)
    if (currentLorebookId.value && currentLorebookId.value !== id) {
      saveActiveBookToStorage()
    }

    const savedData = localStorage.getItem(`loremaster_book_${id}`)
    try {
      let parsed = savedData ? JSON.parse(savedData) : []
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        parsed = Object.values(parsed)
      }
      entries.value = Array.isArray(parsed) ? parsed : []
    } catch (e) {
      console.error('Failed to load book data', e)
      entries.value = []
    }

    lorebookName.value = bookMeta.name
    currentLorebookId.value = id
    localStorage.setItem('loremaster_active_id', id)
    return true
  }

  const createLorebook = (name = 'New Lorebook', initialEntries = []) => {
    const newId = generateId()
    const newBook = {
      id: newId,
      name: name,
      entryCount: initialEntries.length,
      lastEdited: Date.now(),
      created: Date.now()
    }

    library.value.push(newBook)
    saveLibraryToStorage()
    
    // Set state
    currentLorebookId.value = newId
    lorebookName.value = name
    entries.value = initialEntries
    
    // Save initial data
    saveActiveBookToStorage()
    localStorage.setItem('loremaster_active_id', newId)
  }

  const deleteLorebook = (id) => {
    // Remove from library
    library.value = library.value.filter(b => b.id !== id)
    saveLibraryToStorage()
    
    // Remove data
    localStorage.removeItem(`loremaster_book_${id}`)

    // If deleting active book, switch to another or clear
    if (currentLorebookId.value === id) {
      if (library.value.length > 0) {
        loadBook(library.value[0].id)
      } else {
        currentLorebookId.value = null
        entries.value = []
        lorebookName.value = null
        localStorage.removeItem('loremaster_active_id')
      }
    }
  }

  // Import now creates a NEW book
  const loadLorebook = async (data, loreName) => {
    isImporting.value = true
    await new Promise(resolve => setTimeout(resolve, 800))

    let newEntries = data.entries || []
    if (newEntries && typeof newEntries === 'object' && !Array.isArray(newEntries)) {
      newEntries = Object.values(newEntries)
    }
    const finalEntries = Array.isArray(newEntries) ? newEntries : []
    console.log(loreName)
    const name = loreName || 'Imported Lorebook'

    createLorebook(name, finalEntries)
    isImporting.value = false
  }

  // --- Initialization ---
  const init = () => {
    const savedLib = localStorage.getItem('loremaster_library')
    
    if (savedLib) {
      try {
        library.value = JSON.parse(savedLib)
      } catch (e) {
        library.value = []
      }
    }

    // Migration Check: Old single-book format
    const oldEntries = localStorage.getItem('loremaster_entries')
    if (oldEntries && library.value.length === 0) {
      console.log("Migrating legacy data...")
      const oldName = localStorage.getItem('loremaster_name') || 'My Lorebook'
      try {
        let parsed = JSON.parse(oldEntries)
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          parsed = Object.values(parsed)
        }
        createLorebook(oldName, Array.isArray(parsed) ? parsed : [])
        // Clean up old keys
        localStorage.removeItem('loremaster_entries')
        localStorage.removeItem('loremaster_name')
        return // Created and loaded, so we are done
      } catch (e) {
        console.error("Migration failed", e)
      }
    }

    // Load active ID
    if (library.value.length > 0) {
      const lastActive = localStorage.getItem('loremaster_active_id')
      if (lastActive && library.value.find(b => b.id === lastActive)) {
        loadBook(lastActive)
      } else {
        // Fallback to first book
        loadBook(library.value[0].id)
      }
    }
  }

  init()

  // --- Watchers ---
  watch(entries, (newVal) => {
    if (currentLorebookId.value) {
      saveActiveBookToStorage()
      updateCurrentMeta() // Update count/date
    }
  }, { deep: true })

  watch(lorebookName, (newVal) => {
    if (currentLorebookId.value) {
      updateCurrentMeta() // Update name/date
    }
  })

  // --- Getters ---
  const filteredEntries = computed(() => {
    const currentEntries = entries.value
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

  const hasLorebook = computed(() => currentLorebookId.value !== null)

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
    // State
    library,
    currentLorebookId,
    entries,
    lorebookName,
    searchQuery,
    isImporting,
    // Getters
    filteredEntries,
    stats,
    hasLorebook,
    // Actions
    loadLorebook, // Import
    createLorebook,
    loadBook, // Switch
    deleteLorebook,
    addEntry,
    updateEntry,
    deleteEntry
  }
})