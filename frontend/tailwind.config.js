/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0D1117',
        'bg-secondary': '#161B22',
        'bg-tertiary': '#21262D',
        'border': '#30363D',
        'text-primary': '#C9D1D9',
        'text-secondary': '#8B949E',
        'accent': '#58A6FF',
        'success': '#3FB950',
        'error': '#F85149',
        'warning': '#D29922',
      }
    },
  },
  plugins: [],
}
