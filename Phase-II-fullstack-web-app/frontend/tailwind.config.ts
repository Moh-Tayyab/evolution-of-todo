// @spec: specs/002-fullstack-web-app/plan.md
// Tailwind CSS configuration - Professional SaaS Theme | Neutral Slate + Indigo

import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // CSS variable colors for theming
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        // Priority colors - refined professional tones
        priority: {
          high: '#dc2626',   /* red-600 */
          medium: '#d97706', /* amber-600 */
          low: '#059669',    /* emerald-600 */
        },
        // Dark theme colors - slate based
        dark: {
          bg: '#020617',     /* slate-950 */
          card: '#0f172a',   /* slate-900 */
          border: '#334155', /* slate-700 */
          muted: '#64748b',  /* slate-500 */
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
        'premium-gradient': 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
        'dark-gradient': 'linear-gradient(to bottom right, #020617, #0f172a, #1e293b)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(99, 102, 241, 0.25)',
        'glow-lg': '0 0 40px rgba(99, 102, 241, 0.35)',
        'premium': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'card-hover': '0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'gradient': 'gradient 8s linear infinite',
        'spotlight': 'spotlight 2s ease .75s 1 forwards',
        'border-beam': 'border-beam calc(var(--duration)*1s) infinite linear',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        spotlight: {
          '0%': { opacity: '0', transform: 'translate(-72%, -62%) scale(0.5)' },
          '100%': { opacity: '1', transform: 'translate(-50%,-40%) scale(1)' },
        },
        'border-beam': {
          '100%': { 'offset-distance': '100%' },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Cal Sans', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
