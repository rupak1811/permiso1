/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#e6eef6',
          100: '#c2d4e6',
          200: '#9cb9d5',
          300: '#759fc5',
          400: '#4f85b5',
          500: '#2a6ba4',
          600: '#1f5686',
          700: '#154169',
          800: '#0a2c4b',
          900: '#0a2540',
        },
        secondary: {
          50: '#ffe7ea',
          100: '#ffc7ce',
          200: '#ff9aa4',
          300: '#ff6d79',
          400: '#ff3f4f',
          500: '#b22234',
          600: '#8f1b2a',
          700: '#6c1420',
          800: '#490d16',
          900: '#26060c',
        },
        accent: {
          50: '#e6f0ff',
          100: '#c2d7ff',
          200: '#9cbeff',
          300: '#75a5ff',
          400: '#4f8cff',
          500: '#0046ad',
          600: '#003a90',
          700: '#002e73',
          800: '#002355',
          900: '#001738',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'pulse-glow': 'pulseGlow 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' },
          '50%': { boxShadow: '0 0 30px rgba(59, 130, 246, 0.8)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
