'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { getPrefixedEasing } from '@/lib/animations/easings';

/**
 * @spec: FadeIn wrapper component for consistent fade animations
 */
interface FadeInProps {
  children: React.ReactNode;
  /**
   * Animation duration in seconds
   */
  duration?: number;
  /**
   * Delay before animation starts
   */
  delay?: number;
  /**
   * Distance to slide in (y-axis)
   */
  distance?: number;
  /**
   * Whether to trigger animation only once
   */
  once?: boolean;
  /**
   * Custom animation variants
   */
  variants?: Variants;
  /**
   * Additional classes
   */
  className?: string;
  /**
   * Initial animation state
   */
  initial?: boolean;
  /**
   * Whether to use reduced motion
   */
  reducedMotion?: boolean;
  /**
   * Animation easing function
   */
  easing?: any;
  /**
   * Callback when animation completes
   */
  onComplete?: () => void;
}

/**
 * @spec: Default fade in variants
 */
const defaultVariants: Variants = {
  hidden: (custom: any = {}) => ({
    opacity: 0,
    y: custom.distance || 20,
  }),
  visible: (custom: any = {}) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: custom.duration || 0.6,
      delay: custom.delay || 0,
      ease: custom.easing || 'easeOut',
    },
  }),
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    },
  },
};

/**
 * @spec: FadeIn component wrapper
 */
export const FadeIn: React.FC<FadeInProps> = ({
  children,
  duration = 0.6,
  delay = 0,
  distance = 20,
  once = true,
  variants,
  className = '',
  initial = true,
  reducedMotion: forceReducedMotion,
  easing,
  onComplete,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const shouldReduceMotion = forceReducedMotion ?? prefersReducedMotion;

  const animationVariants = variants || defaultVariants;

  return (
    <motion.div
      className={className}
      initial={initial ? 'hidden' : false}
      animate={shouldReduceMotion ? 'visible' : 'visible'}
      exit="exit"
      variants={animationVariants}
      custom={{
        duration: shouldReduceMotion ? 0 : duration,
        delay,
        distance,
        easing: shouldReduceMotion ? undefined : easing,
      }}
      onAnimationComplete={onComplete}
    >
      {children}
    </motion.div>
  );
};

/**
 * @spec: FadeInUp component - specific fade and slide up animation
 */
export const FadeInUp: React.FC<Omit<FadeInProps, 'variants'>> = (props) => {
  return <FadeIn variants={defaultVariants} {...props} />;
};

/**
 * @spec: FadeInStagger component - for lists with staggered animation
 */
interface FadeInStaggerProps extends Omit<FadeInProps, 'children'> {
  children: React.ReactNode;
  staggerDelay?: number;
  staggerChildren?: boolean;
}

export const FadeInStagger: React.FC<FadeInStaggerProps> = ({
  children,
  staggerDelay = 0.1,
  staggerChildren = true,
  ...props
}) => {
  const staggerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerChildren ? staggerDelay : 0,
      },
    },
  };

  return (
    <motion.div
      variants={staggerVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * staggerDelay }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

/**
 * @spec: FadeInWithGSAP - Alternative GSAP-based fade in
 */
export const FadeInWithGSAP: React.FC<FadeInProps> = ({
  children,
  duration = 0.6,
  delay = 0,
  className = '',
  reducedMotion: forceReducedMotion,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const shouldReduceMotion = forceReducedMotion ?? prefersReducedMotion;

  React.useEffect(() => {
    if (!ref.current || shouldReduceMotion) return;

    import('gsap').then(({ fromTo }) => {
      fromTo(
        ref.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration,
          delay,
          ease: 'power2.out',
        }
      );
    });
  }, [duration, delay, shouldReduceMotion]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

/**
 * @spec: AnimatedContainer - Container with fade in for consistent layout
 */
interface AnimatedContainerProps extends FadeInProps {
  as?: keyof JSX.IntrinsicElements;
  id?: string;
}

export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  children,
  as = 'div',
  duration = 0.8,
  delay = 0,
  className = '',
  id,
}) => {
  const Component = as as any;

  return (
    <FadeIn duration={duration} delay={delay} className={className}>
      <Component id={id}>{children}</Component>
    </FadeIn>
  );
};