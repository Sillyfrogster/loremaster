<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  entryData: Object
})

const emit = defineEmits(['close', 'save', 'delete'])

// Reactive form state matching the UI inputs. 
// We use a flat structure here for easier v-model binding, 
// but convert to/from the nested JSON structure during save/load.
const form = ref({})

// Returns the default state for a new entry.
// Includes all supported fields with their default values to ensure reactivity.
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

// Helpers for converting between comma-separated strings (UI) and arrays (JSON).
const arrayToString = (arr) => (arr ? arr.join(', ') : '')
const stringToArray = (str) => str.split(',').map(s => s.trim()).filter(Boolean)

// Hydrate the form when entryData changes (e.g. opening the editor).
watch(() => props.entryData, (newData) => {
  if (newData) {
    const base = defaultForm()
    // Character filters are nested objects in the JSON, so we flatten them for the form.
    const cf = newData.characterFilter || {}
    form.value = {
      ...base,
      ...newData,
      // 'disabled' is the JSON field, but we show 'enabled' in the UI for better UX.
      enabled: newData.disabled === undefined ? true : !newData.disabled,
      keyStr: arrayToString(newData.key),
      keySecStr: arrayToString(newData.keysecondary),
      characterFilterNamesStr: arrayToString(cf.names),
      characterFilterTagsStr: arrayToString(cf.tags),
      characterFilterIsExclude: !!cf.isExclude,
      scanDepth: newData.scanDepth ?? ''
    }
  } else {
    // Reset to defaults if creating a new entry.
    form.value = defaultForm()
  }
}, { immediate: true })

