/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'verde-flor': '#2d6a4f',
        'rosa-suave': '#fce4ec',
      },
    },
  },
  plugins: [],
}