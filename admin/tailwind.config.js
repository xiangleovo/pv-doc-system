/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        solar: {
          50: '#fefce8',
          100: '#fef9c3',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
        }
      }
    }
  },
  plugins: [],
  corePlugins: {
    preflight: false  // 避免与 Element Plus 样式冲突
  }
}
