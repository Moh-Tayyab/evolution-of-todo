'use client';

// @spec: specs/002-fullstack-web-app/spec.md
// @spec: specs/002-fullstack-web-app/plan.md
// Page transition animations using Framer Motion

import React, { ReactNode, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

/**
 * Common animation variants
 */
export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const slideDownVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
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

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

/**
 * Props for PageTransition component
 */
interface PageTransitionProps {
  children: ReactNode;
  variant?: 'fade' | 'slideUp' | 'slideDown' | 'scale';
  duration?: number;
  delay?: number;
  className?: string;
  mode?: 'wait' | 'sync' | 'popLayout';
}

/**
 * @spec: PageTransition component - Wraps content with page transition animation
 */
export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  variant = 'fade',
  duration = 0.3,
  delay = 0,
  className = '',
  mode = 'wait',
}) => {
  const prefersReducedMotion = useReducedMotion();

  const getVariants = (): Variants => {
    switch (variant) {
      case 'slideUp':
        return slideUpVariants;
      case 'slideDown':
        return slideDownVariants;
      case 'scale':
        return scaleVariants;
      default:
        return fadeInVariants;
    }
  };

  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration, delay, ease: 'easeOut' as const };

  return (
    <motion.div
      className={className}
      variants={getVariants()}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={transition}
    >
      {children}
    </motion.div>
  );
};

/**
 * Props for StaggeredPageTransition component
 */
interface StaggeredPageTransitionProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
  itemVariants?: Variants;
  duration?: number;
}

/**
 * @spec: StaggeredPageTransition - Animates children with stagger effect
 */
export const StaggeredPageTransition: React.FC<StaggeredPageTransitionProps> = ({
  children,
  className = '',
  staggerDelay = 0.08,
  itemVariants = staggerItemVariants,
  duration = 0.4,
}) => {
  const prefersReducedMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
        duration: prefersReducedMotion ? 0 : duration,
      },
    },
  };

  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration, ease: 'easeOut' as const };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      transition={transition}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={prefersReducedMotion ? {} : itemVariants}
          transition={transition}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

/**
 * Props for LayoutTransition component
 */
interface LayoutTransitionProps {
  children: ReactNode;
  className?: string;
  type?: 'crossfade' | 'between' | 'keyframes';
}

/**
 * @spec: LayoutTransition - Smooth layout changes using Framer Motion layout prop
 */
export const LayoutTransition: React.FC<LayoutTransitionProps> = ({
  children,
  className = '',
  type = 'crossfade',
}) => {
  const prefersReducedMotion = useReducedMotion();

  const transition = prefersReducedMotion
    ? { duration: 0 }
    : {
        type: 'spring' as const,
        stiffness: 350,
        damping: 30,
      };

  return (
    <motion.div
      className={className}
      layout
      layoutId={type}
      transition={transition}
    >
      {children}
    </motion.div>
  );
};

/**
 * Props for AnimatePresenceWrapper component
 */
interface AnimatePresenceWrapperProps {
  children: ReactNode;
  mode?: 'wait' | 'sync' | 'popLayout';
  onExitComplete?: () => void;
  className?: string;
}

/**
 * @spec: AnimatePresenceWrapper - Wrapper for AnimatePresence with exit animations
 */
export const AnimatePresenceWrapper: React.FC<AnimatePresenceWrapperProps> = ({
  children,
  mode = 'wait',
  onExitComplete,
  className = '',
}) => {
  return (
    <AnimatePresence mode={mode} onExitComplete={onExitComplete}>
      <div className={className}>{children}</div>
    </AnimatePresence>
  );
};

/**
 * Props for RouteTransition component
 */
interface RouteTransitionProps {
  children: ReactNode;
  variant?: 'fade' | 'slideUp' | 'slideDown' | 'scale';
  duration?: number;
}

/**
 * @spec: RouteTransition - Page route transition with exit animation
 */
export const RouteTransition: React.FC<RouteTransitionProps> = ({
  children,
  variant = 'fade',
  duration = 0.3,
}) => {
  const prefersReducedMotion = useReducedMotion();

  const getVariants = (): Variants => {
    switch (variant) {
      case 'slideUp':
        return {
          enter: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -20 },
        };
      case 'slideDown':
        return {
          enter: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: 20 },
        };
      case 'scale':
        return {
          enter: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.95 },
        };
      default:
        return {
          enter: { opacity: 1 },
          exit: { opacity: 0 },
        };
    }
  };

  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration, ease: 'easeInOut' as const };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        variants={getVariants()}
        initial="exit"
        animate="enter"
        exit="exit"
        transition={transition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Props for ListTransition component
 */
interface ListTransitionProps {
  children: ReactNode[];
  className?: string;
}

/**
 * @spec: ListTransition - Animated list with enter/exit animations
 */
export const ListTransition: React.FC<ListTransitionProps> = ({
  children,
  className = '',
}) => {
  const prefersReducedMotion = useReducedMotion();

  const listVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: prefersReducedMotion
        ? { duration: 0 }
        : { type: 'spring', stiffness: 300, damping: 24 },
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: prefersReducedMotion
        ? { duration: 0 }
        : { duration: 0.2 },
    },
  };

  return (
    <motion.div
      className={className}
      variants={listVariants}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence>
        {children.map((child, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            layout
            exit="exit"
          >
            {child}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

/**
 * Hook for page transition on mount
 */
export const usePageTransition = (delay: number = 0) => {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const timer = setTimeout(() => {
      document.body.classList.add('page-loaded');
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [delay, prefersReducedMotion]);
};
