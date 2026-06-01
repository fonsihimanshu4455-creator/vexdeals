/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Editorial boutique palette ──────────────────────────────────
        // `primary` is remapped to a warm espresso ramp so existing
        // primary-* classes across the app become chic near-black.
        primary: {
          50:  '#f5f2ee',
          100: '#e8e1d8',
          200: '#cfc3b3',
          300: '#ad9c87',
          400: '#82715d',
          500: '#574a3c',
          600: '#3a3026',   // buttons / links — espresso
          700: '#2a221b',
          800: '#1c1712',
          900: '#120e0a',   // darkest sections
        },
        // `accent` remapped to cognac / terracotta.
        accent: {
          50:  '#faf0e8',
          100: '#f1d9c7',
          200: '#e3b694',
          300: '#d49866',
          400: '#c47e45',
          500: '#b5673a',   // signature accent
          600: '#9a5530',
          700: '#7c4426',
        },
        navy: {
          900: '#120e0a',
          800: '#1c1712',
          700: '#2a221b',
        },
        cream: {
          DEFAULT: '#f4efe6',
          50:  '#fbf8f2',
          100: '#f4efe6',
          200: '#ebe2d3',
          300: '#dccab2',
        },
        ink: {
          DEFAULT: '#161310',
          900: '#0e0c0a',
          800: '#161310',
          700: '#241e18',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      screens: {
        xs: '475px',
      },
      letterSpacing: {
        widest2: '0.28em',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        soft:        '0 1px 2px rgba(20,16,12,0.04), 0 8px 24px -12px rgba(20,16,12,0.12)',
        card:        '0 10px 30px -14px rgba(20,16,12,0.22)',
        'card-hover':'0 26px 50px -20px rgba(20,16,12,0.34)',
        edge:        '0 0 0 1px rgba(20,16,12,0.08)',
        premium:     '0 30px 70px -26px rgba(14,12,10,0.6)',
      },
      backgroundImage: {
        'cognac-sheen': 'linear-gradient(110deg, #c47e45 0%, #b5673a 50%, #9a5530 100%)',
        'paper-grain':  'radial-gradient(900px 500px at 80% -10%, rgba(181,103,58,0.12), transparent 60%)',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(22px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        marquee: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
      },
      animation: {
        'fade-up':  'fade-up 0.7s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in':  'fade-in 0.6s ease-out both',
        marquee:    'marquee 26s linear infinite',
        float:      'float 7s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
