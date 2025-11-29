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
    <div class="absolute inset-0 gradient-veil"></div>
    <div 
      v-for="p in particles" 
      :key="p.id"
      class="absolute top-[110%] text-slate-500 dark:text-accent/40 select-none animate-float will-change-transform"
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

.gradient-veil {
  background:
    radial-gradient(circle at 18% 20%, rgba(93, 194, 177, 0.12), transparent 32%),
    radial-gradient(circle at 82% 16%, rgba(98, 129, 210, 0.12), transparent 34%),
    radial-gradient(circle at 60% 78%, rgba(255, 255, 255, 0.08), transparent 36%);
  transition: background 320ms ease;
}

:global(.dark) .gradient-veil {
  background:
    radial-gradient(circle at 22% 18%, rgba(93, 194, 177, 0.11), transparent 30%),
    radial-gradient(circle at 78% 14%, rgba(88, 119, 196, 0.12), transparent 32%),
    radial-gradient(circle at 64% 80%, rgba(12, 22, 45, 0.7), transparent 38%);
}
</style>
