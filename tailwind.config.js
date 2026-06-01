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
        ink: {
          900: '#05091c',   // near-black premium base
          800: '#0a1230',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      screens: {
        xs: '475px',
      },
      boxShadow: {
        soft:        '0 2px 10px -3px rgba(16,24,64,0.08), 0 4px 18px -6px rgba(16,24,64,0.05)',
        card:        '0 6px 24px -8px rgba(16,24,64,0.12)',
        'card-hover':'0 18px 44px -14px rgba(30,58,138,0.28)',
        gold:        '0 10px 28px -8px rgba(245,158,11,0.40)',
        premium:     '0 26px 60px -20px rgba(7,14,42,0.55)',
      },
      backgroundImage: {
        'gold-sheen':  'linear-gradient(110deg, #fcd34d 0%, #f59e0b 45%, #d97706 100%)',
        'ink-radial':  'radial-gradient(1200px 600px at 70% -10%, rgba(245,158,11,0.14), transparent 60%), radial-gradient(900px 500px at 0% 110%, rgba(37,99,235,0.18), transparent 55%)',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up':  'fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in':  'fade-in 0.5s ease-out both',
        float:      'float 6s ease-in-out infinite',
        shimmer:    'shimmer 2.5s infinite',
      },
    },
  },
  plugins: [],
}
