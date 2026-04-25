/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary earthy palette
        terracotta: {
          50: '#FEF4F0',
          100: '#FDE5DB',
          200: '#FBC9B5',
          300: '#F6A082',
          400: '#ED7752',
          500: '#C35831',
          600: '#A34726',
          700: '#83381E',
          800: '#6A2D18',
          900: '#4A1F10',
        },
        saffron: {
          50: '#FFFBEB',
          100: '#FFF3C4',
          200: '#FFE58A',
          300: '#FFD145',
          400: '#F5B818',
          500: '#E8951C',
          600: '#CC7410',
          700: '#A15311',
          800: '#844216',
          900: '#6D3618',
        },
        indigo: {
          50: '#EEF1F8',
          100: '#D5DCEF',
          200: '#ABB9DF',
          300: '#7E93CC',
          400: '#5570B6',
          500: '#2D3A6B',
          600: '#273264',
          700: '#1E2750',
          800: '#171D3B',
          900: '#0F1329',
        },
        cream: {
          50: '#FFFDF9',
          100: '#FEF7ED',
          200: '#FDEFD8',
          300: '#FBE4BD',
          400: '#F8D6A0',
          500: '#F2C47A',
        },
        gold: {
          400: '#D4A838',
          500: '#B8860B',
          600: '#9A7209',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Outfit"', '"DM Sans"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'texture-subtle': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c35831' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        'hero-pattern': "linear-gradient(135deg, #FEF7ED 0%, #FDEFD8 50%, #FEF7ED 100%)",
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideInRight: { '0%': { opacity: '0', transform: 'translateX(20px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
      },
    },
  },
  plugins: [],
};
