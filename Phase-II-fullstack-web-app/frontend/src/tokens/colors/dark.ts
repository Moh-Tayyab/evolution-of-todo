/**
 * Dark mode color palette for Todo Modern application
 * @spec ARCHITECTURE.md#color-palette
 */
export const darkColors = {
  primary: {
    50: '#3d1512',
    100: '#71312b',
    200: '#87342d',
    300: '#a23c33',
    400: '#c24a40',
    500: '#d6675d',
    600: '#e0786f',
    700: '#f0b6b1',
    800: '#f7d4d1',
    900: '#fae8e6',
    950: '#fcf5f4',
  },

  neutral: {
    50: '#030712',
    100: '#111827',
    200: '#1f2937',
    300: '#374151',
    400: '#4b5563',
    500: '#6b7280',
    600: '#9ca3af',
    700: '#d1d5db',
    800: '#e5e7eb',
    900: '#f3f4f6',
    950: '#f9fafb',
  },

  // Semantic colors for dark mode
  success: {
    light: '#166534',
    DEFAULT: '#15803d',
    dark: '#16a34a',
  },
  warning: {
    light: '#d97706',
    DEFAULT: '#d97706',
    dark: '#f59e0b',
  },
  error: {
    light: '#dc2626',
    DEFAULT: '#dc2626',
    dark: '#ef4444',
  },
  info: {
    light: '#2563eb',
    DEFAULT: '#2563eb',
    dark: '#3b82f6',
  },

  // Priority colors for dark mode
  priority: {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#9ca3af',
  },
} as const;