<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useTheme } from '@/composables/useTheme'

const canvasRef = ref(null)
const { isDark } = useTheme()
let ctx = null
let animationFrame = null
const particles = []
const runes = "ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ"

// Canvas Logic
class Particle {
  constructor(w, h) { this.reset(w, h) }
  reset(w, h) {
    this.char = runes[Math.floor(Math.random() * runes.length)]
    this.x = Math.random() * w
    this.y = Math.random() * h
    this.size = Math.random() * 12 + 8
    this.speed = Math.random() * 0.3 + 0.1
    this.opacity = Math.random() * 0.3
  }
  update(h) {
    this.y -= this.speed
    if (this.y < -20) this.y = h + 20
  }
  draw(ctx, isDarkMode) {
    ctx.fillStyle = isDarkMode ? '#8b5cf6' : '#64748b'
    ctx.font = `${this.size}px sans-serif`
    ctx.globalAlpha = isDarkMode ? this.opacity : this.opacity * 0.5
    ctx.fillText(this.char, this.x, this.y)
  }
}

const init = () => {
  const canvas = canvasRef.value
  if(!canvas) return
  ctx = canvas.getContext('2d')
  
  const resize = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  window.addEventListener('resize', resize)
  resize()

  // Init Particles
  for(let i=0; i<50; i++) particles.push(new Particle(canvas.width, canvas.height))

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    particles.forEach(p => {
      p.update(canvas.height)
      p.draw(ctx, isDark.value)
    })
    animationFrame = requestAnimationFrame(animate)
  }
  animate()
}

onMounted(init)
onUnmounted(() => cancelAnimationFrame(animationFrame))
</script>

<template>
  <canvas ref="canvasRef" class="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-10 dark:opacity-40 transition-opacity duration-500"></canvas>
</template>