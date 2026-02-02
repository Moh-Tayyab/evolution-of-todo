import { Easing, Transition } from 'framer-motion';

/**
 * @spec: Custom easing functions for animations
 */

type EasingOrTransition = Easing | Transition;

// Cubic Bezier custom easings
export const customEaseOut: Easing = [0.22, 1, 0.36, 1];
export const customEaseIn: Easing = [0.55, 0.055, 0.675, 0.19];
export const customEaseInOut: Easing = [0.645, 0.045, 0.355, 1];
export const customEaseOutCubic: Easing = [0.215, 0.61, 0.355, 1];
export const customEaseInCubic: Easing = [0.55, 0.055, 0.675, 0.19];
export const customEaseInOutCubic: Easing = [0.645, 0.045, 0.355, 1];

// Physics-based easings
export const bounceEase: Transition = {
  type: 'spring',
  damping: 10,
  stiffness: 100,
  mass: 0.8,
};

export const smoothSpring: Transition = {
  type: 'spring',
  damping: 15,
  stiffness: 120,
  mass: 1,
};

export const sharpSpring: Transition = {
  type: 'spring',
  damping: 8,
  stiffness: 200,
  mass: 0.8,
};

// Gentle easings
export const gentleEase: Transition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.8,
};

export const slowEase: Transition = {
  type: 'tween',
  ease: 'easeOut',
  duration: 1.2,
};

// Sharp easings
export const sharpEase: Transition = {
  type: 'tween',
  ease: 'easeIn',
  duration: 0.3,
};

export const elasticEase: Transition = {
  type: 'spring',
  damping: 6,
  stiffness: 300,
  mass: 0.6,
};

// Back easings
export const backEaseIn: Transition = {
  type: 'tween',
  ease: [0.6, -0.28, 0.735, 0.045],
  duration: 0.8,
};

export const backEaseOut: Transition = {
  type: 'tween',
  ease: [0.175, 0.885, 0.32, 1.275],
  duration: 0.8,
};

// Quick entrance animations
export const quickEase: Transition = {
  type: 'tween',
  ease: 'easeOut',
  duration: 0.3,
};

export const instantEase: Transition = {
  type: 'tween',
  ease: 'linear',
  duration: 0,
};

// Natural curves
export const naturalEase: Transition = {
  type: 'tween',
  ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
  duration: 0.6,
};

export const dramaticEase: Transition = {
  type: 'tween',
  ease: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  duration: 1,
};

// Stagger timing helpers
export const createStaggerTiming = (baseDelay = 0.05) => ({
  delayChildren: baseDelay,
  staggerChildren: baseDelay,
  staggerDirection: 1,
});

// Easing presets for different animation types
export const easingPresets = {
  // Natural movements
  natural: naturalEase,
  smooth: gentleEase,
  bounce: bounceEase,

  // Sharp movements
  sharp: sharpEase,
  quick: quickEase,
  instant: instantEase,

  // Spring physics
  spring: smoothSpring,
  elastic: elasticEase,
  sharpSpring: sharpSpring,

  // Back movements
  backIn: backEaseIn,
  backOut: backEaseOut,

  // Specialized
  modal: smoothSpring,
  page: customEaseOut,
  button: customEaseOut,
  list: customEaseOutCubic,
  fade: customEaseInOut,
};

/**
 * @spec: Helper function to apply easing based on user preference
 */
export const getPrefixedEasing = ( prefersReducedMotion: boolean ): EasingOrTransition => {
  return prefersReducedMotion ? instantEase : naturalEase;
};

/**
 * @spec: Helper function to create responsive duration
 */
export const createResponsiveDuration = (
  normalDuration: number,
  reducedMotionDuration: number = 0
) => {
  return {
    normal: normalDuration,
    reduced: reducedMotionDuration,
  };
};

/**
 * @spec: Duration presets
 */
export const durationPresets = {
  fast: createResponsiveDuration(0.2),
  normal: createResponsiveDuration(0.4),
  slow: createResponsiveDuration(0.8),
  verySlow: createResponsiveDuration(1.2),
  modal: createResponsiveDuration(0.3, 0),
  page: createResponsiveDuration(0.5, 0),
  button: createResponsiveDuration(0.2, 0),
  list: createResponsiveDuration(0.1, 0),
};