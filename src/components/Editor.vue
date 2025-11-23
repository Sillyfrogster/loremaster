<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  entryData: Object // Can be null for new entry
})

const emit = defineEmits(['close', 'save', 'delete'])

// Form State
const form = ref({})

// Helper to process comma-separated strings
const arrayToString = (arr) => arr ? arr.join(', ') : ''
const stringToArray = (str) => str.split(',').map(s => s.trim()).filter(s => s)

// Initialize form when modal opens
watch(() => props.entryData, (newData) => {
  if (newData) {
    // Edit Mode
    form.value = {
      ...newData,
      keyStr: arrayToString(newData.key),
      keySecStr: arrayToString(newData.keysecondary)
    }
  } else {
    // Create Mode (Defaults)
    form.value = {
      uid: null,
      comment: '',
      content: '',
      keyStr: '',
      keySecStr: '',
      disabled: false,
      constant: false,
      selective: true,
      caseSensitive: false,
      matchWholeWords: true,
      position: 0,
      order: 100,
      sticky: 0,
      cooldown: 0,
      delay: 0
    }
  }
}, { immediate: true })

const handleSave = () => {
  const payload = {
    ...form.value,
    key: stringToArray(form.value.keyStr),
    keysecondary: stringToArray(form.value.keySecStr)
  }
  // Remove temporary string helpers
  delete payload.keyStr
  delete payload.keySecStr
  
  emit('save', payload)
}
</script>

<template>
  <Transition name="editor">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 dark:bg-bg-950/80 backdrop-blur-md">
      <div class="editor-content w-full max-w-[90%] h-[90vh] bg-white dark:bg-bg-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
        
        <!-- Header -->
        <div class="h-16 px-8 border-b border-slate-200 dark:border-white/5 flex items-center justify-between bg-white dark:bg-bg-900 z-20">
          <div class="flex items-center gap-4">
            <div class="h-8 w-1 bg-accent rounded-full"></div>
            <h2 class="text-lg font-bold text-slate-800 dark:text-white">
              {{ form.uid ? 'Edit Node' : 'Create New Node' }}
            </h2>
            <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5">
              UID: {{ form.uid || 'NEW' }}
            </span>
          </div>
          
          <div class="flex items-center gap-4">
            <label class="flex items-center gap-3 cursor-pointer group">
              <span class="text-xs font-medium text-slate-500 group-hover:text-accent transition-colors">Enabled</span>
              <input type="checkbox" v-model="form.enabled" class="accent-accent w-4 h-4 cursor-pointer">
            </label>

            <div class="h-8 w-px bg-slate-200 dark:bg-white/10 mx-2"></div>

            <button v-if="form.uid" @click="$emit('delete', form.uid)" class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-400/10 rounded-lg transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
            </button>
            <button @click="$emit('close')" class="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
            </button>
          </div>
        </div>

        <!-- Split View Body -->
        <div class="flex-1 flex overflow-hidden">
          <!-- Left: Content Input -->
          <div class="w-[55%] p-8 overflow-y-auto border-r border-slate-200 dark:border-white/5 space-y-6 bg-white dark:bg-bg-900">
            <div>
              <label class="block text-xs font-bold text-accent uppercase tracking-wider mb-2">Entry Label</label>
              <input v-model="form.comment" type="text" class="glass-input w-full px-4 py-3 rounded-xl text-base font-medium placeholder-slate-400" placeholder="e.g. The Crystal Spire">
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Primary Keywords</label>
                <input v-model="form.keyStr" type="text" class="glass-input w-full px-4 py-2.5 rounded-xl text-sm font-mono text-accent" placeholder="keyword1, keyword2">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Secondary Keywords</label>
                <input v-model="form.keySecStr" type="text" class="glass-input w-full px-4 py-2.5 rounded-xl text-sm font-mono text-amber-500" placeholder="optional">
              </div>
            </div>

            <div class="h-px bg-slate-200 dark:bg-white/5 my-2"></div>

            <div class="flex-1 flex flex-col min-h-[400px]">
              <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Content</label>
              <textarea v-model="form.content" class="glass-input w-full h-full flex-1 p-5 rounded-xl text-sm leading-relaxed font-mono resize-none" placeholder="Write your lore entry here..."></textarea>
            </div>
          </div>

          <!-- Right: Advanced Logic -->
          <div class="w-[45%] bg-slate-50 dark:bg-bg-950/30 flex flex-col overflow-hidden">
            <div class="flex-1 overflow-y-auto p-8 space-y-8">
              
              <!-- Trigger Logic -->
              <div class="space-y-4">
                <h3 class="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-white/5">Trigger Logic</h3>
                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-3">
                     <!-- Reusable checkbox pattern -->
                    <label class="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 cursor-pointer">
                      <span class="text-xs font-medium text-slate-600 dark:text-slate-300">Always Active</span>
                      <input type="checkbox" v-model="form.constant" class="accent-accent w-4 h-4">
                    </label>
                    <label class="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 cursor-pointer">
                      <span class="text-xs font-medium text-slate-600 dark:text-slate-300">Selective</span>
                      <input type="checkbox" v-model="form.selective" class="accent-accent w-4 h-4">
                    </label>
                  </div>
                  <div class="space-y-3">
                    <label class="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 cursor-pointer">
                      <span class="text-xs font-medium text-slate-600 dark:text-slate-300">Case Sensitive</span>
                      <input type="checkbox" v-model="form.caseSensitive" class="accent-accent w-4 h-4">
                    </label>
                    <label class="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 cursor-pointer">
                      <span class="text-xs font-medium text-slate-600 dark:text-slate-300">Whole Words</span>
                      <input type="checkbox" v-model="form.matchWholeWords" class="accent-accent w-4 h-4">
                    </label>
                  </div>
                </div>
              </div>

              <!-- Timers -->
              <div class="space-y-4">
                <h3 class="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-white/5">Timing</h3>
                <div class="grid grid-cols-3 gap-4">
                    <div><label class="block text-[10px] uppercase font-bold text-slate-400 mb-1">Sticky</label><input type="number" v-model="form.sticky" class="glass-input w-full px-2 py-1.5 rounded-lg text-xs"></div>
                    <div><label class="block text-[10px] uppercase font-bold text-slate-400 mb-1">Cooldown</label><input type="number" v-model="form.cooldown" class="glass-input w-full px-2 py-1.5 rounded-lg text-xs"></div>
                    <div><label class="block text-[10px] uppercase font-bold text-slate-400 mb-1">Delay</label><input type="number" v-model="form.delay" class="glass-input w-full px-2 py-1.5 rounded-lg text-xs"></div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="h-16 bg-slate-50 dark:bg-bg-950/50 border-t border-slate-200 dark:border-white/5 flex items-center justify-end px-8 gap-4">
          <button @click="$emit('close')" class="px-6 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Cancel</button>
          <button @click="handleSave" class="px-8 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-bold shadow-lg shadow-accent/20">Save Configuration</button>
        </div>

      </div>
    </div>
  </Transition>
</template>

<style scoped>
.editor-enter-active,
.editor-leave-active {
  transition: opacity 0.3s ease;
}

.editor-enter-from,
.editor-leave-to {
  opacity: 0;
}

.editor-enter-active .editor-content,
.editor-leave-active .editor-content {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.editor-enter-from .editor-content,
.editor-leave-to .editor-content {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}
</style>