/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#eef2ff',
          100: '#dde6fa',
          200: '#b8caf5',
          300: '#7fa0ea',
          400: '#4d78de',
          500: '#2b56cc',
          600: '#1e3a8a',   // main navy – matches logo "VEX" colour
          700: '#172e6e',
          800: '#0f1f52',
          900: '#081236',
        },
        accent: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#e8c04a',
          500: '#c9a83c',   // main gold – matches logo "DEALS" colour
          600: '#a27c1a',
          700: '#7c5c0d',
        },
        navy: {
          900: '#070e2a',
          800: '#0d1a45',
          700: '#122260',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
