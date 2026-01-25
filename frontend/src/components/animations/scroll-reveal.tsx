'use client';

// @spec: specs/002-fullstack-web-app/spec.md
// @spec: specs/002-fullstack-web-app/plan.md
// Scroll-based reveal animations using GSAP ScrollTrigger

import React, { useRef, useEffect, ReactNode } from 'react';
import { useGSAP } from '@/lib/animations/gsap-provider';
import { useReducedMotion } from 'framer-motion';

/**
 * Props for ScrollReveal component
 */
interface ScrollRevealProps {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  once?: boolean;
}

/**
 * @spec: ScrollReveal component - Reveals content on scroll
 * Supports reduced motion and customizable animation parameters
 */
export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.8,
  distance = 50,
  className = '',
  start = 'top 80%',
  end = 'bottom 20%',
  scrub = false,
  once = true,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { animateFrom } = useGSAP();

  useEffect(() => {
    if (!ref.current || prefersReducedMotion) return;

    const fromVars: Record<string, any> = {
      opacity: 0,
      duration,
      delay,
    };

    // Set direction-based properties
    switch (direction) {
      case 'up':
        fromVars.y = distance;
        break;
      case 'down':
        fromVars.y = -distance;
        break;
      case 'left':
        fromVars.x = distance;
        break;
      case 'right':
        fromVars.x = -distance;
        break;
      case 'fade':
        // Only opacity
        break;
    }

    animateFrom(ref.current, {
      ...fromVars,
      scrollTrigger: {
        trigger: ref.current,
        start,
        end,
        scrub,
        toggleActions: once ? 'play none none reverse' : 'play none none none',
      },
      ease: 'power2.out',
    });
  }, [direction, delay, duration, distance, start, end, scrub, once, prefersReducedMotion, animateFrom]);

  return (
    <div
      ref={ref}
      className={className}
      style={prefersReducedMotion ? { opacity: 1 } : undefined}
    >
      {children}
    </div>
  );
};

/**
 * Props for StaggerChildren component
 */
interface StaggerChildrenProps {
  children: ReactNode[];
  staggerDelay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  duration?: number;
  distance?: number;
  className?: string;
  start?: string;
}

/**
 * @spec: StaggerChildren component - Animates children with staggered delay
 */
export const StaggerChildren: React.FC<StaggerChildrenProps> = ({
  children,
  staggerDelay = 0.1,
  direction = 'up',
  duration = 0.6,
  distance = 30,
  className = '',
  start = 'top 85%',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { animateFrom } = useGSAP();

  useEffect(() => {
    if (!containerRef.current || prefersReducedMotion) return;

    const childrenElements = Array.from(containerRef.current.children);

    const fromVars: Record<string, any> = {
      opacity: 0,
      duration,
    };

    switch (direction) {
      case 'up':
        fromVars.y = distance;
        break;
      case 'down':
        fromVars.y = -distance;
        break;
      case 'left':
        fromVars.x = distance;
        break;
      case 'right':
        fromVars.x = -distance;
        break;
      case 'fade':
        break;
    }

    childrenElements.forEach((child, index) => {
      animateFrom(child as HTMLElement, {
        ...fromVars,
        delay: index * staggerDelay,
        scrollTrigger: {
          trigger: containerRef.current,
          start,
          toggleActions: 'play none none reverse',
        },
        ease: 'power2.out',
      });
    });
  }, [staggerDelay, direction, duration, distance, start, prefersReducedMotion, animateFrom]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={prefersReducedMotion ? { opacity: 1 } : undefined}
    >
      {children}
    </div>
  );
};

/**
 * Props for FadeIn component
 */
interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  from?: number;
  className?: string;
  trigger?: boolean;
}

/**
 * @spec: FadeIn component - Simple fade-in animation
 * Can be triggered on mount or scroll
 */
export const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  duration = 0.6,
  from = 0,
  className = '',
  trigger = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { animateFrom } = useGSAP();

  useEffect(() => {
    if (!ref.current || prefersReducedMotion) return;

    const animationProps: Record<string, any> = {
      opacity: 0,
      duration,
      delay,
      ease: 'power2.out',
    };

    if (trigger) {
      animationProps.scrollTrigger = {
        trigger: ref.current,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      };
    }

    animateFrom(ref.current, animationProps);
  }, [delay, duration, from, trigger, prefersReducedMotion, animateFrom]);

  return (
    <div
      ref={ref}
      className={className}
      style={prefersReducedMotion ? { opacity: 1 } : undefined}
    >
      {children}
    </div>
  );
};

/**
 * Props for ScaleReveal component
 */
interface ScaleRevealProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  from?: number;
  to?: number;
  className?: string;
  start?: string;
}

/**
 * @spec: ScaleReveal component - Scale animation on scroll
 */
export const ScaleReveal: React.FC<ScaleRevealProps> = ({
  children,
  delay = 0,
  duration = 0.6,
  from = 0.8,
  to = 1,
  className = '',
  start = 'top 80%',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { animateFrom } = useGSAP();

  useEffect(() => {
    if (!ref.current || prefersReducedMotion) return;

    animateFrom(ref.current, {
      scale: from,
      opacity: 0,
      duration,
      delay,
      scrollTrigger: {
        trigger: ref.current,
        start,
        toggleActions: 'play none none reverse',
      },
      ease: 'back.out(1.7)',
    });
  }, [delay, duration, from, to, start, prefersReducedMotion, animateFrom]);

  return (
    <div
      ref={ref}
      className={className}
      style={prefersReducedMotion ? { opacity: 1, transform: 'scale(1)' } : undefined}
    >
      {children}
    </div>
  );
};

/**
 * Props for ParallaxScroll component
 */
interface ParallaxScrollProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

/**
 * @spec: ParallaxScroll component - Parallax effect on scroll
 */
export const ParallaxScroll: React.FC<ParallaxScrollProps> = ({
  children,
  speed = 0.5,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { to } = useGSAP();

  useEffect(() => {
    if (!ref.current || prefersReducedMotion) return;

    to(ref.current, {
      yPercent: -50 * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: ref.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  }, [speed, prefersReducedMotion, to]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};
