<template>
  <transition name="toast-fade">
    <div
      v-if="isVisible"
      :class="['fixed', 'p-4', 'rounded-lg', 'shadow-lg', 'flex', 'items-center', 'space-x-3', 'z-50', 'max-w-xs',
               typeClasses, positionClasses,
               'transform', 'transition-all', 'duration-300', 'ease-in-out']"
      role="alert"
    >
      <div v-if="type === 'success'" class="text-green-400">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      </div>
      <div v-else-if="type === 'error'" class="text-red-400">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      </div>
      <div v-else-if="type === 'info'" class="text-blue-400">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      </div>
      <div class="text-sm font-medium text-gray-800 dark:text-gray-100">
        {{ message }}
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';

const props = defineProps({
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'info', // success, error, info
    validator: (value) => ['success', 'error', 'info'].includes(value),
  },
  duration: {
    type: Number,
    default: 3000, // ms
  },
  position: {
    type: String,
    default: 'top-right', // top-right, top-left, bottom-right, bottom-left, top-center, bottom-center
    validator: (value) => ['top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center'].includes(value),
  },
});

const isVisible = ref(false);

const typeClasses = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bg-green-100 dark:bg-green-800/60 border border-green-200 dark:border-green-700/60';
    case 'error':
      return 'bg-red-100 dark:bg-red-800/60 border border-red-200 dark:border-red-700/60';
    case 'info':
    default:
      return 'bg-blue-100 dark:bg-blue-800/60 border border-blue-200 dark:border-blue-700/60';
  }
});

const positionClasses = computed(() => {
  const baseOffset = 'mt-4 mr-4 mb-4 ml-4'; // Default margin
  switch (props.position) {
    case 'top-right':
      return ['top-0', 'right-0', baseOffset];
    case 'top-left':
      return ['top-0', 'left-0', baseOffset];
    case 'bottom-right':
      return ['bottom-0', 'right-0', baseOffset];
    case 'bottom-left':
      return ['bottom-0', 'left-0', baseOffset];
    case 'top-center':
      return ['top-0', 'left-1/2', '-translate-x-1/2', baseOffset];
    case 'bottom-center':
      return ['bottom-0', 'left-1/2', '-translate-x-1/2', baseOffset];
    default:
      return ['top-0', 'right-0', baseOffset];
  }
});

onMounted(() => {
  isVisible.value = true;
  setTimeout(() => {
    isVisible.value = false;
  }, props.duration);
});
</script>

<style scoped>
.toast-fade-enter-active {
  animation: scaleIn 0.3s ease-out forwards;
}

.toast-fade-leave-active {
  animation: fadeOut 0.3s ease-in forwards;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(-20px) scale(0.9);
  }
}
</style>