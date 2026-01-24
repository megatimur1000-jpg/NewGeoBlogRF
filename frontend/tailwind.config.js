/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#1a365d',
        secondary: '#2d3748',
        background: '#e8e8e8',
        text: '#2d3748',
        accent: {
          teal: '#319795',
          blue: '#3182ce',
          green: '#38a169'
        },
        'light-gray': '#F0F2F5',
        'medium-gray': '#D1D8E0',
        'dark-text': '#333333',
        success: '#48bb78',
        warning: '#ecc94b',
        error: '#f56565'
      },
      width: {
        'sidebar': '4rem',
        'sidebar-expanded': '16rem'
      },
      height: {
        'header': '70px',
        'content': 'calc(100vh - 70px)'
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'light': '0 2px 8px rgba(0, 0, 0, 0.05)',
        'deep': '0 8px 25px rgba(0, 0, 0, 0.15)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
      },
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif'],
        'lato': ['Lato', 'sans-serif']
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
        'nav': 'var(--nav-height)',
        'bottom-nav': 'var(--bottom-nav-height)',
      },
      height: {
        'header': '70px',
        'content': 'calc(100vh - 70px)',
        'screen-nav': 'calc(100vh - var(--nav-height))',
        'screen-bottom-nav': 'calc(100vh - var(--bottom-nav-height))',
        'screen-both-nav': 'calc(100vh - var(--nav-height) - var(--bottom-nav-height))',
      },
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-secondary': 'var(--gradient-secondary)',
        'gradient-accent': 'var(--gradient-accent)',
        'gradient-hero': 'var(--gradient-hero)',
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'light': '0 2px 8px rgba(0, 0, 0, 0.05)',
        'deep': '0 8px 25px rgba(0, 0, 0, 0.15)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'elevated': 'var(--shadow-elevated)',
      },
      zIndex: {
        '-1': '-1',
        '60': '60',
        '70': '70'
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding'
      }
    },
  },
  variants: {
    extend: {},
  },

} 