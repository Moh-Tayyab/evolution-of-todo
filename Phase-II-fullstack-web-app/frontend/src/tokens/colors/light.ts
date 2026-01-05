/**
 * Light mode color palette for Todo Modern application
 * @spec ARCHITECTURE.md#color-palette
 */
export const lightColors = {
  // Primary (brand coral)
  primary: {
    50: '#fcf5f4',
    100: '#fae8e6',
    200: '#f7d4d1',
    300: '#f0b6b1',
    400: '#e0786f',
    500: '#d6675d',  // Primary brand
    600: '#c24a40',
    700: '#a23c33',
    800: '#87342d',
    900: '#71312b',
    950: '#3d1512',
  },

  // Semantic colors
  success: {
    light: '#dcfce7',
    DEFAULT: '#16a34a',
    dark: '#15803d',
  },
  warning: {
    light: '#fef3c7',
    DEFAULT: '#f59e0b',
    dark: '#d97706',
  },
  error: {
    light: '#fee2e2',
    DEFAULT: '#ef4444',
    dark: '#dc2626',
  },
  info: {
    light: '#dbeafe',
    DEFAULT: '#3b82f6',
    dark: '#2563eb',
  },

  // Priority colors
  priority: {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#6b7280',
  },

  // Neutral grays
  neutral: {
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
} as const;