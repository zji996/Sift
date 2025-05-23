/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,css}", // 包含 CSS 文件以识别 @apply 中的类
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} 