/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Modern palette ──────────────────────────────────────────────
        // `primary` remapped to indigo, `accent` to violet so every existing
        // primary-*/accent-* class adopts the modern look.
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',   // main CTA indigo
          700: '#4338ca',
          800: '#3730a3',
          900: '#1e1b4b',
        },
        accent: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',   // violet
          600: '#7c3aed',
          700: '#6d28d9',
        },
        navy: {
          900: '#0b0b14',
          800: '#13131f',
          700: '#1c1c2b',
        },
        // `cream` repurposed as light surfaces, `ink` as dark slate, so the
        // existing markup keeps working with a modern light/dark scheme.
        cream: {
          DEFAULT: '#f6f7fb',
          50:  '#ffffff',
          100: '#f6f7fb',
          200: '#eceefb',
          300: '#dfe3f5',
        },
        ink: {
          DEFAULT: '#0f1020',
          900: '#0b0b14',
          800: '#13131f',
          700: '#1f2030',
        },
        slate2: {
          500: '#64748b',
          700: '#334155',
          900: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
      },
      screens: {
        xs: '475px',
      },
      letterSpacing: {
        widest2: '0.2em',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        soft:        '0 2px 8px -2px rgba(17,17,40,0.06), 0 12px 28px -10px rgba(17,17,40,0.10)',
        card:        '0 8px 30px -10px rgba(17,17,40,0.14)',
        'card-hover':'0 24px 50px -16px rgba(79,70,229,0.30)',
        glow:        '0 16px 40px -10px rgba(124,58,237,0.45)',
        premium:     '0 30px 70px -24px rgba(11,11,20,0.6)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(120deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%)',
        'brand-soft':     'linear-gradient(120deg, #eef2ff 0%, #f5f3ff 100%)',
        'mesh':           'radial-gradient(800px 420px at 85% -10%, rgba(124,58,237,0.20), transparent 60%), radial-gradient(700px 420px at -10% 110%, rgba(79,70,229,0.18), transparent 55%)',
        'ink-mesh':       'radial-gradient(900px 500px at 80% -10%, rgba(124,58,237,0.28), transparent 60%), radial-gradient(800px 460px at -5% 110%, rgba(79,70,229,0.22), transparent 55%)',
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
          '50%':      { transform: 'translateY(-14px)' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        'fade-up':  'fade-up 0.7s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in':  'fade-in 0.6s ease-out both',
        marquee:    'marquee 26s linear infinite',
        float:      'float 7s ease-in-out infinite',
        'gradient-x': 'gradient-x 6s ease infinite',
      },
    },
  },
  plugins: [],
}
