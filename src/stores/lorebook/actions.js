import { LocalClient } from './services/LocalClient'
import { buildLorebookMeta, normalizeEntries } from './utils'

export function useLorebookActions(state, client, mode) {
  const { library, currentLorebookId, entries, lorebookName, isImporting } = state

  // --- Helpers ---
  const clearActiveState = () => {
    currentLorebookId.value = null
    lorebookName.value = null
    entries.value = []
  }

  const applyMetaUpdate = (bookLike) => {
    if (!bookLike) return
    const meta = buildLorebookMeta(bookLike)
    const existingIndex = library.value.findIndex((b) => b.id === meta.id)
    if (existingIndex === -1) {
      library.value.push(meta)
    } else {
      library.value[existingIndex] = { ...library.value[existingIndex], ...meta }
    }
    if (currentLorebookId.value === meta.id) {
      lorebookName.value = meta.name
    }
  }

  const hydrateFromBook = (book) => {
    applyMetaUpdate(book)
    entries.value = normalizeEntries(book.entries)
    lorebookName.value = book.name
    currentLorebookId.value = book.id
  }

  // --- Hydration ---
  const hydrateRemote = async () => {
    try {
      const data = await client.value.fetchLibrary()
      library.value = Array.isArray(data) ? data : []

      let activeId = null
      try {
        activeId = await client.value.fetchActiveId()
      } catch (err) {
        // If the server doesn't have an active ID (e.g. first run), we'll try to set one below.
        console.info('No active lorebook stored on server; using first available.')
      }

      // Fallback: If no active ID is set but we have books, default to the first one.
      if (!activeId && library.value.length > 0) {
        activeId = library.value[0].id
      }
      
      if (activeId) {
        const book = await client.value.loadBook(activeId)
        hydrateFromBook(book)
      } else {
        clearActiveState()
      }
    } catch (error) {
      console.error('Remote hydration failed; leaving state empty', error)
      library.value = []
      clearActiveState()
    }
  }

  const hydrateLocal = () => {
    const { library: lib, book } = LocalClient.bootstrap()
    library.value = lib
    if (book) {
      hydrateFromBook(book)
    } else {
      clearActiveState()
    }
  }

  const hydrate = async () => {
    if (mode.value === 'remote') {
      await hydrateRemote()
    } else {
      hydrateLocal()
    }
  }

  // --- Public Actions ---
  const loadBook = async (id) => {
    if (!id) return false
    try {
      if (mode.value === 'remote') {
        const book = await client.value.loadBook(id)
        hydrateFromBook(book)
        await client.value.setActiveId(id)
      } else {
        const book = client.value.loadBook(id)
        if (!book) return false
        hydrateFromBook(book)
        client.value.setActiveId(id)
      }
      return true
    } catch (error) {
      console.error('Failed to load lorebook', error)
      return false
    }
  }

  const createLorebook = async (name = 'New Lorebook', initialEntries = []) => {
    try {
      const book = await client.value.createLorebook(
        name,
        normalizeEntries(initialEntries)
      )
      hydrateFromBook(book)
      if (mode.value === 'remote') {
        await client.value.setActiveId(book.id)
      }
      return book.id
    } catch (error) {
      console.error('Failed to create lorebook', error)
      return null
    }
  }

  const deleteLorebook = async (id) => {
    if (!id) return false
    try {
      await client.value.deleteLorebook(id)
      library.value = library.value.filter((b) => b.id !== id)

      // If we deleted the currently active book, switch to another one or clear state.
      if (currentLorebookId.value === id) {
        const fallbackId = library.value[0]?.id || null
        if (fallbackId) {
          await loadBook(fallbackId)
        } else {
          clearActiveState()
          if (mode.value === 'remote') {
            await client.value.clearActiveId()
          }
        }
      }
      return true
    } catch (error) {
      console.error('Failed to delete lorebook', error)
      return false
    }
  }

  const loadLorebook = async (data, loreName) => {
    isImporting.value = true
    await new Promise((resolve) => setTimeout(resolve, 800))

    try {
      const finalEntries = normalizeEntries(data?.entries)
      await createLorebook(loreName || 'Imported Lorebook', finalEntries)
    } catch (error) {
      console.error('Failed to import lorebook', error)
    } finally {
      isImporting.value = false
    }
  }

  const addEntry = async (entry) => {
    if (!currentLorebookId.value) return false
    try {
      const payload = await client.value.addEntry(currentLorebookId.value, entry)
      if (payload?.entry) {
        entries.value.push(payload.entry)
      }
      applyMetaUpdate(payload?.lorebook)
      return true
    } catch (error) {
      console.error('Failed to add entry', error)
      return false
    }
  }

  const updateEntry = async (updatedEntry) => {
    if (!currentLorebookId.value) return false
    try {
      const payload = await client.value.updateEntry(
        currentLorebookId.value,
        updatedEntry
      )

      const index = entries.value.findIndex((e) => e.uid === updatedEntry.uid)
      if (index !== -1 && payload?.entry) {
        entries.value[index] = payload.entry
      }
      applyMetaUpdate(payload?.lorebook)
      return true
    } catch (error) {
      console.error('Failed to update entry', error)
      return false
    }
  }

  const deleteEntry = async (uid) => {
    if (!currentLorebookId.value) return false
    try {
      const payload = await client.value.deleteEntry(currentLorebookId.value, uid)
      entries.value = entries.value.filter((e) => e.uid !== uid)
      applyMetaUpdate(payload?.lorebook)
      return true
    } catch (error) {
      console.error('Failed to delete entry', error)
      return false
    }
  }

  return {
    hydrate,
    loadBook,
    createLorebook,
    deleteLorebook,
    loadLorebook,
    addEntry,
    updateEntry,
    deleteEntry
  }
}
