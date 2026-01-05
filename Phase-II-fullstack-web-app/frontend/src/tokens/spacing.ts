/**
 * Spacing design tokens for Todo Modern application
 * 8px grid system
 * @spec ARCHITECTURE.md#spacing-system
 */

/**
 * Spacing scale based on 8px grid
 * Values are in rem units (1rem = 16px)
 */
export const spacing = {
  0: '0',
  px: '1px',
  0.5: '0.125rem',   // 2px
  1: '0.25rem',      // 4px
  1.5: '0.375rem',   // 6px
  2: '0.5rem',       // 8px
  2.5: '0.625rem',   // 10px
  3: '0.75rem',      // 12px
  3.5: '0.875rem',   // 14px
  4: '1rem',         // 16px
  5: '1.25rem',      // 20px
  6: '1.5rem',       // 24px
  7: '1.75rem',      // 28px
  8: '2rem',         // 32px
  9: '2.25rem',      // 36px
  10: '2.5rem',      // 40px
  12: '3rem',        // 48px
  16: '4rem',        // 64px
  20: '5rem',        // 80px
  24: '6rem',        // 96px
  32: '8rem',        // 128px
  40: '10rem',       // 160px
  48: '12rem',       // 192px
  56: '14rem',       // 224px
  64: '16rem',       // 256px
} as const;

/**
 * Common spacing patterns
 */
export const spacingPatterns = {
  // Padding
  padding: {
    none: spacing[0],
    xs: spacing[1],
    sm: spacing[2],
    md: spacing[3],
    lg: spacing[4],
    xl: spacing[6],
    '2xl': spacing[8],
    '3xl': spacing[12],
    '4xl': spacing[16],
  },

  // Margin
  margin: {
    none: spacing[0],
    xs: spacing[1],
    sm: spacing[2],
    md: spacing[3],
    lg: spacing[4],
    xl: spacing[6],
    '2xl': spacing[8],
    '3xl': spacing[12],
    '4xl': spacing[16],
  },

  // Gap (for grid and flexbox)
  gap: {
    none: spacing[0],
    xs: spacing[2],
    sm: spacing[3],
    md: spacing[4],
    lg: spacing[6],
    xl: spacing[8],
    '2xl': spacing[12],
  },

  // Layout spacing
  layout: {
    container: spacing[6],     // 96px max-width container padding
    section: spacing[24],       // 384px between sections
  },
} as const;

/**
 * Complete spacing token set
 */
export const spacingTokens = {
  spacing,
  spacingPatterns,
} as const;

/**
 * Type definitions for spacing tokens
 */
export type Spacing = typeof spacing;
export type SpacingPatterns = typeof spacingPatterns;
export type SpacingTokens = typeof spacingTokens;

/**
 * Helper type for spacing key
 */
export type SpacingKey = keyof typeof spacing;

/**
 * Helper function to get spacing value
 */
export function getSpacingValue(key: SpacingKey): string {
  return spacing[key];
}

/**
 * Helper function to create padding classes
 */
export function createPaddingClasses(
  top: SpacingKey | undefined,
  right: SpacingKey | undefined,
  bottom: SpacingKey | undefined,
  left: SpacingKey | undefined
): string {
  const classes = [];

  if (top) classes.push(`pt-${top}`);
  if (right) classes.push(`pr-${right}`);
  if (bottom) classes.push(`pb-${bottom}`);
  if (left) classes.push(`pl-${left}`);

  return classes.join(' ');
}

/**
 * Helper function to create margin classes
 */
export function createMarginClasses(
  top: SpacingKey | undefined,
  right: SpacingKey | undefined,
  bottom: SpacingKey | undefined,
  left: SpacingKey | undefined
): string {
  const classes = [];

  if (top) classes.push(`mt-${top}`);
  if (right) classes.push(`mr-${right}`);
  if (bottom) classes.push(`mb-${bottom}`);
  if (left) classes.push(`ml-${left}`);

  return classes.join(' ');
}