const handleSave = () => {
  // reconstruct the nested JSON object from the flat form state
  const payload = {
    ...form.value,
    key: stringToArray(form.value.keyStr),
    keysecondary: stringToArray(form.value.keySecStr),
    characterFilter: {
      isExclude: form.value.characterFilterIsExclude,
      names: stringToArray(form.value.characterFilterNamesStr),
      tags: stringToArray(form.value.characterFilterTagsStr)
    },
    // Invert back to 'disabled' for storage
    disabled: !form.value.enabled
  }

  // Remove temporary UI-only fields before emitting
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
      <div class="editor-content w-full max-w-5xl h-[85vh] bg-white dark:bg-bg-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        <!-- Header -->
        <div class="h-16 px-6 border-b border-slate-200 dark:border-white/5 flex items-center justify-between bg-white dark:bg-bg-900 shrink-0">
          <div class="flex items-center gap-3">
            <div class="h-8 w-1 bg-accent rounded-full"></div>
            <div>
              <h2 class="text-lg font-bold text-slate-800 dark:text-white leading-tight">
                {{ form.uid ? 'Edit Entry' : 'New Entry' }}
              </h2>
              <p class="text-[11px] text-slate-500 dark:text-slate-500 font-mono">UID: {{ form.uid !== null ? form.uid : 'NEW' }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <label class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
              <span class="text-xs font-semibold text-slate-600 dark:text-slate-300" :class="{ 'text-accent': form.enabled }">
                {{ form.enabled ? 'Enabled' : 'Disabled' }}
              </span>
              <div class="relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out"
                   :class="form.enabled ? 'bg-accent' : 'bg-slate-300 dark:bg-slate-700'">
                <input type="checkbox" v-model="form.enabled" class="sr-only">
                <span aria-hidden="true" class="pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out"
                      :class="form.enabled ? 'translate-x-4' : 'translate-x-0'"/>
              </div>
            </label>
            <button v-if="form.uid !== null" @click="$emit('delete', form.uid)" class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all" title="Delete Entry">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
            </button>
            <button @click="$emit('close')" class="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-all" title="Close">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto bg-white dark:bg-bg-900">
          <div class="max-w-5xl mx-auto p-6 sm:p-10 space-y-6">

            <!-- Basics -->
            <section class="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 shadow-sm">
              <header class="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p class="text-xs uppercase font-semibold text-accent">Basics</p>
                  <h3 class="text-lg font-bold text-slate-800 dark:text-white">Label & Content</h3>
                  <p class="text-xs text-slate-500 dark:text-slate-400">Bunny.json stores how-to steps here; Date a Live entries hold character blurbs.</p>
                </div>
                <label class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-300 cursor-pointer">
                  <input type="checkbox" v-model="form.addMemo" class="accent-accent w-4 h-4">
                  Include Memo
                </label>
              </header>
              <div class="space-y-4">
                <div>
                  <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-2">Entry Label</label>
                  <input
                    v-model="form.comment"
                    type="text"
                    class="glass-input w-full px-4 py-3 rounded-xl text-base font-medium placeholder-slate-300 dark:placeholder-slate-600"
                    placeholder="e.g. Spirit overview, BunnyMo instructions"
                  >
                  <p class="text-[11px] text-slate-500 mt-1">For your list only; not sent to the model.</p>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-2">Content</label>
                  <textarea
                    v-model="form.content"
                    class="glass-input w-full min-h-[220px] p-4 rounded-xl text-sm leading-relaxed font-mono resize-y overflow-y-auto cursor-auto focus:cursor-text focus:ring-4 focus:ring-accent/10 scrollable-textarea"
                    placeholder="Paste the lore text that should be injected when active."
                  ></textarea>
                  <p class="text-[11px] text-slate-500 mt-1">Injected when triggers match (or always if Constant is on).</p>
                </div>
              </div>
            </section>

            <!-- Triggers -->
            <section class="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 shadow-sm">
              <header class="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p class="text-xs uppercase font-semibold text-accent">Triggers</p>
                  <h3 class="text-lg font-bold text-slate-800 dark:text-white">Keywords & Logic</h3>
                  <p class="text-xs text-slate-500 dark:text-slate-400">Primary = must-hit words (e.g., "Spirit"); Secondary = optional helpers.</p>
                </div>
                <div class="flex flex-col items-end gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" v-model="form.constant" class="accent-accent w-4 h-4">
                    Constant (always on)
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" v-model="form.selective" class="accent-accent w-4 h-4">
                    Selective (needs triggers)
                  </label>
                </div>
              </header>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-2">Primary Keywords</label>
                  <input v-model="form.keyStr" type="text" class="glass-input w-full px-3 py-3 rounded-xl text-sm font-mono text-accent" placeholder="Spirit, Spirits, Spacequake">
                  <p class="mt-1 text-[11px] text-slate-500">Comma separated. Date a Live entries fire off these.</p>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-2">Secondary Keywords</label>
                  <input v-model="form.keySecStr" type="text" class="glass-input w-full px-3 py-3 rounded-xl text-sm font-mono" placeholder="optional, variants, slang">
                  <p class="mt-1 text-[11px] text-slate-500">Used alongside the selective logic.</p>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
                <div>
                  <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-2">Selective Logic</label>
                  <select v-model.number="form.selectiveLogic" class="glass-input w-full px-3 py-2.5 rounded-xl text-sm appearance-none">
                    <option :value="0">ANY trigger (OR)</option>
                    <option :value="1">ALL triggers (AND)</option>
                    <option :value="2">NONE triggers (NOT)</option>
                  </select>
                  <p class="text-[11px] text-slate-500 mt-1">Applies to primary + secondary arrays.</p>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-2">Probability</label>
                  <div class="flex items-center gap-3">
                    <input type="range" v-model.number="form.probability" min="0" max="100" class="flex-1 accent-accent h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer">
                    <input type="number" v-model.number="form.probability" class="glass-input w-16 px-2 py-1 text-center rounded-lg text-sm" min="0" max="100">
                  </div>
                  <p class="text-[11px] text-slate-500 mt-1">Enable below to respect this slider (Bunny master entries use 0% + manual triggers).</p>
                </div>
                <div class="space-y-2 text-[11px] text-slate-600 dark:text-slate-400">
                  <label class="flex items-center justify-between p-2 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer">
                    <span>Case Sensitive</span>
                    <input type="checkbox" v-model="form.caseSensitive" class="accent-accent w-4 h-4">
                  </label>
                  <label class="flex items-center justify-between p-2 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer">
                    <span>Whole Words Only</span>
                    <input type="checkbox" v-model="form.matchWholeWords" class="accent-accent w-4 h-4">
                  </label>
                  <label class="flex items-center justify-between p-2 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer">
                    <span>Use Probability</span>
                    <input type="checkbox" v-model="form.useProbability" class="accent-accent w-4 h-4">
                  </label>
                  <p class="text-[11px] text-slate-500">Turn on for RNG activation; leave off for deterministic triggers.</p>
                </div>
              </div>
            </section>

            <!-- Placement -->
            <section class="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 shadow-sm">
              <header class="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p class="text-xs uppercase font-semibold text-accent">Placement</p>
                  <h3 class="text-lg font-bold text-slate-800 dark:text-white">Where & When</h3>
                  <p class="text-xs text-slate-500 dark:text-slate-400">Depth/order decide stacking in context. Astral Dress in Date a Live pins position 4.</p>
                </div>
              </header>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-2">Depth</label>
                  <input type="number" v-model.number="form.depth" class="glass-input w-full px-3 py-2 rounded-lg text-sm">
                  <p class="text-[11px] text-slate-500 mt-1">Lines from bottom; smaller = closer to recent chat.</p>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-2">Order</label>
                  <input type="number" v-model.number="form.order" class="glass-input w-full px-3 py-2 rounded-lg text-sm">
                  <p class="text-[11px] text-slate-500 mt-1">Tie-breaker when multiple entries fire.</p>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-2">Position</label>
                  <select v-model.number="form.position" class="glass-input w-full px-3 py-2 rounded-lg text-sm">
                    <option :value="0">Before Char Defs</option>
                    <option :value="1">After Char Defs</option>
                    <option :value="2">Author's Note</option>
                    <option :value="3">Top of Context</option>
                    <option :value="4">Pinned / System</option>
                  </select>
                  <p class="text-[11px] text-slate-500 mt-1">Drop point relative to other blocks.</p>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-4 gap-5 mt-4">
                <div>
                  <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-2">Sticky (turns)</label>
                  <input type="number" v-model.number="form.sticky" class="glass-input w-full px-3 py-2 rounded-lg text-sm">
                  <p class="text-[11px] text-slate-500 mt-1">Stay active after firing.</p>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-2">Cooldown</label>
                  <input type="number" v-model.number="form.cooldown" class="glass-input w-full px-3 py-2 rounded-lg text-sm">
                  <p class="text-[11px] text-slate-500 mt-1">Turns before it can fire again.</p>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-2">Delay</label>
                  <input type="number" v-model.number="form.delay" class="glass-input w-full px-3 py-2 rounded-lg text-sm">
                  <p class="text-[11px] text-slate-500 mt-1">Wait this many turns before first activation.</p>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-2">Scan Depth</label>
                  <input type="number" v-model.number="form.scanDepth" class="glass-input w-full px-3 py-2 rounded-lg text-sm" placeholder="Global default if empty">
                  <p class="text-[11px] text-slate-500 mt-1">How far back to search for triggers.</p>
                </div>
              </div>
            </section>

            <!-- Filters -->
            <section class="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 shadow-sm">
              <header class="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p class="text-xs uppercase font-semibold text-accent">Filters</p>
                  <h3 class="text-lg font-bold text-slate-800 dark:text-white">Character Targeting</h3>
                  <p class="text-xs text-slate-500 dark:text-slate-400">Include or exclude people; mirrors the characterFilter blocks in both example lorebooks.</p>
                </div>
                <label class="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                  <input type="checkbox" v-model="form.characterFilterIsExclude" class="accent-accent w-4 h-4">
                  Exclude these characters
                </label>
              </header>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-2">Character Names</label>
                  <input v-model="form.characterFilterNamesStr" class="glass-input w-full px-3 py-2.5 rounded-lg text-sm font-mono" placeholder="Tohka, Kurumi">
                  <p class="text-[11px] text-slate-500 mt-1">Matches against participant names.</p>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-2">Character Tags</label>
                  <input v-model="form.characterFilterTagsStr" class="glass-input w-full px-3 py-2.5 rounded-lg text-sm font-mono" placeholder="elf, antagonist">
                  <p class="text-[11px] text-slate-500 mt-1">Tag-based filtering.</p>
                </div>
              </div>
            </section>

            <!-- Context matching -->
            <section class="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 shadow-sm">
              <header class="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p class="text-xs uppercase font-semibold text-accent">Context</p>
                  <h3 class="text-lg font-bold text-slate-800 dark:text-white">Persona & Scenario Checks</h3>
                  <p class="text-xs text-slate-500 dark:text-slate-400">Require alignment with parts of the prompt before firing.</p>
                </div>
              </header>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-slate-700 dark:text-slate-200">
                <label class="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors">
                  <input type="checkbox" v-model="form.matchPersonaDescription" class="accent-accent w-4 h-4">
                  Match Persona
                </label>
                <label class="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors">
                  <input type="checkbox" v-model="form.matchCharacterDescription" class="accent-accent w-4 h-4">
                  Match Character Description
                </label>
                <label class="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors">
                  <input type="checkbox" v-model="form.matchCharacterPersonality" class="accent-accent w-4 h-4">
                  Match Personality
                </label>
                <label class="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors">
                  <input type="checkbox" v-model="form.matchCharacterDepthPrompt" class="accent-accent w-4 h-4">
                  Match Depth Prompt
                </label>
                <label class="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors">
                  <input type="checkbox" v-model="form.matchScenario" class="accent-accent w-4 h-4">
                  Match Scenario
                </label>
                <label class="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors">
                  <input type="checkbox" v-model="form.matchCreatorNotes" class="accent-accent w-4 h-4">
                  Match Creator Notes
                </label>
              </div>
            </section>

            <!-- Grouping -->
            <section class="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 shadow-sm">
              <header class="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p class="text-xs uppercase font-semibold text-accent">Grouping</p>
                  <h3 class="text-lg font-bold text-slate-800 dark:text-white">Collections & Automation</h3>
                  <p class="text-xs text-slate-500 dark:text-slate-400">Keep related entries together or override routing like the pinned system entries in Date a Live.</p>
                </div>
              </header>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-2">Group Name</label>
                  <input v-model="form.group" class="glass-input w-full px-3 py-2 rounded-lg text-sm" placeholder="e.g. Spirits">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-2">Group Weight</label>
                  <input type="number" v-model.number="form.groupWeight" class="glass-input w-full px-3 py-2 rounded-lg text-sm">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-2">Role</label>
                  <input v-model="form.role" class="glass-input w-full px-3 py-2 rounded-lg text-sm" placeholder="system">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-2">Automation ID</label>
                  <input v-model="form.automationId" class="glass-input w-full px-3 py-2 rounded-lg text-sm" placeholder="Optional automation hook">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-2">Outlet Name</label>
                  <input v-model="form.outletName" class="glass-input w-full px-3 py-2 rounded-lg text-sm" placeholder="Named output channel">
                </div>
              </div>
              <div class="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-700 dark:text-slate-200">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="form.useGroupScoring" class="accent-accent w-4 h-4">
                  Use Group Scoring
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="form.groupOverride" class="accent-accent w-4 h-4">
                  Override Group
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="form.ignoreBudget" class="accent-accent w-4 h-4">
                  Ignore Budget
                </label>
              </div>
            </section>

            <!-- Safety -->
            <section class="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 shadow-sm">
              <header class="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p class="text-xs uppercase font-semibold text-accent">Safety</p>
                  <h3 class="text-lg font-bold text-slate-800 dark:text-white">Recursion & Guards</h3>
                  <p class="text-xs text-slate-500 dark:text-slate-400">Prevent loops or keep entries dormant until recursion is safe.</p>
                </div>
              </header>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-slate-700 dark:text-slate-200">
                <label class="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors">
                  <input type="checkbox" v-model="form.excludeRecursion" class="accent-accent w-4 h-4">
                  Exclude Recursion
                </label>
                <label class="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors">
                  <input type="checkbox" v-model="form.preventRecursion" class="accent-accent w-4 h-4">
                  Prevent Recursion
                </label>
                <label class="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors">
                  <input type="checkbox" v-model="form.delayUntilRecursion" class="accent-accent w-4 h-4">
                  Delay Until Recursion
                </label>
              </div>
            </section>
          </div>
        </div>

        <!-- Footer -->
        <div class="h-20 bg-slate-50 dark:bg-bg-950/50 border-t border-slate-200 dark:border-white/5 flex items-center justify-end px-6 gap-4 shrink-0">
          <button @click="$emit('close')" class="px-6 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors hover:bg-slate-200/50 dark:hover:bg-white/5">Cancel</button>
          <button @click="handleSave" class="px-8 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-bold shadow-lg shadow-accent/20 hover:shadow-accent/40 hover:-translate-y-0.5 transition-all active:translate-y-0">
             {{ form.uid !== null ? 'Update' : 'Create Entry' }}
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

.scrollable-textarea::-webkit-scrollbar,
.scrollable-textarea::-webkit-scrollbar-thumb {
  cursor: pointer;
}
</style>
