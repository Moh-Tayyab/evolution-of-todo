// @spec: specs/002-fullstack-web-app/plan.md
// Tailwind CSS configuration - Monza Palette Theme

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
        // Monza Color Palette - Monza-inspired theme with earthy, warm tones
        monza: {
          50: '#fff1f3',     /* Light Cream - Background */
          100: '#ffe0e4',    /* Light Yellow - Highlights */
          200: '#ffc6cd',    /* Light Salmon - Card headers */
          300: '#ff9ea9',    /* Light Orange - Important items */
          400: '#ff6678',    /* Coral - Default alerts */
          500: '#fd364d',    /* Medium Salmon - Active elements */
          600: '#eb1730',    /* Terra Cotta - Sections */
          700: '#ce1026',    /* Medium Terracotta - Borders */
          800: '#a31122',    /* Dark Terra Cotta - Text */
          900: '#871522',    /* Burnt Orange - Headers */
          950: '#4a050d',    /* Dark Brown - Footers */
        },
        // Semantic Colors - Updated with Monza-inspired tones
        background: '#fff1f3',
        foreground: '#871522',
        card: {
          DEFAULT: '#ffffff',
          foreground: '#871522',
        },
        popover: {
          DEFAULT: '#ffffff',
          foreground: '#871522',
        },
        primary: {
          DEFAULT: '#871522',
          foreground: '#fff1f3',
        },
        secondary: {
          DEFAULT: '#eb1730',
          foreground: '#fff1f3',
        },
        muted: {
          DEFAULT: '#ce1026',
          foreground: '#871522',
        },
        accent: {
          DEFAULT: '#ff9ea9',
          foreground: '#fff1f3',
        },
        destructive: {
          DEFAULT: '#fd364d',
          foreground: '#fff1f3',
        },
        border: '#eb1730',
        input: '#fff1f3',
        ring: '#871522',
        // Priority colors - Monza tones
        priority: {
          high: '#fd364d',
          medium: '#ce1026',
          low: '#a31122',
        },
        // Updated primary scale with Monza colors
        primary: {
          50: '#fff1f3',
          100: '#ffe0e4',
          200: '#ffc6cd',
          300: '#ff9ea9',
          400: '#ff6678',
          500: '#fd364d',
          600: '#eb1730',
          700: '#ce1026',
          800: '#a31122',
          900: '#871522',
          950: '#4a050d',
        },
        // Dark theme - Monza Dark (warm terra cotta)
        dark: {
          background: '#2a1a1a',  /* Very dark brown */
          card: '#4a050d',     /* Dark brown */
          border: '#eb1730',    /* Medium terra cotta */
          muted: '#871522',     /* Burnt orange */
          foreground: '#fff1f3',    /* Light cream text */
        },
      },
    },
  },
  plugins: [],
};

export default config;
