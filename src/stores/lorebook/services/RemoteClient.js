// REST client for the FastAPI backend.
import { normalizeEntries } from '../utils'

export const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:5330'

const apiRequest = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers || {})
    },
    ...options
  })

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const payload = isJson ? await response.json() : null

  if (!response.ok) {
    const message = payload?.detail || payload?.message || response.statusText
    throw new Error(message)
  }

  return payload
}

export const RemoteClient = {
  async fetchLibrary() {
    return apiRequest('/lorebooks')
  },

  async fetchActiveId() {
    const data = await apiRequest('/active-lorebook')
    return data?.activeId ?? null
  },

  async setActiveId(id) {
    return apiRequest(`/active-lorebook/${id}`, { method: 'PUT' })
  },

  async clearActiveId() {
    return apiRequest('/active-lorebook', { method: 'DELETE' })
  },

  async loadBook(id) {
    const book = await apiRequest(`/lorebooks/${id}`)
    return { ...book, entries: normalizeEntries(book.entries) }
  },

  async createLorebook(name, entries = []) {
    const book = await apiRequest('/lorebooks', {
      method: 'POST',
      body: JSON.stringify({ name, entries })
    })
    return { ...book, entries: normalizeEntries(book.entries) }
  },

  async deleteLorebook(id) {
    await apiRequest(`/lorebooks/${id}`, { method: 'DELETE' })
  },

  async renameLorebook(id, name) {
    return apiRequest(`/lorebooks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name })
    })
  },

  async addEntry(lorebookId, entry) {
    return apiRequest(`/lorebooks/${lorebookId}/entries`, {
      method: 'POST',
      body: JSON.stringify(entry)
    })
  },

  async updateEntry(lorebookId, entry) {
    return apiRequest(`/lorebooks/${lorebookId}/entries/${entry.uid}`, {
      method: 'PUT',
      body: JSON.stringify(entry)
    })
  },

  async deleteEntry(lorebookId, uid) {
    return apiRequest(`/lorebooks/${lorebookId}/entries/${uid}`, {
      method: 'DELETE'
    })
  }
}
