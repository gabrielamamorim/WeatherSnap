module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        dia: '#70aefa',
        noite: '#171f2d',
        'dia-ensolarado': '#a3c4f3',
        'dia-nublado': '#5a7dbf',
        'dia-chuvoso': '#466ca8',
        'noite-nublada': '#1a264b',
        'noite-chuvosa': '#0f1a36',
        'noite-temporal': '#0b1323',
      },
      fontSize: {
        'xs': '.75rem',
        'sm': '.875rem',
        'tiny': '.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '4rem',
        '7xl': '5rem',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}