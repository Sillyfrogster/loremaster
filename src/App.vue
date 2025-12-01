<script setup>
import { useToastStore } from '@/stores/toast'
import TheHeader from '@/components/layout/Header.vue'
import Toast from '@/components/Toast.vue'

const toastStore = useToastStore()
</script>

<template>
  <!-- Main Container -->
  <div class="app-shell h-screen flex flex-col overflow-hidden font-sans text-sm bg-light-50 text-slate-800 dark:bg-bg-950 dark:text-slate-200 selection:bg-accent selection:text-white">
    
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

    <router-view />
  </div>
</template>