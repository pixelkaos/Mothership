import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,html}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--color-bg-rgb) / <alpha-value>)',
        backgroundElev: 'rgb(var(--color-bg-elev-rgb) / <alpha-value>)',
        foreground: 'rgb(var(--color-fg-rgb) / <alpha-value>)',
        primary: 'rgb(var(--color-primary-rgb) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary-rgb) / <alpha-value>)',
        tertiary: 'rgb(var(--color-tertiary-rgb) / <alpha-value>)',
        muted: 'rgb(var(--color-muted-rgb) / <alpha-value>)',
        positive: 'rgb(var(--color-positive-rgb) / <alpha-value>)',
        warning: 'rgb(var(--color-warning-rgb) / <alpha-value>)',
        danger: 'rgb(var(--color-danger-rgb) / <alpha-value>)',
        focus: 'rgb(var(--color-focus-rgb) / <alpha-value>)',
        acid: 'rgb(var(--accent-acid-rgb) / <alpha-value>)',
        teal: 'rgb(var(--accent-teal-rgb) / <alpha-value>)',
        orange: 'rgb(var(--accent-orange-rgb) / <alpha-value>)',
        cyan: 'rgb(var(--accent-cyan-rgb) / <alpha-value>)',
        pink: 'rgb(var(--accent-pink-rgb) / <alpha-value>)',
        'input-bg': 'rgb(var(--color-input-bg-rgb) / <alpha-value>)',
        'input-border': 'var(--color-input-border)',
      },
      spacing: {
        'space-1': 'var(--space-1)',
        'space-2': 'var(--space-2)',
        'space-3': 'var(--space-3)',
        'space-4': 'var(--space-4)',
        'space-5': 'var(--space-5)',
        'space-6': 'var(--space-6)',
        'space-8': 'var(--space-8)',
        'space-10': 'var(--space-10)',
      },
      borderRadius: {
        'radius-sm': 'var(--radius-sm)',
        'radius-md': 'var(--radius-md)',
        'radius-lg': 'var(--radius-lg)',
      },
      fontFamily: {
        sans: 'var(--font-sans)',
        mono: 'var(--font-mono)',
      },
      fontSize: {
        xs: 'var(--text-xs)',
        sm: 'var(--text-sm)',
        md: 'var(--text-md)',
        lg: 'var(--text-lg)',
        xl: 'var(--text-xl)',
        '2xl': 'var(--text-2xl)',
        '3xl': 'var(--text-3xl)',
        '4xl': 'var(--text-4xl)',
      },
      boxShadow: {
        elev1: 'var(--elev-1)',
        elev2: 'var(--elev-2)',
        ring: 'var(--ring-outline)',
      },
      transitionDuration: {
        120: 'var(--duration-1)',
        200: 'var(--duration-2)',
        300: 'var(--duration-3)',
      },
      transitionTimingFunction: {
        standard: 'var(--ease-standard)',
      },
      zIndex: { app: '0', panel: '20', menu: '30', modal: '40', toast: '50' },
      maxWidth: {
        xs: 'var(--size-xs)',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideInUp: {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 300ms var(--ease-standard) forwards',
        slideInUp: 'slideInUp 300ms ease-out forwards',
      },
    },
  },
  plugins: [],
} satisfies Config;
