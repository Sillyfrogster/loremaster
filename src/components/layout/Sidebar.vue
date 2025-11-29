<script setup>
import { useLorebookStore } from '@/stores/lorebook'
import { storeToRefs } from 'pinia'

const lorebookStore = useLorebookStore()
const { searchQuery, stats, lorebookName } = storeToRefs(lorebookStore)

// Emit event to open the modal in "Create" mode
const emit = defineEmits(['open-create'])
</script>

<template>
  <aside class="w-72 p-6 flex flex-col gap-5 shrink-0 overflow-y-auto border-r-0 border-slate-200 dark:border-white/5 h-full">
    
    <!-- Search -->
    <div class="glass-panel p-1 rounded-xl">
      <div class="relative">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 absolute left-3 top-2.5 text-slate-400">
          <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
        </svg>
        <!-- v-model connects to the Composable's searchQuery state -->
        <input v-model="searchQuery" type="text" placeholder="Search for entries..." class="w-full bg-transparent text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 text-xs font-medium py-2.5 pl-9 pr-3 rounded-lg outline-none focus:bg-slate-100 dark:focus:bg-white/5 transition-colors">
      </div>
    </div>
    <div class="glass-panel rounded-xl p-4 space-y-2">
      <div class="flex justify-between items-end mb-1">
        <h3 class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Active Book</h3>
      </div>
      
      <div class="flex gap-2">
        <div class="glass-input w-full px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200">
          {{ lorebookName || 'No Lorebook Selected' }}
        </div>
      </div>
    </div>
    <!-- Stats Dashboard -->
    <div class="glass-panel rounded-xl p-5 space-y-4">
      <h3 class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
        Lorebook Info
      </h3>
      
      <div class="grid grid-cols-2 gap-3">
        <div class="bg-slate-100 dark:bg-white/5 rounded-lg p-3 border border-slate-200 dark:border-white/5">
          <div class="text-[10px] text-slate-500 dark:text-slate-400 mb-1">Entries</div>
          <div class="text-xl font-bold text-slate-800 dark:text-white">{{ stats.total }}</div>
        </div>
        <div class="bg-slate-100 dark:bg-white/5 rounded-lg p-3 border border-slate-200 dark:border-white/5">
          <div class="text-[10px] text-slate-500 dark:text-slate-400 mb-1">Tokens</div>
          <div class="text-xl font-bold text-accent">{{ stats.tokens }}</div>
        </div>
      </div>
      
      <div class="space-y-2 pt-2 border-t border-slate-200 dark:border-white/5">
        <div class="flex justify-between text-xs">
          <span class="text-slate-500">Active</span>
          <span class="text-green-600 dark:text-green-400 font-mono">{{ stats.active }}</span>
        </div>
        <div class="flex justify-between text-xs">
          <span class="text-slate-500">Constant</span>
          <span class="text-amber-600 dark:text-gold font-mono">{{ stats.constant }}</span>
        </div>
      </div>
    </div>

    <button @click="$emit('open-create')" class="mt-auto w-full py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-bold shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:scale-[1.02] active:scale-[0.98] transition-all border border-accent/30 flex items-center justify-center gap-2 group">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 group-hover:rotate-90 transition-transform">
        <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
      </svg>
      Create Entry
    </button>

  </aside>
</template>
