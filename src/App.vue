<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useLorebookStore } from '@/stores/lorebook'
import { useToastStore } from '@/stores/toast'

// Import Components
import RuneCanvas from '@/components/Background.vue'
import TheHeader from '@/components/layout/Header.vue'
import TheSidebar from '@/components/layout/Sidebar.vue'
import LoreCard from '@/components/Card.vue'
import EditorModal from '@/components/Editor.vue'
import Toast from '@/components/Toast.vue'
import WelcomeScreen from '@/components/WelcomeScreen.vue'

// Data Logic
const lorebookStore = useLorebookStore()
const { filteredEntries, hasLorebook, isImporting } = storeToRefs(lorebookStore)
const { addEntry, updateEntry, deleteEntry } = lorebookStore

const toastStore = useToastStore()

// Modal State
const showModal = ref(false)
const selectedEntry = ref(null)

// Open for Creating
const openCreate = () => {
  selectedEntry.value = null
  showModal.value = true
}

// Open for Editing
const openEdit = (uid) => {
  const entry = filteredEntries.value.find(e => e.uid === uid)
  if (entry) {
    selectedEntry.value = entry
    showModal.value = true
  }
}

// Form Handlers
const handleSave = (payload) => {
  if (payload.uid) {
    updateEntry(payload)
    toastStore.addToast('Entry updated successfully!', 'success');
  } else {
    addEntry(payload)
    toastStore.addToast('Entry created successfully!', 'success');
  }
  showModal.value = false
}

const handleDelete = (uid) => {
  if(confirm("Destroy this lore entry?")) {
    deleteEntry(uid)
    toastStore.addToast('Entry deleted successfully!', 'success');
    showModal.value = false
  }
}
</script>

<template>
  <!-- Main Container -->
  <div class="h-screen flex flex-col overflow-hidden font-sans text-sm bg-light-50 text-slate-800 dark:bg-bg-950 dark:text-slate-200 selection:bg-accent selection:text-white">
    
    <TheHeader />

    <!-- Toast Container -->
    <div class="fixed inset-0 pointer-events-none z-[9999]">
      <Toast
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        :message="toast.message"
        :type="toast.type"
        :duration="toast.duration"
        :position="toast.position"
        class="pointer-events-auto"
      />
    </div>

    <!-- Loading Overlay -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 backdrop-blur-none"
      enter-to-class="opacity-100 backdrop-blur-sm"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 backdrop-blur-sm"
      leave-to-class="opacity-0 backdrop-blur-none"
    >
      <div v-if="isImporting" class="fixed inset-0 z-[10000] flex items-center justify-center bg-white/30 dark:bg-black/30 backdrop-blur-sm">
        <div class="flex flex-col items-center gap-4 p-8 rounded-2xl bg-white/80 dark:bg-slate-900/80 shadow-2xl border border-white/20 dark:border-white/10">
          <div class="relative w-24 h-24">
            <div class="absolute inset-0 rounded-full border-4 border-accent/30 animate-ping"></div>
            <div class="absolute inset-0 rounded-full border-4 border-t-accent border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            <div class="absolute inset-2 rounded-full bg-accent/5 backdrop-blur-sm flex items-center justify-center overflow-hidden p-2">
              <img src="/logo.png" class="w-full h-full object-contain" />
            </div>
          </div>
          <div class="text-lg font-bold text-slate-800 dark:text-white animate-pulse">Importing Lorebook...</div>
        </div>
      </div>
    </Transition>

    <div class="flex flex-1 overflow-hidden max-w-[1800px] mx-auto w-full relative z-10">
      <template v-if="hasLorebook">
        <TheSidebar @open-create="openCreate" />

        <main class="flex-1 overflow-y-auto p-6 pl-0 scroll-smooth">
          <!-- Grid -->
          <Transition
            enter-active-class="transition duration-300 ease-out delay-150"
            enter-from-class="opacity-0 translate-y-4"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-4"
            mode="out-in"
          >
            <!-- Key the grid to the currentLorebookId so it re-renders/animates on switch -->
            <div :key="lorebookStore.currentLorebookId" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 pb-20">
              <LoreCard 
                v-for="entry in filteredEntries" 
                :key="entry.uid" 
                :data="entry"
                @click="openEdit"
              />
            </div>
          </Transition>
        </main>
      </template>
      <WelcomeScreen v-else />
    </div>

    <!-- Modal -->
    <EditorModal 
      :is-open="showModal" 
      :entry-data="selectedEntry"
      @close="showModal = false"
      @save="handleSave"
      @delete="handleDelete"
    />
  </div>
</template>