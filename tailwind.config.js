/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          main: '#1a237e',
          light: '#534bae',
          dark: '#000051',
        },
        secondary: {
          main: '#ff4081',
          light: '#ff79b0',
          dark: '#c60055',
        },
      },
    },
  },
  plugins: [],
  important: true,
}
