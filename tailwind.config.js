/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Lenskart-style palette ──────────────────────────────────────
        // `primary` = teal/cyan-blue, `accent` = yellow, `navy`/`ink` = deep blue,
        // `cream` = clean light surfaces. Existing classes inherit these.
        primary: {
          50:  '#e7f6fa',
          100: '#c3e9f1',
          200: '#8ad7e6',
          300: '#4ec3d9',
          400: '#1fadc9',
          500: '#0b97b4',
          600: '#009fb7',   // main teal CTA
          700: '#007e91',
          800: '#0a5e6c',
          900: '#0b3f49',
        },
        accent: {
          50:  '#fff8e1',
          100: '#ffecb3',
          200: '#ffe083',
          300: '#ffd54f',
          400: '#ffca28',   // bright yellow
          500: '#ffc107',   // main yellow accent
          600: '#e0a800',
          700: '#b88700',
        },
        navy: {
          900: '#0b2340',
          800: '#11304f',
          700: '#1a3a5c',
        },
        cream: {
          DEFAULT: '#f5f6f8',
          50:  '#ffffff',
          100: '#f5f6f8',
          200: '#eceef2',
          300: '#dde1e8',
        },
        ink: {
          DEFAULT: '#11233f',
          900: '#0b1f37',
          800: '#11233f',
          700: '#33425a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'sans-serif'],
      },
      screens: {
        xs: '475px',
      },
      letterSpacing: {
        widest2: '0.18em',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        soft:        '0 1px 3px rgba(17,35,63,0.06), 0 8px 24px -12px rgba(17,35,63,0.12)',
        card:        '0 6px 24px -10px rgba(17,35,63,0.14)',
        'card-hover':'0 18px 40px -14px rgba(0,159,183,0.28)',
        glow:        '0 12px 30px -10px rgba(0,159,183,0.40)',
        premium:     '0 26px 60px -22px rgba(11,35,64,0.45)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(120deg, #00b3cc 0%, #009fb7 60%, #007e91 100%)',
        'brand-soft':     'linear-gradient(120deg, #e7f6fa 0%, #fff8e1 100%)',
        'mesh':           'radial-gradient(760px 380px at 88% -10%, rgba(0,159,183,0.16), transparent 60%), radial-gradient(680px 380px at -8% 110%, rgba(255,193,7,0.14), transparent 55%)',
        'ink-mesh':       'radial-gradient(840px 460px at 82% -10%, rgba(0,179,204,0.22), transparent 60%), radial-gradient(760px 420px at -6% 110%, rgba(255,193,7,0.14), transparent 55%)',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
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
