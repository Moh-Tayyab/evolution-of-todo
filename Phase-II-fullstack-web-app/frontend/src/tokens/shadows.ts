/**
 * Shadow design tokens for Todo Modern application
 * @spec ARCHITECTURE.md#shadows
 */

/**
 * Shadow scale with RGB values
 */
export const shadows = {
  // Basic shadows
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',

  // Colored shadows for emphasis
  primary: '0 10px 15px -3px rgb(214 103 93 / 0.3)',
  primaryLg: '0 20px 25px -5px rgb(214 103 93 / 0.4)',

  // Inner shadows
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
} as const;

/**
 * Shadow elevation levels
 */
export const shadowElevations = {
  none: 'none',
  // Floating elements (cards, modals, dropdowns)
  float: {
    sm: shadows.sm,
    DEFAULT: shadows.DEFAULT,
    md: shadows.md,
    lg: shadows.lg,
    xl: shadows.xl,
    '2xl': shadows['2xl'],
  },

  // Interactive elements (buttons, inputs)
  interactive: {
    hover: shadows.md,
    active: shadows.sm,
    focus: shadows.DEFAULT,
  },

  // Highlight elements (selected states, active states)
  highlight: {
    primary: shadows.primary,
    primaryLg: shadows.primaryLg,
  },

  // Input fields
  input: {
    none: shadows.none,
    focus: shadows.sm,
    error: shadows.md,
  },
} as const;

/**
 * Complete shadow token set
 */
export const shadowTokens = {
  shadows,
  shadowElevations,
} as const;

/**
 * Type definitions for shadow tokens
 */
export type Shadows = typeof shadows;
export type ShadowElevations = typeof shadowElevations;
export type ShadowTokens = typeof shadowTokens;

/**
 * Helper type for shadow key
 */
export type ShadowKey = keyof typeof shadows;

/**
 * Helper function to get shadow value
 */
export function getShadowValue(key: ShadowKey): string {
  return shadows[key];
}

/**
 * Helper function to create shadow classes
 */
export function createShadowClass(key: ShadowKey): string {
  return `shadow-${key}`;
}

/**
 * Helper function to create shadow utilities with hover states
 */
export function createInteractiveShadowClasses(
  defaultKey: ShadowKey,
  hoverKey: ShadowKey,
  activeKey: ShadowKey
): string {
  return `${createShadowClass(defaultKey)} hover:${createShadowClass(hoverKey)} active:${createShadowClass(activeKey)}`;
}

/**
 * Helper function to create focus shadow utility
 */
export function createFocusShadowClass(key: ShadowKey): string {
  return `focus:shadow-${key}`;
}

/**
 * Shadow utilities for specific use cases
 */
export const shadowUtils = {
  // Card shadows
  card: {
    default: createShadowClass('DEFAULT'),
    hover: createInteractiveShadowClasses('DEFAULT', 'md', 'sm'),
    elevated: createShadowClass('lg'),
  },

  // Button shadows
  button: {
    default: 'shadow-none',
    hover: createShadowClass('sm'),
    active: 'shadow-none',
    elevated: createShadowClass('md'),
  },

  // Modal shadows
  modal: {
    backdrop: 'shadow-none',
    content: createShadowClass('2xl'),
  },

  // Dropdown shadows
  dropdown: {
    default: createShadowClass('lg'),
  },

  // Card hover effects
  hover: {
    lift: `transition-shadow duration-300 hover:shadow-lg`,
    bounce: `transition-shadow duration-200 hover:shadow-xl`,
    glow: `shadow-primary hover:shadow-primaryLg transition-all duration-300`,
  },
} as const;

/**
 * Type definitions for shadow utilities
 */
export type ShadowUtils = typeof shadowUtils;