<script setup>
import { ref } from 'vue'
import { useLorebook } from '@/composables/useLorebook'
import { useToastStore } from '@/stores/toast'

// Import Components
import RuneCanvas from '@/components/Background.vue'
import TheHeader from '@/components/layout/Header.vue'
import TheSidebar from '@/components/layout/Sidebar.vue'
import LoreCard from '@/components/Card.vue'
import EditorModal from '@/components/Editor.vue'
import Toast from '@/components/Toast.vue'

// Data Logic
const { filteredEntries, addEntry, updateEntry, deleteEntry } = useLorebook()
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
    
    <RuneCanvas />
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

    <div class="flex flex-1 overflow-hidden max-w-[1800px] mx-auto w-full relative z-10">
      <TheSidebar @open-create="openCreate" />

      <main class="flex-1 overflow-y-auto p-6 pl-0 scroll-smooth">
        <!-- Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 pb-20">
          <LoreCard 
            v-for="entry in filteredEntries" 
            :key="entry.uid" 
            :data="entry"
            @click="openEdit"
          />
        </div>
      </main>
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