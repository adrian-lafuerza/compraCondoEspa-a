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
        'sans': ['Roboto', 'sans-serif'],
        'work-sans': ['Work Sans', 'sans-serif'],
        'ag-body': ['Inter', 'Source Sans Pro', 'sans-serif'],
        'roboto': ['Roboto', 'sans-serif'],
        'gothic-a1': ['Gothic A1', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
        'montserrat': ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [
    '@tailwindcss/typography',
  ],
}