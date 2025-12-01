import { defineStore } from 'pinia'
import { computed, watch } from 'vue'
import { useSessionStore } from '../session'
import { RemoteClient } from './services/RemoteClient'
import { LocalClient } from './services/LocalClient'
import { useLorebookState } from './state'
import { useLorebookGetters } from './getters'
import { useLorebookActions } from './actions'

export const useLorebookStore = defineStore('lorebook', () => {
  const sessionStore = useSessionStore()

  // --- State ---
  const state = useLorebookState()

  // --- Client / Mode ---
  const mode = computed(() => (sessionStore.isLoggedIn ? 'remote' : 'local'))
  const client = computed(() =>
    mode.value === 'remote' ? RemoteClient : LocalClient
  )

  // --- Actions ---
  const actions = useLorebookActions(state, client, mode)

  // --- Getters ---
  const getters = useLorebookGetters(state)

  // --- Watcher ---
  // Rehydrate whenever login state changes.
  watch(
    () => mode.value,
    () => {
      actions.hydrate()
    },
    { immediate: true }
  )

  return {
    ...state,
    ...getters,
    ...actions,
    mode
  }
})
