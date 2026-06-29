/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#B1B2FF',
          hover: '#9899E8',
        },
        secondary: '#AAC4FF',
        accent: '#D2DAFF',
        surface: '#EEF1FF',
        card: '#FFFFFF',
        brand: {
          DEFAULT: '#1E1B4B',
          sub: '#6366A3',
          muted: '#A5A7C7',
        },
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      boxShadow: {
        card: '0 1px 4px rgba(30,27,75,0.08), 0 0 0 1px rgba(210,218,255,0.6)',
        sm: '0 1px 3px rgba(30,27,75,0.06)',
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      keyframes: {
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-100%)', opacity: '0' },
        },
        slideUpModal: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'slide-down': 'slideDown 0.3s ease forwards',
        'slide-up': 'slideUp 0.3s ease forwards',
        'slide-up-modal': 'slideUpModal 0.35s cubic-bezier(0.32,0.72,0,1) forwards',
        'fade-in': 'fadeIn 0.2s ease forwards',
      },
    },
  },
  plugins: [],
};
