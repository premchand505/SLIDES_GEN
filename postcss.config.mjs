/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // This is the correct plugin for Tailwind v4
    '@tailwindcss/postcss': {},
    // This is required for CSS to work in all browsers
    'autoprefixer': {},
  },
}

export default config