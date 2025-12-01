// Shared helpers for lorebook data transformations and ID generation.

// Frontend + backend both use this ID shape; keep consistent so imports/export work.
export const generateBookId = () =>
  'book_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8)

// Lore entries rely on a numeric UID in the UI layer (Card.vue, Editor.vue).
export const generateEntryUid = () => Date.now()

// Local/remote imports sometimes hand us objects instead of arrays; normalize them.
export const normalizeEntries = (rawEntries) => {
  if (!rawEntries) return []
  if (Array.isArray(rawEntries)) return rawEntries
  if (typeof rawEntries === 'object') return Object.values(rawEntries)
  return []
}

// Keep a consistent metadata shape and allow partial overrides (e.g., on updates).
export const buildLorebookMeta = (base = {}, overrides = {}) => ({
  id: base.id,
  name: base.name ?? 'New Lorebook',
  entryCount:
    overrides.entryCount ??
    (Array.isArray(base.entries) ? base.entries.length : base.entryCount ?? 0),
  lastEdited: overrides.lastEdited ?? base.lastEdited ?? Date.now(),
  created: overrides.created ?? base.created ?? Date.now()
})
