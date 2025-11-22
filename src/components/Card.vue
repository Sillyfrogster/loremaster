<script setup>
import { computed } from 'vue';

const props = defineProps({
  data: { type: Object, required: true }
})

const emit = defineEmits(['click'])

// Helper to generate consistent random colors for keywords based on string hash
const getPillColor = (str) => {
  const colors = [
    'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
    'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

const visibleKeys = computed(() => props.data.key.slice(0, 5))
const remainingKeysCount = computed(() => Math.max(0, props.data.key.length - 5))
</script>

<template>
  <div 
    @click="$emit('click', data.uid)"
    :class="[
      'lore-card relative glass-panel p-5 rounded-xl cursor-pointer group flex flex-col h-56 border transition-all',
      !data.enabled 
        ? 'opacity-60 grayscale border-slate-300 dark:border-slate-700' 
        : 'border-slate-200 dark:border-slate-700 hover:border-accent dark:hover:border-accent'
    ]"
  >
    <!-- Top Indicator Bar -->
    <div 
      :class="['absolute top-0 left-0 w-full h-1 opacity-80 rounded-t-xl', data.constant ? 'bg-gold' : (data.enabled ? 'bg-accent' : 'bg-slate-400')]"
    ></div>
    
    <!-- Header -->
    <div class="flex justify-between items-start mb-2">
      <h3 class="font-bold text-base text-slate-800 dark:text-white group-hover:text-accent transition-colors truncate pr-2">
        {{ data.comment || 'Untitled' }}
      </h3>
      <span v-if="data.constant" class="text-[9px] font-bold text-amber-700 dark:text-gold bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 rounded border border-amber-200 dark:border-gold/20">CONST</span>
    </div>
    
    <!-- Content Preview -->
    <div class="flex-1 overflow-hidden">
      <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-4 font-mono">
        {{ data.content || 'Empty content' }}
      </p>
    </div>

    <!-- Keywords / Pills -->
    <div v-if="data.key.length" class="flex flex-wrap gap-1.5 content-end mt-auto pt-3 border-t border-slate-200 dark:border-white/5">
      <span 
        v-for="k in visibleKeys" 
        :key="k" 
        :class="['px-1.5 py-0.5 text-[10px] font-bold rounded border', getPillColor(k)]"
      >
        {{ k }}
      </span>
      <span v-if="remainingKeysCount > 0" class="px-1.5 py-0.5 text-[10px] rounded bg-slate-100 dark:bg-white/10 text-slate-500">
        +{{ remainingKeysCount }}
      </span>
    </div>
    <div v-else class="mt-auto pt-3 border-t border-slate-200 dark:border-white/5 text-[10px] text-slate-400 italic">
      No Triggers Defined
    </div>

    <!-- UID Hover -->
    <div class="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <span class="text-[9px] text-slate-400 bg-slate-100 dark:bg-bg-900 px-1 rounded border border-slate-200 dark:border-white/10">
        UID: {{ data.uid }}
      </span>
    </div>
  </div>
</template>