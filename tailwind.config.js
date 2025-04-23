/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        'sm': '475px',
      },
      fontFamily: {
        nunito: 'Nunito, "Helvetica Neue", Helvetica, Arial, sans-serif',
      },
      colors: {
        primary: '#337ab7',
        'blue-texture': '#388fd9',
      },
      transitionDuration: {
        45: '45ms'
      },
      fontSize: {
        '2sm': '0.82rem'
      }
    },
  },
  plugins: [
    /** @type {import('tailwindcss/types/config').PluginCreator} */
    ({ addUtilities }) => {
      addUtilities({
        '.centeric': {
          '@apply flex items-center justify-center': {},
        },
        '.scroll-default': {}
      })
    },
  ],
}

// shadow-[1px_2px_6px_#00000012]

// '.line-link': {
// color: '#337ab7',
// 'background-image': 'linear-gradient(#337ab7 0 0)',
// 'background-position': '0 90%',
// 'background-size': '100% 0px',
// 'padding-bottom': '2px',
// 'background-repeat': 'no-repeat',
// 'transition-property': 'color, background-size',
// },
// '.line-link:hover': {
// 'background-size': '100% 1px',
// },