/**
 * Color exports for Todo Modern application
 * @spec ARCHITECTURE.md#color-palette
 */

// Light mode colors
import { lightColors } from './light';

// Dark mode colors
import { darkColors } from './dark';

/**
 * Combined color scheme that includes both light and dark mode colors
 */
export type ColorScheme = {
  light: typeof lightColors;
  dark: typeof darkColors;
};

/**
 * Type definitions for color values
 */
export type ColorValue = string;

/**
 * Type definitions for primary color scale
 */
export type PrimaryColors = {
  '50': ColorValue;
  '100': ColorValue;
  '200': ColorValue;
  '300': ColorValue;
  '400': ColorValue;
  '500': ColorValue;
  '600': ColorValue;
  '700': ColorValue;
  '800': ColorValue;
  '900': ColorValue;
  '950': ColorValue;
};

/**
 * Type definitions for semantic colors
 */
export type SemanticColors = {
  success: {
    light: ColorValue;
    DEFAULT: ColorValue;
    dark: ColorValue;
  };
  warning: {
    light: ColorValue;
    DEFAULT: ColorValue;
    dark: ColorValue;
  };
  error: {
    light: ColorValue;
    DEFAULT: ColorValue;
    dark: ColorValue;
  };
  info: {
    light: ColorValue;
    DEFAULT: ColorValue;
    dark: ColorValue;
  };
};

/**
 * Type definitions for priority colors
 */
export type PriorityColors = {
  high: ColorValue;
  medium: ColorValue;
  low: ColorValue;
};

/**
 * Type definitions for neutral colors
 */
export type NeutralColors = {
  '50': ColorValue;
  '100': ColorValue;
  '200': ColorValue;
  '300': ColorValue;
  '400': ColorValue;
  '500': ColorValue;
  '600': ColorValue;
  '700': ColorValue;
  '800': ColorValue;
  '900': ColorValue;
  '950': ColorValue;
};

/**
 * Type definitions for the complete color palette
 */
export type CompleteColorPalette = {
  primary: PrimaryColors;
  neutral: NeutralColors;
  semantic: SemanticColors;
  priority: PriorityColors;
};