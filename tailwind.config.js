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
          50: '#eef6ff',
          100: '#d9ebff',
          200: '#bcdbff',
          300: '#8ec4ff',
          400: '#59a3ff',
          500: '#0080F8',
          600: '#0066d1',
          700: '#0050a8',
          800: '#00448b',
          900: '#003a73',
          950: '#00264d',
        },
        secondary: {
          50: '#f5f0ff',
          100: '#ede0ff',
          200: '#ddc4ff',
          300: '#c59aff',
          400: '#ab65ff',
          500: '#7028C0',
          600: '#5b18a8',
          700: '#4a1290',
          800: '#3d1276',
          900: '#331262',
          950: '#1a0a33',
        },
        accent: {
          50: '#eeeefe',
          100: '#d8d9fc',
          200: '#b5b7f9',
          300: '#8f8ff4',
          400: '#6a67eb',
          500: '#4743df',
          600: '#2d28c1',
          700: '#1f1a99',
          800: '#080860',
          900: '#060650',
          950: '#040430',
        },
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706',
        },
        danger: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #0080F8, #5b18a8)',
        'gradient-primary-vivid': 'linear-gradient(135deg, #59a3ff, #0080F8, #7028C0)',
        'gradient-hero': 'linear-gradient(160deg, #040430 0%, #080860 40%, #1a0a33 100%)',
        'gradient-hero-accent': 'linear-gradient(135deg, rgba(0,128,248,0.15) 0%, rgba(112,40,192,0.05) 50%, transparent 100%)',
        'gradient-subtle': 'linear-gradient(180deg, #f0f0ff 0%, #f8f9ff 100%)',
        'gradient-card': 'linear-gradient(135deg, #eef6ff 0%, #f5f0ff 100%)',
      },
      boxShadow: {
        'glow': '0 0 40px rgba(0,128,248,0.15)',
        'glow-lg': '0 0 80px rgba(0,128,248,0.2)',
        'glow-sm': '0 0 20px rgba(0,128,248,0.1)',
        'glow-purple': '0 0 40px rgba(112,40,192,0.15)',
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 10px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
        'card-dark': '0 4px 24px rgba(0,0,0,0.25)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'slide-up': 'slide-up 0.6s ease-out',
        'fade-in': 'fade-in 0.8s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: 0.4 },
          '50%': { opacity: 0.8 },
        },
        'slide-up': {
          '0%': { opacity: 0, transform: 'translateY(30px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
}
