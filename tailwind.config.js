/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        emerald: {
          50: '#e8fff6',
          100: '#c7f7e3',
          200: '#94f0cc',
          300: '#39d9a7',
          400: '#00c981',
          500: '#00A36C',
          600: '#0b7e5d',
          700: '#0d654c',
          800: '#0f523e',
          900: '#0f4435',
        },
        gold: {
          50: '#fffef0',
          100: '#fff9c2',
          200: '#fff387',
          300: '#ffe443',
          400: '#ffd700',
          500: '#efc007',
          600: '#cf9002',
          700: '#a66602',
          800: '#894f0a',
          900: '#74420f',
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      },
      screens: {
        'xs': '320px',
        '3xl': '1600px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      fontFamily: {
        'heading': ['var(--font-heading)', 'system-ui', 'sans-serif'],
        'body': ['var(--font-body)', 'system-ui', 'sans-serif'], 
        'mono': ['var(--font-mono)', 'Monaco', 'monospace'],
      }
    },
  },
  plugins: [],
};