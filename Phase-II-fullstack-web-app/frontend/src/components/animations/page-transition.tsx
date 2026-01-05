'use client';

import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { pageTransition, pageTransition as defaultPageVariants } from '@/lib/animations/variants';
import { useReducedMotion } from 'framer-motion';
import { easingPresets, durationPresets } from '@/lib/animations/easings';

/**
 * @spec: PageTransition component for route transitions
 */
interface PageTransitionProps {
  children: React.ReactNode;
  /**
   * Page key to trigger animation
   */
  key?: string;
  /**
   * Transition direction
   */
  direction?: 'left' | 'right' | 'up' | 'down';
  /**
   * Transition type
   */
  type?: 'slide' | 'fade' | 'scale' | 'flip';
  /**
   * Animation duration
   */
  duration?: number;
  /**
   * Custom easing function
   */
  easing?: any;
  /**
   * Custom variants
   */
  variants?: Variants;
  /**
   * Whether to use reduced motion
   */
  reducedMotion?: boolean;
  /**
   * Additional classes
   */
  className?: string;
  /**
   * Whether to animate on mount
   */
  animateOnMount?: boolean;
}

/**
 * @spec: Direction-specific variants
 */
const getDirectionVariants = (direction: 'left' | 'right' | 'up' | 'down'): Variants => {
  const base = {
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
    },
    exit: {
      opacity: 0,
    },
  };

  switch (direction) {
    case 'left':
      return {
        initial: { opacity: 0, x: 100 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -100 },
      };
    case 'right':
      return {
        initial: { opacity: 0, x: -100 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 100 },
      };
    case 'up':
      return {
        initial: { opacity: 0, y: 100 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -100 },
      };
    case 'down':
      return {
        initial: { opacity: 0, y: -100 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 100 },
      };
    default:
      return base;
  }
};

/**
 * @spec: Type-specific variants
 */
const getTypeVariants = (type: 'slide' | 'fade' | 'scale' | 'flip'): Variants => {
  switch (type) {
    case 'slide':
      return {
        initial: { opacity: 0, x: 50 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -50 },
      };
    case 'scale':
      return {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.9 },
      };
    case 'flip':
      return {
        initial: { opacity: 0, rotateY: 90 },
        animate: { opacity: 1, rotateY: 0 },
        exit: { opacity: 0, rotateY: -90 },
      };
    case 'fade':
    default:
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      };
  }
};

/**
 * @spec: PageTransition component
 */
export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  key,
  direction = 'right',
  type = 'slide',
  duration,
  easing,
  variants,
  reducedMotion: forceReducedMotion,
  className = '',
  animateOnMount = false,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const shouldReduceMotion = forceReducedMotion ?? prefersReducedMotion;

  const finalDuration = duration || durationPresets.page.normal;
  const finalEasing = easing || easingPresets.page;

  // Get appropriate variants
  const animationVariants = variants ||
    (direction !== 'right' ? getDirectionVariants(direction) :
     type !== 'slide' ? getTypeVariants(type) :
     defaultPageVariants);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        className={className}
        variants={animationVariants}
        initial={shouldReduceMotion || !animateOnMount ? false : 'initial'}
        animate={shouldReduceMotion ? 'animate' : 'animate'}
        exit="exit"
        transition={{
          duration: shouldReduceMotion ? 0 : finalDuration,
          ease: shouldReduceMotion ? undefined : finalEasing,
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * @spec: PageSlideLeft - Left slide transition
 */
export const PageSlideLeft: React.FC<Omit<PageTransitionProps, 'direction' | 'type'>> = (
  props
) => {
  return <PageTransition direction="left" type="slide" {...props} />;
};

/**
 * @spec: PageSlideRight - Right slide transition
 */
export const PageSlideRight: React.FC<Omit<PageTransitionProps, 'direction' | 'type'>> = (
  props
) => {
  return <PageTransition direction="right" type="slide" {...props} />;
};

/**
 * @spec: PageSlideUp - Up slide transition
 */
export const PageSlideUp: React.FC<Omit<PageTransitionProps, 'direction' | 'type'>> = (
  props
) => {
  return <PageTransition direction="up" type="slide" {...props} />;
};

/**
 * @spec: PageSlideDown - Down slide transition
 */
export const PageSlideDown: React.FC<Omit<PageTransitionProps, 'direction' | 'type'>> = (
  props
) => {
  return <PageTransition direction="down" type="slide" {...props} />;
};

/**
 * @spec: PageFade - Fade transition
 */
export const PageFade: React.FC<Omit<PageTransitionProps, 'direction' | 'type'>> = (
  props
) => {
  return <PageTransition type="fade" {...props} />;
};

/**
 * @spec: PageScale - Scale transition
 */
export const PageScale: React.FC<Omit<PageTransitionProps, 'direction' | 'type'>> = (
  props
) => {
  return <PageTransition type="scale" {...props} />;
};

/**
 * @spec: PageContainer - Wrapper for pages with automatic transitions
 */
interface PageContainerProps extends PageTransitionProps {
  /**
   * Whether to wrap in transition automatically
   */
  enableTransition?: boolean;
  /**
   * Custom transition duration for pages
   */
  pageDuration?: number;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  enableTransition = true,
  pageDuration,
  ...props
}) => {
  if (!enableTransition) {
    return <>{children}</>;
  }

  return (
    <PageTransition duration={pageDuration} {...props}>
      {children}
    </PageTransition>
  );
};

/**
 * @spec: RouteTransition - HOC for page transitions
 */
export const withRouteTransition = <P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<PageTransitionProps, 'children'> = {}
) => {
  return (props: P) => (
    <PageTransition {...options}>
      <Component {...props} />
    </PageTransition>
  );
};

/**
 * @spec: FadeInPage - Combined fade and slide for pages
 */
interface FadeInPageProps extends Omit<PageTransitionProps, 'type'> {
  /**
   * Whether to use fade effect
   */
  fade?: boolean;
  /**
   * Whether to use scale effect
   */
  scale?: boolean;
}

export const FadeInPage: React.FC<FadeInPageProps> = ({
  fade = true,
  scale = true,
  ...props
}) => {
  const type: 'slide' | 'fade' | 'scale' = fade && scale ? 'scale' : fade ? 'fade' : 'slide';

  return <PageTransition type={type} {...props} />;
};