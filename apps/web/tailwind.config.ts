import type { Config } from 'tailwindcss';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = dirname(fileURLToPath(import.meta.url));

export default {
  darkMode: 'class',
  content: [resolve(webRoot, 'index.html'), resolve(webRoot, 'src/**/*.{ts,tsx}')],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        muted: 'var(--muted)',
        surface: 'var(--surface)',
        surfaceSoft: 'var(--surface-soft)',
        border: 'var(--border)',
        focus: 'var(--focus)',
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81'
        }
      },
      boxShadow: {
        soft: '0 12px 40px rgba(15, 23, 42, 0.08)'
      },
      borderRadius: {
        lg: '0.5rem'
      }
    }
  },
  plugins: [],
} satisfies Config;
