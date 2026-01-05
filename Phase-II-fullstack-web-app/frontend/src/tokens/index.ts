/**
 * Design tokens for Todo Modern application
 * Central export hub for all design tokens
 * @spec ARCHITECTURE.md#design-system
 */

// Color tokens
export * from './colors';

// Typography tokens
export * from './typography';

// Spacing tokens
export * from './spacing';

// Border tokens
export * from './border';

// Shadow tokens
export * from './shadows';

// Animation tokens
export * from './animation';

/**
 * Complete design token set
 */
export const tokens = {
  colors: {
    light: lightColors,
    dark: darkColors,
  },
  typography,
  spacing,
  border: {
    borderRadius,
    borderWidth,
    borderColor,
  },
  shadows,
  animation,
} as const;

/**
 * Type definitions for complete design tokens
 */
export type Tokens = typeof tokens;

/**
 * Helper function to get theme-aware tokens
 * This can be used with a theme context to provide the correct tokens
 */
export function getThemeTokens(theme: 'light' | 'dark') {
  return {
    colors: theme === 'light' ? lightColors : darkColors,
    typography,
    spacing,
    border: {
      borderRadius,
      borderWidth,
      borderColor,
    },
    shadows,
    animation,
  };
}

/**
 * Design system utility functions
 */
export const designSystem = {
  // Color utilities
  getTextColor: (bgColor: string, theme: 'light' | 'dark') => {
    // Simple implementation - in real app, use color contrast calculations
    return theme === 'light' ? '#111827' : '#f9fafb';
  },

  // Size utilities
  getScaledSize: (base: number, scale: number) => base * scale,

  // Layout utilities
  createContainerStyles: (maxWidth?: keyof typeof spacing) => ({
    maxWidth: maxWidth ? spacing[maxWidth] : '1280px',
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingLeft: spacing[4],
    paddingRight: spacing[4],
  }),
} as const;