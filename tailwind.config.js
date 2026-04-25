/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',   // main brand — vibrant royal blue (CTA buttons, links)
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',   // deep navy — hero/dark-section backgrounds
        },
        accent: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',   // bright amber highlight
          500: '#f59e0b',   // main accent — vivid amber-gold
          600: '#d97706',
          700: '#b45309',
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
