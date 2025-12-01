<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/session'
import { useToastStore } from '@/stores/toast'

const route = useRoute()
const router = useRouter()
const sessionStore = useSessionStore()
const toastStore = useToastStore()

onMounted(async () => {
  const code = route.query.code
  if (!code) {
    toastStore.addToast('Login failed: No code received', 'error')
    router.push('/')
    return
  }

  const success = await sessionStore.completeLogin(code)
  if (success) {
    toastStore.addToast('Welcome back!', 'success')
  } else {
    toastStore.addToast('Login failed', 'error')
  }
  router.push('/')
})
</script>

<template>
  <div class="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
    <div class="text-center">
      <div class="mb-4 text-4xl animate-bounce">🧙‍♂️</div>
      <h2 class="text-xl font-bold">Authenticating...</h2>
      <p class="text-slate-500">Please wait while we consult the scrolls.</p>
    </div>
  </div>
</template>
