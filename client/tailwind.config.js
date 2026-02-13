/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"DM Serif Display"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      colors: {
        gallery: {
          50: '#faf9f7',
          100: '#f0eeea',
          200: '#e2dfd8',
          300: '#c9c4b8',
          400: '#a8a08f',
          500: '#8d8472',
          600: '#756b5a',
          700: '#5e564a',
          800: '#4a443c',
          900: '#2d2a25',
          950: '#1a1815',
        },
        accent: {
          gold: '#c9a84c',
          copper: '#b87333',
          cream: '#fdf6e3',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};