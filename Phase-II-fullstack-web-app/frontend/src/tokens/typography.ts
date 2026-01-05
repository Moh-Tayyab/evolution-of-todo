/**
 * Typography design tokens for Todo Modern application
 * @spec ARCHITECTURE.md#typography-scale
 */

/**
 * Font families configuration
 */
export const fontFamily = {
  sans: ['Inter', 'system-ui', 'sans-serif'] as const,
  mono: ['JetBrains Mono', 'Monaco', 'monospace'] as const,
} as const;

/**
 * Font sizes with corresponding line heights
 * Format: [fontSize, { lineHeight: 'value' }]
 */
export const fontSize = {
  xs: ['0.75rem', { lineHeight: '1rem' }] as const,      // 12px
  sm: ['0.875rem', { lineHeight: '1.25rem' }] as const,   // 14px
  base: ['1rem', { lineHeight: '1.5rem' }] as const,      // 16px
  lg: ['1.125rem', { lineHeight: '1.75rem' }] as const,   // 18px
  xl: ['1.25rem', { lineHeight: '1.75rem' }] as const,    // 20px
  '2xl': ['1.5rem', { lineHeight: '2rem' }] as const,     // 24px
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }] as const, // 30px
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }] as const,  // 36px
  '5xl': ['3rem', { lineHeight: '1' }] as const,         // 48px
  '6xl': ['3.75rem', { lineHeight: '1' }] as const,       // 60px
} as const;

/**
 * Font weight tokens
 */
export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
} as const;

/**
 * Letter spacing tokens
 */
export const letterSpacing = {
  tighter: '-0.025em' as const,
  tight: '-0.015em' as const,
  normal: '0' as const,
  wide: '0.015em' as const,
  wider: '0.025em' as const,
} as const;

/**
 * Complete typography token set
 */
export const typography = {
  fontFamily,
  fontSize,
  fontWeight,
  letterSpacing,
} as const;

/**
 * Type definitions for typography tokens
 */
export type FontFamily = typeof fontFamily;
export type FontSize = typeof fontSize;
export type FontWeight = typeof fontWeight;
export type LetterSpacing = typeof letterSpacing;
export type Typography = typeof typography;

/**
 * Type definitions for font size entries
 */
export type FontSizeEntry = [string, { lineHeight: string }];

/**
 * Helper type for CSS font property
 */
export type CSSFont = {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing?: string;
};

/**
 * Helper function to create a complete CSS font style
 */
export function createFontStyle(
  size: keyof FontSize,
  weight: keyof FontWeight = 'normal',
  family: keyof FontFamily = 'sans',
  letterSpacingKey?: keyof LetterSpacing
): CSSFont {
  const [fontSizeValue, { lineHeight }] = fontSize[size];
  const fontWeightValue = fontWeight[weight];
  const fontFamilyValue = fontFamily[family].join(', ');
  const letterSpacingValue = letterSpacingKey ? letterSpacing[letterSpacingKey] : undefined;

  return {
    fontFamily: fontFamilyValue,
    fontSize: fontSizeValue,
    fontWeight: fontWeightValue,
    lineHeight,
    ...(letterSpacingValue && { letterSpacing: letterSpacingValue }),
  };
}