'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { staggerContainer } from '@/lib/animations/variants';
import { easingPresets, durationPresets } from '@/lib/animations/easings';

/**
 * @spec: StaggerChildren component for animated lists
 */
interface StaggerChildrenProps {
  children: React.ReactNode;
  /**
   * Stagger delay between children in seconds
   */
  staggerDelay?: number;
  /**
   * Animation duration for each child
   */
  duration?: number;
  /**
   * Animation delay before first child
   */
  delay?: number;
  /**
   * Animation direction
   */
  direction?: 'up' | 'down' | 'left' | 'right';
  /**
   * Animation type
   */
  type?: 'fade' | 'scale' | 'slide' | 'flip';
  /**
   * Easing function
   */
  easing?: any;
  /**
   * Whether to trigger only once
   */
  once?: boolean;
  /**
   * Whether to animate on scroll
   */
  scrollAnimate?: boolean;
  /**
   * Threshold for scroll animation
   */
  threshold?: number;
  /**
   * Additional classes for container
   */
  className?: string;
  /**
   * Additional classes for child items
   */
  childClassName?: string;
  /**
   * Custom animation variants
   */
  variants?: Variants;
}

/**
 * @spec: Default fade in variants for children
 */
const defaultChildVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

/**
 * @spec: Slide variants for children
 */
const slideVariants = (direction: 'up' | 'down' | 'left' | 'right'): Variants => ({
  hidden: {
    opacity: 0,
    ...(direction === 'up' && { y: 50 }),
    ...(direction === 'down' && { y: -50 }),
    ...(direction === 'left' && { x: 50 }),
    ...(direction === 'right' && { x: -50 }),
  },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
});

/**
 * @spec: Scale variants for children
 */
const scaleVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

/**
 * @spec: Flip variants for children
 */
const flipVariants: Variants = {
  hidden: {
    opacity: 0,
    rotateX: -90,
    transformPerspective: 400,
  },
  visible: {
    opacity: 1,
    rotateX: 0,
    transformPerspective: 400,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

/**
 * @spec: StaggerChildren component
 */
export const StaggerChildren: React.FC<StaggerChildrenProps> = ({
  children,
  staggerDelay = 0.1,
  duration = 0.5,
  delay = 0,
  direction = 'up',
  type = 'fade',
  easing,
  once = true,
  scrollAnimate = false,
  threshold = 0.1,
  className = '',
  childClassName = '',
  variants,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const shouldReduceMotion = prefersReducedMotion;

  // Get appropriate child variants
  const getVariants = (): Variants => {
    if (variants) return variants;
    if (type === 'slide') return slideVariants(direction);
    if (type === 'scale') return scaleVariants;
    if (type === 'flip') return flipVariants;
    return defaultChildVariants;
  };

  const containerVariants: Variants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : staggerDelay,
        delayChildren: shouldReduceMotion ? 0 : delay,
      },
    },
  };

  const childVariants = getVariants();
  const finalEasing = shouldReduceMotion ? undefined : easing || easingPresets.natural;

  // Handle scroll animation
  const [ref, inView] = React.useState(false);

  React.useEffect(() => {
    if (!scrollAnimate) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          React.startTransition(() => {
            inView(true);
          });
        }
      },
      { threshold }
    );

    const element = document.querySelector(`[data-stagger-container]`);
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [scrollAnimate, threshold]);

  const shouldAnimate = !scrollAnimate || inView;

  return (
    <motion.div
      data-stagger-container
      className={className}
      variants={containerVariants}
      initial={!shouldReduceMotion ? 'hidden' : false}
      animate={shouldAnimate ? 'visible' : shouldReduceMotion ? 'visible' : 'hidden'}
      exit="hidden"
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          className={childClassName}
          variants={childVariants}
          custom={{
            index,
            duration: shouldReduceMotion ? 0 : duration,
            delay: shouldReduceMotion ? 0 : index * staggerDelay,
          }}
          initial={!shouldReduceMotion ? 'hidden' : false}
          animate={shouldAnimate ? 'visible' : shouldReduceMotion ? 'visible' : 'hidden'}
          exit="hidden"
          transition={{
            duration: shouldReduceMotion ? 0 : duration,
            delay: shouldReduceMotion ? 0 : index * staggerDelay,
            ease: finalEasing,
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

/**
 * @spec: StaggerList - Specifically for list items
 */
interface StaggerListProps extends Omit<StaggerChildrenProps, 'children'> {
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
}

export const StaggerList: React.FC<StaggerListProps> = ({
  items,
  renderItem,
  ...props
}) => {
  return (
    <StaggerChildren {...props}>
      {items.map((item, index) => renderItem(item, index))}
    </StaggerChildren>
  );
};

/**
 * @spec: StaggerGrid - For grid layouts with staggered animation
 */
interface StaggerGridProps extends Omit<StaggerChildrenProps, 'children'> {
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  columns?: number;
}

export const StaggerGrid: React.FC<StaggerGridProps> = ({
  items,
  renderItem,
  columns = 3,
  ...props
}) => {
  return (
    <StaggerChildren {...props}>
      <div
        className={`grid gap-4 grid-cols-1 ${columns > 1 ? 'md:grid-cols-2' : ''} ${
          columns > 2 ? 'lg:grid-cols-3' : ''
        } ${columns > 3 ? 'xl:grid-cols-4' : ''}`}
      >
        {items.map((item, index) => (
          <div key={index}>{renderItem(item, index)}</div>
        ))}
      </div>
    </StaggerChildren>
  );
};

/**
 * @spec: StaggerCards - For card-based layouts
 */
interface StaggerCardsProps extends StaggerGridProps {
  cardClassName?: string;
}

export const StaggerCards: React.FC<StaggerCardsProps> = ({
  items,
  renderItem,
  cardClassName = '',
  ...props
}) => {
  return (
    <StaggerGrid
      {...props}
      items={items}
      renderItem={(item, index) => (
        <div className={cardClassName}>
          {renderItem(item, index)}
        </div>
      )}
    />
  );
};