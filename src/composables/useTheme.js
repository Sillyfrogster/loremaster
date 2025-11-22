import { ref, onMounted } from 'vue'

export function useTheme() {
  const isDark = ref(true)

  const toggleTheme = () => {
    isDark.value = !isDark.value
    updateDOM()
  }

  const updateDOM = () => {
    const html = document.documentElement
    if (isDark.value) {
      html.classList.add('dark')
      localStorage.theme = 'dark'
    } else {
      html.classList.remove('dark')
      localStorage.theme = 'light'
    }
  }

  onMounted(() => {
    // Check local storage or system preference
    if (localStorage.theme === 'light') {
      isDark.value = false
    } else {
      isDark.value = true
    }
    updateDOM()
  })

  return { isDark, toggleTheme }
}