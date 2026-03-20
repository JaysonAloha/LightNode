/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        cozy: ['"Noto Serif SC"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
