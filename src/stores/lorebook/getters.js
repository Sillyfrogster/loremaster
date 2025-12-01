import { computed } from 'vue'

export function useLorebookGetters(state) {
  const { entries, searchQuery, currentLorebookId } = state

  const filteredEntries = computed(() => {
    const currentEntries = entries.value
    if (!Array.isArray(currentEntries)) return []

    if (!searchQuery.value) return currentEntries
    const term = searchQuery.value.toLowerCase()
    return currentEntries.filter(
      (e) =>
        (e.comment && e.comment.toLowerCase().includes(term)) ||
        (e.content && e.content.toLowerCase().includes(term)) ||
        (e.key &&
          Array.isArray(e.key) &&
          e.key.some((k) => k.toLowerCase().includes(term)))
    )
  })

  const stats = computed(() => {
    let active = 0
    let constant = 0
    let tokens = 0
    const currentEntries = entries.value

    if (Array.isArray(currentEntries)) {
      currentEntries.forEach((e) => {
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

  return {
    filteredEntries,
    stats,
    hasLorebook
  }
}
