<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  entryData: Object // Can be null for new entry
})

const emit = defineEmits(['close', 'save', 'delete'])

// Tabs configuration
const activeTab = ref('general')
const tabs = [
  { id: 'general', label: 'General', icon: 'M4 6h16M4 12h16M4 18h7' },
  { id: 'triggers', label: 'Triggers', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { id: 'insertion', label: 'Insertion', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' },
  { id: 'filters', label: 'Filters', icon: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z' },
  { id: 'advanced', label: 'Advanced', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
]

// Form State
const form = ref({})

const defaultForm = () => ({
  uid: null,
  comment: '',
  content: '',
  keyStr: '',
  keySecStr: '',
  enabled: true,
  disabled: false,
  constant: false,
  selective: true,
  addMemo: true,
  caseSensitive: false,
  matchWholeWords: true,
  position: 0,
  order: 100,
  sticky: 0,
  cooldown: 0,
  delay: 0,
  useProbability: false,
  probability: 100,
  selectiveLogic: 0,
  excludeRecursion: false,
  preventRecursion: false,
  delayUntilRecursion: false,
  depth: 4,
  group: '',
  groupOverride: false,
  groupWeight: 100,
  role: '',
  automationId: '',
  ignoreBudget: false,
  matchPersonaDescription: false,
  matchCharacterDescription: false,
  matchCharacterPersonality: false,
  matchCharacterDepthPrompt: false,
  matchScenario: false,
  matchCreatorNotes: false,
  useGroupScoring: false,
  outletName: '',
  characterFilterNamesStr: '',
  characterFilterTagsStr: '',
  characterFilterIsExclude: false,
  scanDepth: ''
})

// Helper to process comma-separated strings
const arrayToString = (arr) => arr ? arr.join(', ') : ''
const stringToArray = (str) => str.split(',').map(s => s.trim()).filter(s => s)

// Initialize form when modal opens
watch(() => props.entryData, (newData) => {
  if (newData) {
    // Edit Mode
    const base = defaultForm()
    const cf = newData.characterFilter || {}
    form.value = {
      ...base,
      ...newData,
      enabled: newData.disabled === undefined ? true : !newData.disabled,
      keyStr: arrayToString(newData.key),
      keySecStr: arrayToString(newData.keysecondary),
      characterFilterNamesStr: arrayToString(cf.names),
      characterFilterTagsStr: arrayToString(cf.tags),
      characterFilterIsExclude: !!cf.isExclude,
      scanDepth: newData.scanDepth ?? ''
    }
  } else {
    // Create Mode (Defaults)
    form.value = defaultForm()
  }
  activeTab.value = 'general' // Reset to first tab on open
}, { immediate: true })

const handleSave = () => {
  const payload = {
    ...form.value,
    key: stringToArray(form.value.keyStr),
    keysecondary: stringToArray(form.value.keySecStr),
    characterFilter: {
      isExclude: form.value.characterFilterIsExclude,
      names: stringToArray(form.value.characterFilterNamesStr),
      tags: stringToArray(form.value.characterFilterTagsStr)
    },
    disabled: !form.value.enabled
  }
  // Remove temporary string helpers
  delete payload.keyStr
  delete payload.keySecStr
  delete payload.characterFilterNamesStr
  delete payload.characterFilterTagsStr
  delete payload.characterFilterIsExclude
  
  emit('save', payload)
}
</script>

<template>
  <Transition name="editor">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm p-4 sm:p-6">
      <div class="editor-content w-full max-w-5xl h-[85vh] bg-white dark:bg-bg-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
        
        <!-- Header -->
        <div class="h-16 px-6 border-b border-slate-200 dark:border-white/5 flex items-center justify-between bg-white dark:bg-bg-900 z-20 shrink-0">
          <div class="flex items-center gap-4">
            <div class="h-8 w-1 bg-accent rounded-full"></div>
            <div>
              <h2 class="text-lg font-bold text-slate-800 dark:text-white leading-tight">
                {{ form.uid ? 'Edit Entry' : 'New Entry' }}
              </h2>
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                  UID: {{ form.uid !== null ? form.uid : 'NEW' }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="flex items-center gap-4">
             <label class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
              <span class="text-xs font-semibold text-slate-600 dark:text-slate-300" :class="{ 'text-accent': form.enabled }">
                {{ form.enabled ? 'Enabled' : 'Disabled' }}
              </span>
              <div class="relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
                   :class="form.enabled ? 'bg-accent' : 'bg-slate-300 dark:bg-slate-700'">
                <input type="checkbox" v-model="form.enabled" class="sr-only">
                <span aria-hidden="true" class="pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out"
                      :class="form.enabled ? 'translate-x-4' : 'translate-x-0'"/>
              </div>
            </label>

            <div class="h-8 w-px bg-slate-200 dark:bg-white/10 mx-2"></div>

            <button v-if="form.uid !== null" @click="$emit('delete', form.uid)" class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all" title="Delete Entry">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
            </button>
            <button @click="$emit('close')" class="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-all" title="Close">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
            </button>
          </div>
        </div>

        <!-- Main Body -->
        <div class="flex-1 flex overflow-hidden">
          
          <!-- Sidebar Navigation -->
          <div class="w-20 sm:w-64 bg-slate-50 dark:bg-bg-950/30 border-r border-slate-200 dark:border-white/5 flex flex-col shrink-0">
            <nav class="flex-1 p-3 space-y-1 overflow-y-auto">
              <button 
                v-for="tab in tabs" 
                :key="tab.id"
                @click="activeTab = tab.id"
                class="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group"
                :class="activeTab === tab.id ? 'bg-white dark:bg-white/10 shadow-sm text-accent dark:text-white font-semibold' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-slate-200'"
              >
                <svg class="w-5 h-5 shrink-0 transition-colors" :class="activeTab === tab.id ? 'text-accent' : 'text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" :d="tab.icon" />
                </svg>
                <span class="hidden sm:block text-sm">{{ tab.label }}</span>
                <div v-if="activeTab === tab.id" class="ml-auto w-1.5 h-1.5 rounded-full bg-accent hidden sm:block"></div>
              </button>
            </nav>
            
            <div class="p-4 hidden sm:block">
               <div class="p-3 rounded-xl bg-accent/5 border border-accent/10 text-xs text-slate-600 dark:text-slate-400">
                <p class="font-bold text-accent mb-1">Tip:</p>
                <p v-if="activeTab === 'general'">Give your entry a descriptive label to find it easily later.</p>
                <p v-else-if="activeTab === 'triggers'">Use commas to separate multiple keywords.</p>
                <p v-else-if="activeTab === 'insertion'">Lower depth means inserted closer to the bottom (more recent).</p>
                <p v-else>Settings here are optional for most users.</p>
               </div>
            </div>
          </div>

          <!-- Content Area -->
          <div class="flex-1 overflow-y-auto bg-white dark:bg-bg-900 scroll-smooth">
            <div class="max-w-3xl mx-auto p-6 sm:p-10 space-y-8">
              
              <!-- Tab: General -->
              <div v-if="activeTab === 'general'" class="space-y-6 animate-fade-in">
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Entry Label</label>
                  <input 
                    v-model="form.comment" 
                    type="text" 
                    class="glass-input w-full px-4 py-3 rounded-xl text-lg font-medium placeholder-slate-300 dark:placeholder-slate-600" 
                    placeholder="e.g. The Ancient Dragon"
                  >
                </div>

                <div class="flex-1 flex flex-col min-h-[400px]">
                  <div class="flex items-center justify-between mb-2">
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider">Content</label>
                    <div class="flex items-center gap-3">
                       <label class="flex items-center gap-2 text-xs text-slate-500 cursor-pointer hover:text-accent transition-colors">
                        <input type="checkbox" v-model="form.addMemo" class="accent-accent w-3.5 h-3.5 rounded-sm">
                        Include Memo
                      </label>
                    </div>
                  </div>
                  <textarea 
                    v-model="form.content" 
                    class="glass-input w-full flex-1 p-5 rounded-xl text-sm leading-relaxed font-mono resize-none focus:ring-4 focus:ring-accent/10" 
                    placeholder="Write your lore content here..."
                  ></textarea>
                </div>
              </div>

              <!-- Tab: Triggers -->
              <div v-if="activeTab === 'triggers'" class="space-y-8 animate-fade-in">
                <div class="grid gap-6">
                  <div>
                    <label class="block text-xs font-bold text-accent uppercase tracking-wider mb-2">Primary Keywords</label>
                    <input v-model="form.keyStr" type="text" class="glass-input w-full px-4 py-3 rounded-xl text-sm font-mono text-accent" placeholder="dragon, fire, scales">
                    <p class="mt-2 text-[11px] text-slate-400">Main triggers that activate this entry. Comma separated.</p>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">Secondary Keywords</label>
                    <input v-model="form.keySecStr" type="text" class="glass-input w-full px-4 py-3 rounded-xl text-sm font-mono text-amber-600 dark:text-amber-500" placeholder="optional, extra, tags">
                    <p class="mt-2 text-[11px] text-slate-400">Additional triggers used with logic settings.</p>
                  </div>
                </div>

                <div class="h-px bg-slate-100 dark:bg-white/5"></div>

                <div class="space-y-4">
                  <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200">Activation Logic</h3>
                  
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                      <div class="flex items-center justify-between mb-2">
                         <span class="text-xs font-bold uppercase text-slate-500">Global Settings</span>
                      </div>
                      <div class="space-y-2">
                        <label class="flex items-center justify-between p-2 rounded hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors">
                          <span class="text-sm text-slate-700 dark:text-slate-300">Constant (Always On)</span>
                          <input type="checkbox" v-model="form.constant" class="accent-accent w-4 h-4">
                        </label>
                        <label class="flex items-center justify-between p-2 rounded hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors">
                          <span class="text-sm text-slate-700 dark:text-slate-300">Selective</span>
                          <input type="checkbox" v-model="form.selective" class="accent-accent w-4 h-4">
                        </label>
                      </div>
                    </div>

                     <div class="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                      <div class="flex items-center justify-between mb-2">
                         <span class="text-xs font-bold uppercase text-slate-500">Matching Rules</span>
                      </div>
                      <div class="space-y-2">
                         <label class="flex items-center justify-between p-2 rounded hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors">
                          <span class="text-sm text-slate-700 dark:text-slate-300">Case Sensitive</span>
                          <input type="checkbox" v-model="form.caseSensitive" class="accent-accent w-4 h-4">
                        </label>
                        <label class="flex items-center justify-between p-2 rounded hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors">
                          <span class="text-sm text-slate-700 dark:text-slate-300">Whole Words Only</span>
                          <input type="checkbox" v-model="form.matchWholeWords" class="accent-accent w-4 h-4">
                        </label>
                      </div>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <div>
                      <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Selective Logic</label>
                      <select v-model.number="form.selectiveLogic" class="glass-input w-full px-3 py-2.5 rounded-xl text-sm appearance-none">
                        <option :value="0">ANY trigger (OR)</option>
                        <option :value="1">ALL triggers (AND)</option>
                        <option :value="2">NONE triggers (NOT)</option>
                      </select>
                    </div>
                     <div>
                      <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Probability (%)</label>
                      <div class="flex items-center gap-3">
                         <input type="range" v-model.number="form.probability" min="0" max="100" class="flex-1 accent-accent h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer">
                         <input type="number" v-model.number="form.probability" class="glass-input w-16 px-2 py-1 text-center rounded-lg text-sm" min="0" max="100">
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tab: Insertion -->
              <div v-if="activeTab === 'insertion'" class="space-y-8 animate-fade-in">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div class="space-y-4">
                    <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-white/5 pb-2">Placement</h3>
                    <div>
                      <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Depth</label>
                      <input type="number" v-model.number="form.depth" class="glass-input w-full px-3 py-2 rounded-lg text-sm">
                      <p class="text-[10px] text-slate-400 mt-1">Lines from bottom of context.</p>
                    </div>
                     <div>
                      <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Order</label>
                      <input type="number" v-model.number="form.order" class="glass-input w-full px-3 py-2 rounded-lg text-sm">
                      <p class="text-[10px] text-slate-400 mt-1">Priority when multiple entries activate.</p>
                    </div>
                     <div>
                      <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Position</label>
                      <select v-model.number="form.position" class="glass-input w-full px-3 py-2 rounded-lg text-sm">
                        <option :value="0">Before Char Defs</option>
                        <option :value="1">After Char Defs</option>
                        <option :value="2">Author's Note</option>
                        <option :value="3">Top of Context</option>
                      </select>
                    </div>
                  </div>

                  <div class="space-y-4">
                    <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-white/5 pb-2">Timing</h3>
                     <div>
                      <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Sticky</label>
                      <input type="number" v-model.number="form.sticky" class="glass-input w-full px-3 py-2 rounded-lg text-sm">
                      <p class="text-[10px] text-slate-400 mt-1">Stays active for X turns.</p>
                    </div>
                     <div>
                      <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Cooldown</label>
                      <input type="number" v-model.number="form.cooldown" class="glass-input w-full px-3 py-2 rounded-lg text-sm">
                      <p class="text-[10px] text-slate-400 mt-1">Cannot reactivate for X turns.</p>
                    </div>
                     <div>
                      <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Delay</label>
                      <input type="number" v-model.number="form.delay" class="glass-input w-full px-3 py-2 rounded-lg text-sm">
                      <p class="text-[10px] text-slate-400 mt-1">Waits X turns before activating.</p>
                    </div>
                  </div>
                </div>
                
                <div>
                   <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-white/5 pb-2 mb-4">Scanner</h3>
                   <div>
                      <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Scan Depth</label>
                      <input type="number" v-model.number="form.scanDepth" class="glass-input w-full px-3 py-2 rounded-lg text-sm" placeholder="Leave blank for global default">
                      <p class="text-[10px] text-slate-400 mt-1">How far back in chat history to look for keywords.</p>
                   </div>
                </div>
              </div>

               <!-- Tab: Filters -->
              <div v-if="activeTab === 'filters'" class="space-y-8 animate-fade-in">
                 <div class="p-5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                    <div class="flex items-center justify-between mb-4">
                       <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200">Character Constraints</h3>
                       <label class="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer">
                          <input type="checkbox" v-model="form.characterFilterIsExclude" class="accent-accent w-4 h-4">
                          Exclude these characters
                       </label>
                    </div>
                    <div class="space-y-4">
                       <div>
                          <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Character Names</label>
                          <input v-model="form.characterFilterNamesStr" class="glass-input w-full px-3 py-2 rounded-lg text-sm font-mono" placeholder="Alice, Bob">
                       </div>
                       <div>
                          <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Character Tags</label>
                          <input v-model="form.characterFilterTagsStr" class="glass-input w-full px-3 py-2 rounded-lg text-sm font-mono" placeholder="female, elf">
                       </div>
                    </div>
                 </div>

                 <div class="space-y-4">
                    <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-white/5 pb-2">Context Matching</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                       <label class="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors">
                          <input type="checkbox" v-model="form.matchPersonaDescription" class="accent-accent w-4 h-4">
                          <span class="text-xs font-medium text-slate-700 dark:text-slate-300">Match Persona</span>
                       </label>
                       <label class="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors">
                          <input type="checkbox" v-model="form.matchCharacterDescription" class="accent-accent w-4 h-4">
                          <span class="text-xs font-medium text-slate-700 dark:text-slate-300">Match Char Description</span>
                       </label>
                        <label class="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors">
                          <input type="checkbox" v-model="form.matchCharacterPersonality" class="accent-accent w-4 h-4">
                          <span class="text-xs font-medium text-slate-700 dark:text-slate-300">Match Personality</span>
                       </label>
                        <label class="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors">
                          <input type="checkbox" v-model="form.matchCharacterDepthPrompt" class="accent-accent w-4 h-4">
                          <span class="text-xs font-medium text-slate-700 dark:text-slate-300">Match Depth Prompt</span>
                       </label>
                        <label class="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors">
                          <input type="checkbox" v-model="form.matchScenario" class="accent-accent w-4 h-4">
                          <span class="text-xs font-medium text-slate-700 dark:text-slate-300">Match Scenario</span>
                       </label>
                        <label class="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors">
                          <input type="checkbox" v-model="form.matchCreatorNotes" class="accent-accent w-4 h-4">
                          <span class="text-xs font-medium text-slate-700 dark:text-slate-300">Match Creator Notes</span>
                       </label>
                    </div>
                 </div>
              </div>

               <!-- Tab: Advanced -->
              <div v-if="activeTab === 'advanced'" class="space-y-8 animate-fade-in">
                 <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Recursion -->
                    <div class="space-y-4">
                       <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-white/5 pb-2">Recursion Prevention</h3>
                       <div class="space-y-2">
                           <label class="flex items-center justify-between p-2 rounded hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors">
                              <span class="text-sm text-slate-700 dark:text-slate-300">Exclude Recursion</span>
                              <input type="checkbox" v-model="form.excludeRecursion" class="accent-accent w-4 h-4">
                           </label>
                            <label class="flex items-center justify-between p-2 rounded hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors">
                              <span class="text-sm text-slate-700 dark:text-slate-300">Prevent Recursion</span>
                              <input type="checkbox" v-model="form.preventRecursion" class="accent-accent w-4 h-4">
                           </label>
                            <label class="flex items-center justify-between p-2 rounded hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors">
                              <span class="text-sm text-slate-700 dark:text-slate-300">Delay Until Recursion</span>
                              <input type="checkbox" v-model="form.delayUntilRecursion" class="accent-accent w-4 h-4">
                           </label>
                       </div>
                    </div>
                    
                    <!-- Budget & Misc -->
                     <div class="space-y-4">
                       <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-white/5 pb-2">Budget & Output</h3>
                       <div>
                          <label class="flex items-center justify-between p-2 rounded hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors">
                              <span class="text-sm text-slate-700 dark:text-slate-300">Ignore Budget</span>
                              <input type="checkbox" v-model="form.ignoreBudget" class="accent-accent w-4 h-4">
                           </label>
                       </div>
                       <div>
                          <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Outlet Name</label>
                          <input v-model="form.outletName" class="glass-input w-full px-3 py-2 rounded-lg text-sm" placeholder="Optional">
                       </div>
                    </div>
                 </div>

                 <!-- Grouping -->
                 <div class="space-y-4 pt-4 border-t border-slate-200 dark:border-white/5">
                    <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200">Groups & Automation</h3>
                    <div class="grid grid-cols-2 gap-4">
                       <div>
                          <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Group Name</label>
                          <input v-model="form.group" class="glass-input w-full px-3 py-2 rounded-lg text-sm">
                       </div>
                       <div>
                          <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Group Weight</label>
                          <input type="number" v-model.number="form.groupWeight" class="glass-input w-full px-3 py-2 rounded-lg text-sm">
                       </div>
                       <div>
                          <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Role</label>
                          <input v-model="form.role" class="glass-input w-full px-3 py-2 rounded-lg text-sm" placeholder="system">
                       </div>
                       <div>
                          <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Automation ID</label>
                          <input v-model="form.automationId" class="glass-input w-full px-3 py-2 rounded-lg text-sm">
                       </div>
                    </div>
                    <div class="flex items-center gap-6">
                       <label class="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer">
                          <input type="checkbox" v-model="form.useGroupScoring" class="accent-accent w-4 h-4">
                          Use Group Scoring
                       </label>
                       <label class="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer">
                          <input type="checkbox" v-model="form.groupOverride" class="accent-accent w-4 h-4">
                          Override Group
                       </label>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="h-20 bg-slate-50 dark:bg-bg-950/50 border-t border-slate-200 dark:border-white/5 flex items-center justify-end px-6 gap-4 shrink-0 z-20">
          <button @click="$emit('close')" class="px-6 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors hover:bg-slate-200/50 dark:hover:bg-white/5">Cancel</button>
          <button @click="handleSave" class="px-8 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-bold shadow-lg shadow-accent/20 hover:shadow-accent/40 hover:-translate-y-0.5 transition-all active:translate-y-0">
             {{ form.uid ? 'Save Changes' : 'Create Entry' }}
          </button>
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
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.editor-enter-from .editor-content,
.editor-leave-to .editor-content {
  opacity: 0;
  transform: scale(0.96) translateY(8px);
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
