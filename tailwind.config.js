/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Essential for the theme toggle
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        // Dark Mode Colors (Obsidian)
        bg: {
          950: '#020617',
          900: '#0f172a',
          800: '#1e293b',
        },
        // Light Mode Colors (Clean Slate)
        light: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          surface: '#ffffff',
        },
        accent: {
          DEFAULT: '#8b5cf6', // Violet
          hover: '#7c3aed',
          light: '#a78bfa',
          dim: 'rgba(139, 92, 246, 0.1)',
          glow: 'rgba(139, 92, 246, 0.5)'
        },
        gold: {
          DEFAULT: '#fbbf24',
          dim: 'rgba(251, 191, 36, 0.1)'
        }
      },
      animation: {
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
      keyframes: {
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}