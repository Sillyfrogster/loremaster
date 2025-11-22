<script setup>
import { ref, onMounted } from 'vue'

const particles = ref([])
const runes = "ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ"

const init = () => {
  // Create a stable set of particles
  const count = 30 // Reduced count for DOM, but sufficient for effect
  const newParticles = []
  
  for (let i = 0; i < count; i++) {
    newParticles.push({
      id: i,
      char: runes[Math.floor(Math.random() * runes.length)],
      style: {
        left: `${Math.random() * 100}%`,
        fontSize: `${Math.random() * 1.5 + 0.8}rem`,
        animationDuration: `${Math.random() * 20 + 15}s`, // 15-35s
        animationDelay: `${Math.random() * -30}s`, // Start at random points in cycle
        opacity: Math.random() * 0.3 + 0.05
      }
    })
  }
  particles.value = newParticles
}

onMounted(init)
</script>

<template>
  <div class="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
    <div 
      v-for="p in particles" 
      :key="p.id"
      class="absolute top-[110%] text-slate-500 dark:text-violet-500/40 select-none animate-float will-change-transform"
      :style="p.style"
    >
      {{ p.char }}
    </div>
  </div>
</template>

<style scoped>
@keyframes float {
  0% {
    transform: translateY(0) rotate(0deg);
  }
  100% {
    transform: translateY(-120vh) rotate(45deg);
  }
}

.animate-float {
  animation-name: float;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}
</style>