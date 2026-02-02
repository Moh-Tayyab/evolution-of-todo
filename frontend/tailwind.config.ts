// @spec: Premium Luxury Design System
// Expert-level color palette with violet-based premium gradient

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
        // Primary: Premium Violet-Purple-Fuchsia Gradient Palette
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',  // Main primary - violet
          600: '#7c3aed',  // Darker violet
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
          DEFAULT: '#7c3aed',
          foreground: '#ffffff',
        },

        // Premium Purple Gradient
        purple: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },

        // Premium Fuchsia Accent
        fuchsia: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
          950: '#4a044e',
        },

        // Semantic: Premium Gray Scale (Slate)
        background: '#ffffff',
        foreground: '#0f172a',

        card: {
          DEFAULT: '#ffffff',
          foreground: '#0f172a',
        },

        popover: {
          DEFAULT: '#ffffff',
          foreground: '#0f172a',
        },

        secondary: {
          DEFAULT: '#f8fafc',
          foreground: '#0f172a',
        },

        muted: {
          DEFAULT: '#f8fafc',
          foreground: '#64748b',
        },

        accent: {
          DEFAULT: '#f3e8ff',
          foreground: '#0f172a',
        },

        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },

        border: '#e2e8f0',
        input: '#e2e8f0',
        ring: '#7c3aed',

        // Premium Priority Colors
        priority: {
          high: '#f43f5e',      // rose-500
          medium: '#8b5cf6',    // violet-500
          low: '#10b981',       // emerald-500
        },

        // Premium Gold Accent
        gold: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
          950: '#422006',
        },

        // Dark Mode Premium Palette
        dark: {
          background: '#0a0a0f',    // Near black with purple tint
          foreground: '#f1f5f9',
          card: '#13131a',          // Elevated dark card
          border: '#27272a',
          muted: '#27272a',
        },
      },

      borderRadius: {
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },

      boxShadow: {
        'premium': '0 4px 20px rgba(139, 92, 246, 0.15)',
        'premium-lg': '0 10px 40px rgba(139, 92, 246, 0.2)',
        'premium-xl': '0 20px 60px rgba(139, 92, 246, 0.25)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.08)',
        'glass-dark': '0 8px 32px rgba(0, 0, 0, 0.4)',
      },

      backgroundImage: {
        'gradient-premium': 'linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #c026d3 100%)',
        'gradient-gold': 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
        'gradient-ocean': 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #6366f1 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
