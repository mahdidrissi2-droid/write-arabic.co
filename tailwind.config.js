/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: ['pattern-arabesque', 'animate-pulse'],
  theme: {
    extend: {
      fontFamily: {
        arabic: ['var(--font-arabic)', 'Noto Naskh Arabic', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
