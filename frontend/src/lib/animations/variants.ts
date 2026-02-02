// @spec: Premium Animation Variants
// Expert-level animation library with spring physics and premium feel

import { Transition, Variants } from "framer-motion";

/**
 * Premium easing functions for smooth animations
 */
export const easings = {
  // Smooth spring-like feel
  premium: [0.25, 0.1, 0.25, 1] as const,
  // Quick snappy motion
  snappy: [0.34, 1.56, 0.64, 1] as const,
  // Smooth gentle ease
  smooth: [0.4, 0, 0.2, 1] as const,
  // Bouncy playful feel
  bouncy: [0.68, -0.6, 0.32, 1.6] as const,
  // Professional ease-out
  professional: [0.23, 1, 0.32, 1] as const,
};

/**
 * Premium transition configurations
 */
export const transitions: Record<string, Transition> = {
  // Quick micro-interactions
  micro: {
    duration: 0.15,
    ease: easings.smooth,
  },
  // Standard UI interactions
  standard: {
    duration: 0.3,
    ease: easings.premium,
  },
  // Smooth page transitions
  page: {
    duration: 0.5,
    ease: easings.premium,
  },
  // Slow elegant reveals
  elegant: {
    duration: 0.7,
    ease: easings.professional,
  },
  // Bouncy playful
  bounce: {
    duration: 0.4,
    ease: easings.bouncy,
    type: "spring",
    stiffness: 400,
    damping: 10,
  },
  // Subtle fade
  subtle: {
    duration: 0.2,
    ease: easings.smooth,
  },
};

/**
 * ============================================
 * FADE VARIANTS
 * ============================================
 */

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

/**
 * ============================================
 * SLIDE VARIANTS
 * ============================================
 */

export const slideUp: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.standard,
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: transitions.micro,
  },
};

export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: transitions.standard,
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: transitions.micro,
  },
};

export const slideIn: Variants = {
  hidden: {
    opacity: 0,
    x: -50,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.standard,
  },
  exit: {
    opacity: 0,
    x: 50,
    transition: transitions.micro,
  },
};

export const slideInRight: Variants = {
  hidden: {
    opacity: 0,
    x: 50,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.standard,
  },
  exit: {
    opacity: 0,
    x: 50,
    transition: transitions.micro,
  },
};

/**
 * ============================================
 * SCALE VARIANTS
 * ============================================
 */

export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    transformOrigin: "center",
  },
  visible: {
    opacity: 1,
    scale: 1,
    transformOrigin: "center",
    transition: transitions.bounce,
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transformOrigin: "center",
    transition: transitions.micro,
  },
};

/**
 * ============================================
 * STAGGER CONTAINER VARIANTS
 * ============================================
 */

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
      ...transitions.standard,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

export const premiumStaggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
      ...transitions.elegant,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.06,
      staggerDirection: -1,
    },
  },
};

/**
 * ============================================
 * CARD VARIANTS
 * ============================================
 */

export const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: transitions.standard,
  },
  hover: {
    scale: 1.02,
    transition: transitions.micro,
  },
  tap: {
    scale: 0.98,
    transition: transitions.micro,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: transitions.micro,
  },
};

/**
 * ============================================
 * MODAL VARIANTS
 * ============================================
 */

export const modalTransition: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
    y: -20,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: easings.premium,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * ============================================
 * PAGE TRANSITION VARIANTS
 * ============================================
 */

export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    x: 100,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: transitions.page,
  },
  exit: {
    opacity: 0,
    x: -100,
    scale: 0.95,
    transition: {
      duration: 0.3,
    },
  },
};

/**
 * ============================================
 * BUTTON VARIANTS
 * ============================================
 */

export const buttonHover: Variants = {
  rest: {
    scale: 1,
    transition: transitions.micro,
  },
  hover: {
    scale: 1.05,
    transition: transitions.micro,
  },
  tap: {
    scale: 0.95,
    transition: transitions.micro,
  },
};

export const premiumButtonHover = {
  hover: {
    scale: 1.05,
    boxShadow: [
      "0 0 0px rgba(139, 92, 246, 0)",
      "0 0 20px rgba(139, 92, 246, 0.3)",
      "0 0 40px rgba(139, 92, 246, 0.2)",
    ],
    transition: {
      duration: 0.3,
      ease: easings.premium,
    },
  },
  tap: {
    scale: 0.98,
  },
};

/**
 * ============================================
 * STATS/COUNTER VARIANTS
 * ============================================
 */

export const statCardVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: easings.premium,
    },
  }),
  hover: {
    scale: 1.02,
    y: -5,
    transition: transitions.micro,
  },
};

/**
 * ============================================
 * LIST ITEM VARIANTS
 * ============================================
 */

export const listItemVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.standard,
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: transitions.micro,
  },
};

/**
 * ============================================
 * UTILITY FUNCTIONS
 * ============================================
 */

/**
 * Get variants with reduced motion support
 */
export function getAccessibleVariants(
  variants: Variants,
  prefersReducedMotion: boolean
): Variants {
  if (prefersReducedMotion) {
    return {
      hidden: {},
      visible: {},
      exit: {},
      hover: {},
      tap: {},
      initial: {},
      animate: {},
      rest: {},
    };
  }
  return variants;
}

/**
 * Stagger children with custom delay
 */
export function createStaggerVariants(
  staggerDelay: number = 0.1,
  startDelay: number = 0
): Variants {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: startDelay,
      },
    },
  };
}
