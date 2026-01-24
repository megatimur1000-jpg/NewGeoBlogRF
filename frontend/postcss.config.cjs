module.exports = {
  plugins: {
    'tailwindcss': {},
    'autoprefixer': {},
    'postcss-preset-env': {
      features: {
        'nesting-rules': true
      }
    },
    ...(process.env.NODE_ENV === 'production' ? { 'cssnano': {} } : {})
  }
} 