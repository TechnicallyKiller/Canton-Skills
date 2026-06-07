/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: '#080B14',
        surface: '#0F1524',
        'surface-2': '#141C30',
        border: '#1E2740',
        text: '#E6EAF2',
        muted: '#8A96B0',
        accent: '#4F7DFF',
        'accent-2': '#22D3EE',
        ok: '#34D399',
        warn: '#FBBF24',
        docs: '#94A3B8',
        preview: '#A78BFA',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      maxWidth: { content: '1120px' },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        drift: {
          '0%,100%': { transform: 'translate(0,0)' },
          '50%': { transform: 'translate(-2%, 2%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out both',
        drift: 'drift 18s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
