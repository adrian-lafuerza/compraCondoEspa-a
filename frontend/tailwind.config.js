/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'custom-lg': '1040px',
      },
      fontFamily: {
        'work-sans': ['Work Sans', 'sans-serif'],
        'ag-body': ['Inter', 'Source Sans Pro', 'sans-serif'],
      },
    },
  },
  plugins: [
    '@tailwindcss/typography',
  ],
}