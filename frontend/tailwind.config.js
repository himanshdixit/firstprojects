/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/lib/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          50: '#f6f8fb',
          900: '#0f172a',
        },
      },
      boxShadow: {
        soft: '0 8px 28px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
};
