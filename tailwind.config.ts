import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cream: '#f5f3ee',
        sage: { DEFAULT: '#5c6b5a', light: '#8fa08c', dark: '#3d4a3c' },
        gold: '#c9a961',
        'sage-ink': '#1a2420',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
