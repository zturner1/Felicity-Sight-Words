/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        garden: {
          light: '#a7f3d0',
          DEFAULT: '#34d399',
          dark: '#059669',
        },
        egg: {
          shell: '#fef3c7',
          glow: '#fbbf24',
          crack: '#92400e',
        },
        dino: {
          green: '#84cc16',
          purple: '#a855f7',
          orange: '#f97316',
          blue: '#3b82f6',
        }
      },
      animation: {
        'wobble': 'wobble 0.5s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'hatch': 'hatch 1s ease-out forwards',
        'bounce-soft': 'bounce-soft 1s ease-in-out infinite',
      },
      keyframes: {
        wobble: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(251, 191, 36, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(251, 191, 36, 0.8)' },
        },
        hatch: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)', opacity: '0' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
