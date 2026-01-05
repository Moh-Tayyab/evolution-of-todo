/**
 * Border radius design tokens for Todo Modern application
 * @spec ARCHITECTURE.md#border-radius
 */

/**
 * Border radius scale
 */
export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
} as const;

/**
 * Common border radius patterns
 */
export const borderRadiusPatterns = {
  // Buttons and inputs
  interactive: {
    none: borderRadius.none,
    sm: borderRadius.sm,
    DEFAULT: borderRadius.DEFAULT,
    md: borderRadius.md,
    lg: borderRadius.lg,
    xl: borderRadius.xl,
  },

  // Cards and containers
  container: {
    none: borderRadius.none,
    sm: borderRadius.sm,
    DEFAULT: borderRadius.DEFAULT,
    md: borderRadius.md,
    lg: borderRadius.lg,
    xl: borderRadius.xl,
    '2xl': borderRadius['2xl'],
    '3xl': borderRadius['3xl'],
    full: borderRadius.full,
  },

  // Avatars and badges
  circular: {
    none: borderRadius.none,
    sm: borderRadius.sm,
    DEFAULT: borderRadius.DEFAULT,
    full: borderRadius.full,
  },
} as const;

/**
 * Border width tokens
 */
export const borderWidth = {
  none: '0',
  sm: '1px',
  DEFAULT: '1px',
  md: '2px',
  lg: '3px',
  xl: '4px',
} as const;

/**
 * Border color tokens
 */
export const borderColor = {
  neutral: {
    light: '#f3f4f6',  // light mode border
    DEFAULT: '#e5e7eb', // default border
    dark: '#374151',   // dark mode border
  },
  primary: '#d6675d', // primary color border
} as const;

/**
 * Complete border token set
 */
export const borderTokens = {
  borderRadius,
  borderRadiusPatterns,
  borderWidth,
  borderColor,
} as const;

/**
 * Type definitions for border tokens
 */
export type BorderRadius = typeof borderRadius;
export type BorderRadiusPatterns = typeof borderRadiusPatterns;
export type BorderWidth = typeof borderWidth;
export type BorderColor = typeof borderColor;
export type BorderTokens = typeof borderTokens;

/**
 * Helper type for border radius key
 */
export type BorderRadiusKey = keyof typeof borderRadius;

/**
 * Helper function to get border radius value
 */
export function getBorderRadiusValue(key: BorderRadiusKey): string {
  return borderRadius[key];
}

/**
 * Helper function to create border radius classes
 */
export function createBorderRadiusClasses(
  topLeft: BorderRadiusKey | undefined,
  topRight: BorderRadiusKey | undefined,
  bottomLeft: BorderRadiusKey | undefined,
  bottomRight: BorderRadiusKey | undefined
): string {
  const classes = [];

  if (topLeft) classes.push(`rounded-tl-${topLeft}`);
  if (topRight) classes.push(`rounded-tr-${topRight}`);
  if (bottomLeft) classes.push(`rounded-bl-${bottomLeft}`);
  if (bottomRight) classes.push(`rounded-br-${bottomRight}`);

  return classes.join(' ');
}

/**
 * Helper function to create full border radius class
 */
export function createFullBorderRadiusClass(key: BorderRadiusKey): string {
  return `rounded-${key}`;
}

/**
 * Helper function to create border classes
 */
export function createBorderClasses(
  width: keyof BorderWidth,
  color: keyof typeof borderColor.neutral = 'DEFAULT'
): string {
  return `border-${width} border-${color}`;
}