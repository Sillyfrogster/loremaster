import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const TOKEN_KEY = 'loremaster_session_token'
const USER_KEY = 'loremaster_user_info'
const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:5330'

export const useSessionStore = defineStore('session', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY))
  const user = ref(JSON.parse(localStorage.getItem(USER_KEY) || 'null'))

  const isLoggedIn = computed(() => Boolean(token.value))

  const initiateLogin = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/login/discord`)
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error('Failed to initiate login', err)
    }
  }

  const completeLogin = async (code) => {
    try {
      const res = await fetch(`${API_BASE}/auth/callback/discord`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })
      if (!res.ok) throw new Error('Login failed')
      
      const data = await res.json()
      token.value = data.access_token
      user.value = data.user
      
      localStorage.setItem(TOKEN_KEY, data.access_token)
      localStorage.setItem(USER_KEY, JSON.stringify(data.user))
      return true
    } catch (err) {
      console.error('Login error', err)
      return false
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  return {
    token,
    user,
    isLoggedIn,
    initiateLogin,
    completeLogin,
    logout
  }
})
