import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        secondary: {
          50: '#f0fdfa',
          100: '#f7fee7',
          200: '#f3f4f6',
          300: '#e0f2fe',
          400: '#bae6fd',
          500: '#7dd3c0',
          600: '#34d399',
          700: '#10b981',
          800: '#059669',
          900: '#047857',
          950: '#064e3b',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
        success: {
          light: '#86efac',
          DEFAULT: '#22c55e',
          dark: '#16a34a',
        },
        info: {
          light: '#38bdf8',
          DEFAULT: '#0ea5e9',
          dark: '#0284c7',
        },
        warning: {
          light: '#fcd34d',
          DEFAULT: '#f59e0b',
          dark: '#d97706',
        },
        error: {
          light: '#fecaca',
          DEFAULT: '#ef4444',
          dark: '#dc2626',
        },
        border: 'hsl(214.3 31.8% 91.4%)',
        input: 'hsl(214.3 31.8% 91.4%)',
        ring: 'hsl(214.3 31.8% 91.4%)',
        background: 'hsl(0 0% 100%)',
        foreground: 'hsl(222.2 84% 4.9%)',
        primary_foreground: '#ffffff',
        secondary_foreground: '#ffffff',
        muted: 'hsl(210 40% 98%)',
        muted_foreground: 'hsl(215.4 16.3% 46.9%)',
        accent: 'hsl(210 40% 98%)',
        accent_foreground: 'hsl(210 40% 98%)',
        destructive: 'hsl(0 84.2% 60.2%)',
        destructive_foreground: 'hsl(210 40% 98%)',
        card: 'hsl(0 0% 100%)',
        card_foreground: 'hsl(222.2 84% 4.9%)',
        popover: 'hsl(0 0% 100%)',
        popover_foreground: 'hsl(222.2 84% 4.9%)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'caret-blink': {
          '0%, 50%, 100%': { opacity: '1' },
          '25%, 75%': { opacity: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'caret-blink': 'caret-blink 1.25s ease-in-out infinite',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};

export default config;