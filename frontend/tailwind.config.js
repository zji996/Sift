/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,css}", // 包含 CSS 文件以识别 @apply 中的类
  ],
  theme: {
    extend: {
      // 将 CSS 变量集成到 Tailwind 颜色系统中
      colors: {
        'theme-primary': 'var(--text-primary)',
        'theme-secondary': 'var(--text-secondary)',
        'theme-muted': 'var(--text-muted)',
      },
      backgroundColor: {
        'theme-primary': 'var(--bg-primary)',
        'theme-secondary': 'var(--bg-secondary)',
        'theme-tertiary': 'var(--bg-tertiary)',
        'theme-glass': 'var(--glass-bg)',
      },
      borderColor: {
        'theme-primary': 'var(--border-primary)',
        'theme-secondary': 'var(--border-secondary)',
        'theme-glass': 'var(--glass-border)',
      },
      boxShadow: {
        'theme-soft': 'var(--shadow-soft)',
        'theme-hover': 'var(--shadow-hover)',
      },
      backgroundImage: {
        'theme-gradient-primary': 'var(--primary-gradient)',
        'theme-gradient-secondary': 'var(--secondary-gradient)',
      },
      transitionTimingFunction: {
        'theme-smooth': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'theme-bounce': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
    },
  },
  plugins: [],
}