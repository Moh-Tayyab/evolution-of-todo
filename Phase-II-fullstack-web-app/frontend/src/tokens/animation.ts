/**
 * Animation design tokens for Todo Modern application
 * @spec ARCHITECTURE.md#animation-tokens
 */

/**
 * Animation duration tokens in milliseconds
 */
export const duration = {
  instant: '100ms',
  fast: '200ms',
  normal: '300ms',
  slow: '500ms',
  slower: '700ms',
} as const;

/**
 * Easing function tokens
 */
export const easing = {
  // Standard CSS easings
  linear: 'linear',
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',

  // Custom cubic-bezier easings
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  gentle: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
} as const;

/**
 * Animation delay tokens
 */
export const delay = {
  100: '100ms',
  200: '200ms',
  300: '300ms',
  500: '500ms',
  700: '700ms',
} as const;

/**
 * Animation timing presets
 */
export const timingPresets = {
  // Fast transitions (hover states, focus states)
  fast: {
    duration: duration.fast,
    easing: easing.gentle,
  },

  // Normal transitions (default animations)
  normal: {
    duration: duration.normal,
    easing: easing.easeInOut,
  },

  // Slow transitions (loading states, important animations)
  slow: {
    duration: duration.slow,
    easing: easing.easeInOut,
  },

  // Bounce animations
  bounce: {
    duration: duration.slow,
    easing: easing.bounce,
  },

  // Sharp animations
  sharp: {
    duration: duration.fast,
    easing: easing.sharp,
  },

  // Smooth animations
  smooth: {
    duration: duration.normal,
    easing: easing.smooth,
  },
} as const;

/**
 * Stagger animation presets
 */
export const staggerPresets = {
  // Fast stagger (quick reveals)
  fast: 0.05,

  // Normal stagger (list animations)
  normal: 0.1,

  // Slow stagger (large reveals)
  slow: 0.2,

  // Card stagger (card layouts)
  card: 0.08,
} as const;

/**
 * Animation keyframe tokens
 */
export const keyframes = {
  // Fade animations
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },

  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
  },

  // Slide animations
  slideInUp: {
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },

  slideInDown: {
    from: { opacity: 0, transform: 'translateY(-20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },

  slideInLeft: {
    from: { opacity: 0, transform: 'translateX(-20px)' },
    to: { opacity: 1, transform: 'translateX(0)' },
  },

  slideInRight: {
    from: { opacity: 0, transform: 'translateX(20px)' },
    to: { opacity: 1, transform: 'translateX(0)' },
  },

  scaleIn: {
    from: { opacity: 0, transform: 'scale(0.95)' },
    to: { opacity: 1, transform: 'scale(1)' },
  },

  bounce: {
    '0%, 100%': { transform: 'translateY(0)' },
    '50%': { transform: 'translateY(-10px)' },
  },
} as const;

/**
 * Complete animation token set
 */
export const animation = {
  duration,
  easing,
  delay,
  timingPresets,
  staggerPresets,
  keyframes,
} as const;

/**
 * Type definitions for animation tokens
 */
export type Duration = typeof duration;
export type Easing = typeof easing;
export type Delay = typeof delay;
export type TimingPresets = typeof timingPresets;
export type StaggerPresets = typeof staggerPresets;
export type Keyframes = typeof keyframes;
export type Animation = typeof animation;

/**
 * Helper type for duration key
 */
export type DurationKey = keyof typeof duration;

/**
 * Helper type for easing key
 */
export type EasingKey = keyof typeof easing;

/**
 * Helper function to create animation CSS
 */
export function createAnimationCSS(
  keyframesName: string,
  durationValue: DurationKey | string = 'normal',
  easingValue: EasingKey | string = 'easeInOut',
  delayValue?: DelayKey | string
): string {
  const duration = typeof durationValue === 'string' ? durationValue : duration[durationValue];
  const easing = typeof easingValue === 'string' ? easingValue : easing[easingValue];
  const delay = delayValue ? (typeof delayValue === 'string' ? delayValue : delay[delayValue]) : '';

  return `${duration} ${easing}${delay ? ` ${delay}` : ''}`;
}

/**
 * Helper function to create stagger animation CSS
 */
export function createStaggerCSS(staggerValue: keyof StaggerPresets | number): string {
  const stagger = typeof staggerValue === 'number' ? staggerValue : staggerPresets[staggerValue];
  return `${stagger}s`;
}

/**
 * Animation utilities for Framer Motion
 */
export const framerMotion = {
  // Common animation variants
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },

  fadeInUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  },

  fadeInDown: {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  },

  fadeInLeft: {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  },

  fadeInRight: {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
  },

  scaleIn: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  },

  // Stagger container
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerPresets.normal,
      },
    },
  },

  // Transition presets
  transitions: {
    fast: {
      duration: duration.fast,
      ease: easing.easeInOut,
    },
    normal: {
      duration: duration.normal,
      ease: easing.easeInOut,
    },
    slow: {
      duration: duration.slow,
      ease: easing.easeInOut,
    },
    bounce: {
      duration: duration.slow,
      ease: easing.bounce,
    },
  },
} as const;

/**
 * Type definitions for Framer Motion utilities
 */
export type FramerMotion = typeof framerMotion;

/**
 * Performance optimization tokens
 */
export const performance = {
  // Reduced motion settings
  reduceMotion: {
    duration: '0ms',
    easing: 'linear',
  },

  // Hardware acceleration hints
  willChange: {
    transform: 'transform',
    opacity: 'opacity',
    scrollPosition: 'scroll-position',
    contents: 'contents',
  },
} as const;