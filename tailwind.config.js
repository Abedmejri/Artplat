// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'stone-dark': '#1c1c1c',
        'parchment': '#e8e0d0',
        'ink-black': '#0a0a0a',
        'spell-glow-teal': '#00f2ea',
        'gryffindor-red': '#ae0001',
        'newspaper': '#0f0f0dff', // A new color for our "Daily Prophet" pages
      },
      fontFamily: {
        'heading': ['"Uncial Antiqua"', 'cursive'],
        'body': ['"Lato"', 'sans-serif'],
      },
      boxShadow: {
        'glow-teal': '0 0 15px 5px rgba(0, 242, 234, 0.3)',
      },
      // New utility for glowing text
      textShadow: {
        'glow': '0 0 10px rgba(0, 242, 234, 0.5), 0 0 20px rgba(0, 242, 234, 0.3)',
      },
    },
  },
  // We need to add a plugin to enable the textShadow utility
  plugins: [
    require('@tailwindcss/aspect-ratio'),
    function ({ addUtilities }) {
      const newUtilities = {
        '.text-shadow-glow': {
          textShadow: '0 0 10px rgba(0, 242, 234, 0.5), 0 0 20px rgba(0, 242, 234, 0.3)',
        },
      }
      addUtilities(newUtilities, ['responsive', 'hover'])
    }
  ],
}