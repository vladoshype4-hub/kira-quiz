/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: 'var(--c-ink)',
        rose: 'var(--c-rose)',
        lavender: 'var(--c-lavender)',
        wine: 'var(--c-wine)',
        burgundy: 'var(--c-burgundy)',
      },
      fontFamily: {
        ui: 'var(--font-ui)',
        display: 'var(--font-display)',
      },
    },
  },
  plugins: [],
}
