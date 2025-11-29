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
          950: '#050812',
          900: '#0b1224',
          800: '#111b30',
        },
        // Light Mode Colors (Clean Slate)
        light: {
          50: '#f6f7fb',
          100: '#ebedf3',
          200: '#dfe3ec',
          300: '#cbd2df',
          surface: '#ffffff',
        },
        accent: {
          DEFAULT: '#5dc2b1', // Muted seafoam
          hover: '#4aa795',
          light: '#7ad7c9',
          dim: 'rgba(93, 194, 177, 0.12)',
          glow: 'rgba(93, 194, 177, 0.45)'
        },
        gold: {
          DEFAULT: '#e8c268',
          dim: 'rgba(232, 194, 104, 0.14)'
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
