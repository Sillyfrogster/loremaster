<script setup>
import { computed } from 'vue'
import { useLorebookStore } from '@/stores/lorebook'
import { storeToRefs } from 'pinia'

const props = defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close'])

const store = useLorebookStore()
const { library, currentLorebookId } = storeToRefs(store)
const { loadBook, createLorebook, deleteLorebook } = store

const sortedLibrary = computed(() => {
  return [...library.value].sort((a, b) => b.lastEdited - a.lastEdited)
})

const formatDate = (ts) => {
  return new Date(ts).toLocaleDateString(undefined, { 
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
  })
}

const handleSwitch = (id) => {
  loadBook(id)
  emit('close')
}

const handleCreate = () => {
  createLorebook('New Lorebook')
  emit('close')
}

const handleDelete = (e, id) => {
  e.stopPropagation() // Prevent triggering switch
  if (confirm("Permanently delete this lorebook? This cannot be undone.")) {
    deleteLorebook(id)
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 cubic-bezier(0.16, 1, 0.3, 1)"
      enter-from-class="opacity-0 scale-95 blur-sm"
      enter-to-class="opacity-100 scale-100 blur-0"
      leave-active-class="transition duration-200 cubic-bezier(0.16, 1, 0.3, 1)"
      leave-from-class="opacity-100 scale-100 blur-0"
      leave-to-class="opacity-0 scale-95 blur-sm"
    >
      <div v-if="isOpen" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md transition-opacity" @click="$emit('close')"></div>

        <!-- Modal Content -->
        <div class="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-white/10 flex flex-col max-h-[80vh] transform shadow-black/20">
          
          <!-- Header -->
          <div class="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
            <div>
              <h2 class="text-xl font-bold text-slate-900 dark:text-white">Your Library</h2>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage your collection of lorebooks</p>
            </div>
            <button @click="handleCreate" class="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-bold shadow-lg shadow-accent/20 transition-all flex items-center gap-2 transform active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
              Create New
            </button>
          </div>

          <!-- List -->
          <div class="overflow-y-auto p-4 space-y-3">
            <div v-if="library.length === 0" class="text-center py-12 text-slate-400">
              No lorebooks found. Create one to get started!
            </div>

            <div 
              v-for="book in sortedLibrary" 
              :key="book.id"
              @click="handleSwitch(book.id)"
              class="group relative p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md flex items-center justify-between gap-4"
              :class="[
                book.id === currentLorebookId 
                  ? 'bg-accent/5 border-accent/50 ring-1 ring-accent/20' 
                  : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-white/5 hover:border-accent/30 hover:bg-slate-50 dark:hover:bg-white/5'
              ]"
            >
              <!-- Content -->
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold shadow-sm transition-all duration-300"
                  :class="book.id === currentLorebookId ? 'bg-accent text-white shadow-accent/30 scale-105' : 'bg-slate-100 dark:bg-white/10 text-slate-400 group-hover:text-accent group-hover:bg-accent/10'"
                >
                  {{ book.name.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <h3 class="font-bold text-slate-900 dark:text-white group-hover:text-accent transition-colors flex items-center gap-2">
                    {{ book.name }}
                    <span v-if="book.id === currentLorebookId" class="text-[10px] bg-accent text-white px-2 py-0.5 rounded-full uppercase tracking-wide font-bold shadow-sm shadow-accent/20">Active</span>
                  </h3>
                  <div class="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span class="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3">
                        <path fill-rule="evenodd" d="M10 2a.75.75 0 01.75.75v7.5a.75.75 0 01-1.5 0v-7.5A.75.75 0 0110 2zM5.404 4.343a.75.75 0 010 1.06 6.5 6.5 0 119.192 9.193 6.5 6.5 0 01-9.192-9.193.75.75 0 011.06 0z" clip-rule="evenodd" />
                      </svg>
                      {{ formatDate(book.lastEdited) }}
                    </span>
                    <span class="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3">
                        <path fill-rule="evenodd" d="M10 1c3.866 0 7 1.79 7 4s-3.134 4-7 4-7-1.79-7-4 3.134-4 7-4zm0 2c1.93 0 3.5.615 3.5 1.5S11.93 6 10 6 6.5 5.385 6.5 4.5 8.07 3 10 3z" clip-rule="evenodd" />
                        <path d="M6.5 7.5c0 .885 1.57 1.615 3.5 1.615s3.5-.73 3.5-1.615v2c0 .885-1.57 1.615-3.5 1.615s-3.5-.73-3.5-1.615v-2z" />
                        <path d="M6.5 12.5c0 .885 1.57 1.615 3.5 1.615s3.5-.73 3.5-1.615v2c0 .885-1.57 1.615-3.5 1.615s-3.5-.73-3.5-1.615v-2z" />
                      </svg>
                      {{ book.entryCount }} entries
                    </span>
                  </div>
                </div>
              </div>

              <!-- Delete Action -->
              <button 
                @click="(e) => handleDelete(e, book.id)"
                class="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all"
                title="Delete Lorebook"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          </div>

          <div class="p-4 bg-slate-50 dark:bg-white/5 border-t border-slate-200 dark:border-white/10 text-center">
            <button @click="$emit('close')" class="text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors">
              Close Library
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>