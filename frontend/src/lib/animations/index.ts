/**
 * @spec: Animation utilities export file
 */

// Variants
export * from './variants';

// Easings
export * from './easings';

// Hooks
export * from './hooks';

// GSAP Provider
export * from './gsap-provider';

// Components - TODO: Create these components
// export * from '@/components/animations/fade-in';
// export * from '@/components/animations/stagger-children';
// export * from '@/components/animations/page-transition';

// Type exports
export type { Variants } from 'framer-motion';
export type { Easing } from 'framer-motion';

// Animation presets
export const animationPresets = {
  // Common page transitions
  pageTransition: {
    slideRight: {
      initial: { opacity: 0, x: 100 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -100 },
      transition: { duration: 0.5, ease: 'easeOut' },
    },
    slideLeft: {
      initial: { opacity: 0, x: -100 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 100 },
      transition: { duration: 0.5, ease: 'easeOut' },
    },
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.3, ease: 'easeInOut' },
    },
    scaleIn: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.9 },
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  },

  // List animations
  listStagger: {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
      },
    },
    item: {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: 'easeOut' },
      },
    },
  },

  // Modal animations
  modal: {
    backdrop: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 },
    },
    content: {
      initial: { opacity: 0, scale: 0.5, y: -50 },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.5, y: -50 },
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300,
      },
    },
  },

  // Button animations
  button: {
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 },
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 },
    },
  },

  // Card animations
  card: {
    hover: {
      y: -5,
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
    tap: {
      y: 0,
      transition: { duration: 0.1 },
    },
  },

  // Loading animations
  loading: {
    spinner: {
      animate: {
        rotate: 360,
        transition: {
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        },
      },
    },
    pulse: {
      animate: {
        scale: [1, 1.05, 1],
        transition: {
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      },
    },
  },
};

// Helper functions
export const createAnimationSequence = (variants: any[], options: any = {}) => {
  return {
    initial: 'initial',
    animate: 'animate',
    exit: 'exit',
    variants: {
      initial: variants[0].initial,
      animate: variants[1].animate,
      exit: variants[2].exit,
    },
    ...options,
  };
};

export const combineVariants = (...variants: any[]) => {
  return variants.reduce((combined, variant) => {
    return {
      ...combined,
      ...variant,
      transition: {
        ...combined.transition,
        ...variant.transition,
      },
    };
  }, {});
};