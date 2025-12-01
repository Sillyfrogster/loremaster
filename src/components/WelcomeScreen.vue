<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useLorebookStore } from '@/stores/lorebook'
import { useSessionStore } from '@/stores/session'
import { useToastStore } from '@/stores/toast'

const lorebookStore = useLorebookStore()
const { createLorebook, loadLorebook } = lorebookStore
const sessionStore = useSessionStore()
const { isLoggedIn } = storeToRefs(sessionStore)
const toastStore = useToastStore()
const fileInput = ref(null)

const handleCreate = () => {
  createLorebook('New Lorebook')
  toastStore.addToast('New lorebook created!', 'success')
}

const triggerImport = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const handleImport = (event) => {
  let file = event.target.files?.[0]
  let type = "application/json"

  if(!file) return
  if(file.type != type) return toastStore.addToast('Please select a lorebook. (JSON)', 'error');

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      let parsedFile = JSON.parse(e.target.result)
      if(!parsedFile.entries) {
        return toastStore.addToast('Invalid Lorebook.', 'error')
      }
      loadLorebook(parsedFile, file.name.replace(/\.json$/i, ''))
      toastStore.addToast('Lorebook imported successfully!', 'success')
    } catch (err) {
      toastStore.addToast('Error parsing JSON.', 'error')
    }
  }
  reader.readAsText(file)
  event.target.value = ''
}

const handleLogin = () => {
  sessionStore.initiateLogin()
}
</script>

<template>
  <div class="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
    <div class="max-w-md w-full glass-panel p-8 rounded-2xl flex flex-col items-center text-center space-y-6 animate-fade-in-up">
      <div class="w-24 h-24 flex items-center justify-center mb-2">
        <img src="/logo.png" alt="Loremaster Logo" class="w-full h-full object-contain drop-shadow-xl animate-float" />
      </div>
      
      <div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">Welcome to Loremaster</h2>
        <p class="text-slate-500 dark:text-slate-400 text-sm">
          {{ isLoggedIn ? "Manage your lorebooks in the cloud." : "Login to sync your lorebooks or continue locally." }}
        </p>
      </div>

      <div class="flex flex-col w-full gap-3">
        <template v-if="!isLoggedIn">
           <button @click="handleLogin" class="w-full py-3 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold shadow-lg shadow-[#5865F2]/25 hover:translate-y-[-1px] transition-all flex items-center justify-center gap-2">
            <!-- Discord Icon -->
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 127.14 96.36" fill="currentColor"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.11,77.11,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.89,105.89,0,0,0,126.6,80.22c2.91-23.29-1.55-47.5-18.9-72.15ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/></svg>
            Login with Discord
          </button>
           <div class="relative flex py-2 items-center">
            <div class="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
            <span class="flex-shrink-0 mx-4 text-slate-400 text-xs">OR</span>
            <div class="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
          </div>
        </template>

        <button @click="handleCreate" class="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-bold shadow-lg shadow-accent/25 hover:translate-y-[-1px] transition-all flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          Create New Lorebook
        </button>

        <button @click="triggerImport" class="w-full py-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 font-bold transition-all flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          Import from JSON
        </button>
        <input ref="fileInput" type="file" accept=".json, application/json" class="hidden" @change="handleImport"/>
      </div>
    </div>
  </div>
</template>