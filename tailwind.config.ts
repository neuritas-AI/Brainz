import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#2563EB',
          purple: '#7C3AED',
          canvas: '#0F172A',
          panel: '#1E293B',
          text: '#F8FAFC',
          muted: '#CBD5E1',
        },
      },
      boxShadow: {
        glow: '0 18px 40px rgba(124, 58, 237, 0.25)',
      },
      backgroundImage: {
        'hero-radial': 'radial-gradient(circle at top, rgba(124, 58, 237, 0.18), transparent 30%), radial-gradient(circle at right, rgba(37, 99, 235, 0.18), transparent 25%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
