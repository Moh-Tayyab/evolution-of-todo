// @spec: specs/002-fullstack-web-app/plan.md
// Tailwind CSS configuration

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fcf5f4',
          100: '#fae8e6',
          200: '#f7d4d1',
          300: '#f0b6b1',
          400: '#e0786f',
          500: '#d6675d',
          600: '#c24a40',
          700: '#a23c33',
          800: '#87342d',
          900: '#71312b',
          950: '#3d1512',
        },
        priority: {
          high: '#ef4444',
          medium: '#f59e0b',
          low: '#6b7280',
        },
      },
    },
  },
  plugins: [],
};

export default config;
