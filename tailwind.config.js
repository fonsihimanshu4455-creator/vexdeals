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
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        accent: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        navy: {
          950: '#05091e',
          900: '#070e2a',
          800: '#0d1a45',
          700: '#122260',
        },
        ink: {
          50:  '#f7f8fc',
          100: '#eef0f6',
          200: '#dde1ec',
          300: '#b9c0d4',
          500: '#5b6478',
          700: '#26304a',
          900: '#0b1224',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-blue':   '0 10px 40px -10px rgba(37, 99, 235, .55)',
        'glow-gold':   '0 10px 40px -10px rgba(245, 158, 11, .55)',
        'glow-pink':   '0 10px 40px -10px rgba(236, 72, 153, .55)',
        'soft':        '0 6px 24px -10px rgba(10, 15, 36, .15)',
        'card':        '0 12px 32px -16px rgba(10, 15, 36, .25)',
        'card-hover':  '0 28px 60px -22px rgba(10, 15, 36, .35)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #050a1f 0%, #0f1733 35%, #182554 100%)',
        'gold-gradient': 'linear-gradient(135deg, #fde68a, #f59e0b 50%, #b45309)',
        'blue-gradient': 'linear-gradient(135deg, #60a5fa, #4f46e5 50%, #1e3a8a)',
        'sunrise':       'linear-gradient(135deg, #f59e0b, #ec4899 60%, #6366f1)',
      },
      transitionTimingFunction: {
        'out-soft': 'cubic-bezier(.2,.8,.2,1)',
      },
    },
  },
  plugins: [],
}
