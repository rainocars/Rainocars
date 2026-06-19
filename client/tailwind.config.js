/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        'surface-elevated': 'rgb(var(--color-surface-elevated) / <alpha-value>)',
        accent: '#DC2626',
        'off-white': 'rgb(var(--color-text) / <alpha-value>)',
        muted: '#6B7280',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        success: '#34d399',
        warning: '#6B7280',
        danger: '#f87171',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      backgroundImage: {
        'premium-gradient': 'radial-gradient(circle at 20% 15%, rgba(220, 38, 38, 0.16) 0%, transparent 28%), radial-gradient(circle at 80% 70%, rgba(220, 38, 38, 0.08) 0%, transparent 30%), linear-gradient(180deg, rgb(var(--color-primary)) 0%, rgb(var(--color-surface)) 100%)',
        'hero-glow': 'linear-gradient(rgba(220, 38, 38, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(220, 38, 38, 0.05) 1px, transparent 1px), radial-gradient(circle at 50% 10%, rgba(220, 38, 38, 0.18), transparent 36%)',
        'shimmer-premium': 'linear-gradient(105deg, transparent 40%, rgba(220, 38, 38, 0.12) 50%, transparent 60%)',
        'red-shine': 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
      },
      boxShadow: {
        premium: '0 24px 50px -18px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(107, 114, 128, 0.16)',
        'red-glow': '0 0 32px rgba(220, 38, 38, 0.28)',
      },
      animation: {
        'pulse-slow': 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 6s ease-in-out infinite',
        'fade-up': 'fadeUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        shimmer: 'shimmer 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}
