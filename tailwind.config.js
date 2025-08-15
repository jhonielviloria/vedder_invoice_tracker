/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        status: {
          notdone: '#ef4444',
          completed: '#22c55e',
          recurring: '#3b82f6',
          na: '#d1d5db'
        }
      }
    },
  },
  plugins: [],
};
