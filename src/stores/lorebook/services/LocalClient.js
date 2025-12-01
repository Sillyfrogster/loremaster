// LocalStorage-backed implementation used when the user is not logged in.
import {
  buildLorebookMeta,
  generateBookId,
  generateEntryUid,
  normalizeEntries
} from '../utils'

const LIBRARY_KEY = 'loremaster_library'
const ACTIVE_KEY = 'loremaster_active_id'
const legacyKeys = {
  entries: 'loremaster_entries',
  name: 'loremaster_name'
}

const bookKey = (id) => `loremaster_book_${id}`

const safeParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback
  } catch (err) {
    console.error('Lorebook local parse failed', err)
    return fallback
  }
}

const saveLibrary = (library) => {
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(library))
}

const saveEntries = (id, entries) => {
  localStorage.setItem(bookKey(id), JSON.stringify(entries))
}

const loadEntries = (id) => {
  const raw = localStorage.getItem(bookKey(id))
  const parsed = safeParse(raw, [])
  return normalizeEntries(parsed)
}

const loadLibrary = () => safeParse(localStorage.getItem(LIBRARY_KEY), [])

const loadActiveId = () => localStorage.getItem(ACTIVE_KEY)

const setActiveId = (id) => {
  localStorage.setItem(ACTIVE_KEY, id)
}

const clearActiveId = () => {
  localStorage.removeItem(ACTIVE_KEY)
}

const migrateLegacyIfNeeded = () => {
  const library = loadLibrary()
  if (library.length > 0) return library

  const oldEntries = localStorage.getItem(legacyKeys.entries)
  if (!oldEntries) return library

  console.info('Migrating legacy single-lorebook data to new format')
  const parsedEntries = normalizeEntries(safeParse(oldEntries, []))
  const name = localStorage.getItem(legacyKeys.name) || 'My Lorebook'

  const newId = generateBookId()
  const meta = buildLorebookMeta(
    { id: newId, name, entries: parsedEntries },
    { entryCount: parsedEntries.length, lastEdited: Date.now(), created: Date.now() }
  )

  saveLibrary([meta])
  saveEntries(newId, parsedEntries)
  localStorage.removeItem(legacyKeys.entries)
  localStorage.removeItem(legacyKeys.name)
  setActiveId(newId)
  return [meta]
}

const ensureUid = (entry) => ({
  uid: entry.uid || generateEntryUid(),
  ...entry
})

const touchMeta = (meta, entries) =>
  buildLorebookMeta(meta, {
    entryCount: entries.length,
    lastEdited: Date.now()
  })

export const LocalClient = {
  bootstrap() {
    // Load library (plus optional legacy migration) and resolve the active book.
    const library = migrateLegacyIfNeeded()
    if (library.length === 0) {
      clearActiveId()
      return { library: [], book: null }
    }

    let activeId = loadActiveId()
    if (!activeId || !library.find((b) => b.id === activeId)) {
      activeId = library[0].id
      setActiveId(activeId)
    }

    const entries = loadEntries(activeId)
    const meta = library.find((b) => b.id === activeId)
    const book = meta ? { ...meta, entries } : null

    return { library, book }
  },

  createLorebook(name = 'New Lorebook', initialEntries = []) {
    const library = loadLibrary()
    const entries = normalizeEntries(initialEntries).map(ensureUid)
    const now = Date.now()
    const id = generateBookId()

    const meta = buildLorebookMeta(
      { id, name, entries },
      { entryCount: entries.length, lastEdited: now, created: now }
    )

    saveEntries(id, entries)
    saveLibrary([...library, meta])
    setActiveId(id)

    return { ...meta, entries }
  },

  setActiveId(id) {
    setActiveId(id)
  },

  clearActiveId() {
    clearActiveId()
  },

  loadBook(id) {
    const library = loadLibrary()
    const meta = library.find((b) => b.id === id)
    if (!meta) return null
    const entries = loadEntries(id)
    return { ...meta, entries }
  },

  deleteLorebook(id) {
    const library = loadLibrary().filter((b) => b.id !== id)
    saveLibrary(library)
    localStorage.removeItem(bookKey(id))

    const activeId = loadActiveId()
    if (activeId === id) {
      if (library.length > 0) {
        setActiveId(library[0].id)
      } else {
        clearActiveId()
      }
    }
  },

  renameLorebook(id, name) {
    const library = loadLibrary()
    const idx = library.findIndex((b) => b.id === id)
    if (idx === -1) return null
    const meta = touchMeta({ ...library[idx], name }, loadEntries(id))
    library[idx] = meta
    saveLibrary(library)
    return meta
  },

  addEntry(lorebookId, entry) {
    const book = this.loadBook(lorebookId)
    if (!book) throw new Error('Lorebook not found')
    const newEntry = ensureUid(entry)
    const updatedEntries = [...book.entries, newEntry]
    const meta = touchMeta(book, updatedEntries)

    saveEntries(lorebookId, updatedEntries)
    saveLibrary(
      loadLibrary().map((b) => (b.id === lorebookId ? meta : b))
    )
    return { entry: newEntry, lorebook: meta }
  },

  updateEntry(lorebookId, entry) {
    const book = this.loadBook(lorebookId)
    if (!book) throw new Error('Lorebook not found')

    const updatedEntries = book.entries.map((e) =>
      e.uid === entry.uid ? ensureUid(entry) : e
    )
    const savedEntry = updatedEntries.find((e) => e.uid === entry.uid)
    const meta = touchMeta(book, updatedEntries)

    saveEntries(lorebookId, updatedEntries)
    saveLibrary(
      loadLibrary().map((b) => (b.id === lorebookId ? meta : b))
    )
    return { entry: savedEntry, lorebook: meta }
  },

  deleteEntry(lorebookId, uid) {
    const book = this.loadBook(lorebookId)
    if (!book) throw new Error('Lorebook not found')
    const updatedEntries = book.entries.filter((e) => e.uid !== uid)
    const meta = touchMeta(book, updatedEntries)

    saveEntries(lorebookId, updatedEntries)
    saveLibrary(
      loadLibrary().map((b) => (b.id === lorebookId ? meta : b))
    )
    return { entry: null, lorebook: meta }
  }
}
