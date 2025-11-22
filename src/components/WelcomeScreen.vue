<script setup>
import { ref } from 'vue'
import { useLorebookStore } from '@/stores/lorebook'
import { useToastStore } from '@/stores/toast'

const lorebookStore = useLorebookStore()
const { createLorebook, loadLorebook } = lorebookStore
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
      loadLorebook(parsedFile)
      toastStore.addToast('Lorebook imported successfully!', 'success')
    } catch (err) {
      toastStore.addToast('Error parsing JSON.', 'error')
    }
  }
  reader.readAsText(file)
  event.target.value = ''
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
        <p class="text-slate-500 dark:text-slate-400 text-sm">Create a new lorebook or import an existing one to get started managing your world's knowledge.</p>
      </div>

      <div class="flex flex-col w-full gap-3">
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