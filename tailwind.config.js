/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './index.tsx',
    './App.tsx',
    './components/**/*.{ts,tsx}',
    './contexts/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './utils/**/*.{ts,tsx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {},
  },
  plugins: [],
};