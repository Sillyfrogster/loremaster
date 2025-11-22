<script setup>
import { useTheme } from '@/composables/useTheme'
import { ref } from 'vue'

const loreBook = ref(null)

const triggerImport = () => {
  if (loreBook.value) {
    loreBook.value.click()
  }
  console.log(loreBook);
}
// Destructure the theme logic
const { isDark, toggleTheme } = useTheme()
</script>

<template>
  <header class="h-16 shrink-0 glass-panel z-30 relative border-b-0 border-b border-slate-200 dark:border-white/5">
    <div class="max-w-[1800px] mx-auto h-full px-6 flex items-center justify-between">
      
      <!-- Logo Section -->
      <div class="flex items-center gap-4">
        <div class="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shadow-lg text-white">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
            <path d="M11.25 4.533A9.707 9.707 0 006 3.75a9.753 9.753 0 00-3.25.557.75.75 0 00-.455.718v8.714a.75.75 0 00.455.718A9.754 9.754 0 016 15a9.754 9.754 0 015.25-1.533V4.533zm1.5 0c1.636 0 3.136.362 4.5.973V13.467A9.754 9.754 0 0012 15a9.754 9.754 0 00-5.25-1.533v-8.96c1.364-.61 2.864-.973 4.5-.973zm1.5-.973A9.753 9.753 0 0118 3.75c1.494 0 2.87.322 4.106.902.298.14.494.444.494.777v10.446c0 .78-.922 1.333-1.636.98a9.74 9.74 0 01-2.964-1.02V6.033a.75.75 0 00-.45-.718 8.21 8.21 0 00-3.55-.755z" />
          </svg>
        </div>
        <div class="flex flex-col">
          <h1 class="font-bold text-base tracking-tight text-slate-900 dark:text-white">Lorebook<span class="text-accent">Manager</span></h1>
          <span class="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">V4.0 Edition</span>
        </div>
      </div>

      <!-- Controls -->
      <div class="flex items-center gap-3">
        <button @click="toggleTheme" class="h-9 w-9 rounded-lg bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-all">
          <!-- Icons handled by v-if/v-else based on state -->
          <svg v-if="!isDark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
             <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
          </svg>
        </button>

        <!-- hidden file selector -->
        <input ref="loreBook" type="file" accept=".json, application/json" class="hidden"/>

        <!-- import -->
        <button @click="triggerImport" class="h-9 px-3 rounded-lg bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-medium transition-all flex items-center gap-2 text-xs border border-transparent dark:border-white/5">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          Import JSON
        </button>

        <!-- export -->
        <button class="h-9 px-4 rounded-lg bg-accent hover:bg-accent-hover text-white font-medium transition-all shadow-lg shadow-accent/20 flex items-center gap-2 hover:-translate-y-0.5 text-xs">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
            <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.965 3.129V2.75z" />
            <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
          </svg>
          Export
        </button>
      </div>
    </div>
  </header>
</template>