import { useEffect, useRef, useState } from 'react';
import { useReducedMotion, useAnimationControls, type AnimationControls } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * @spec: Custom hooks for animation utilities
 */

gsap.registerPlugin(ScrollTrigger);

/**
 * @spec: Hook to check user prefers reduced motion preference
 * @returns boolean - true if user prefers reduced motion
 */
export const useReducedMotionUserPreference = (): boolean => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    // Set initial value
    setReducedMotion(mediaQuery.matches);

    // Add listener
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return reducedMotion;
};

/**
 * @spec: Hook to check if element is in viewport
 * @param threshold - visibility threshold (0-1)
 * @param triggerOnce - whether to trigger only once
 * @returns ref and inView boolean
 */
export const useInViewElement = (
  threshold: number = 0.1,
  triggerOnce: boolean = true
) => {
  const { ref, inView, entry } = useInView({
    threshold,
    triggerOnce,
    rootMargin: '0px',
  });

  return { ref, inView, entry };
};

/**
 * @spec: Hook to track animation completion
 * @param onComplete - callback when animation completes
 * @returns isComplete boolean
 */
export const useAnimationComplete = (
  onComplete?: () => void
): [boolean, () => void] => {
  const [isComplete, setIsComplete] = useState(false);

  const triggerComplete = () => {
    setIsComplete(true);
    onComplete?.();
  };

  return [isComplete, triggerComplete];
};

/**
 * @spec: Hook to create GSAP animations with cleanup
 * @param dependencies - array of dependencies to recreate animation
 * @returns ref for element to animate
 */
export const useGSAPAnimation = (
  animateFn: (gsapInstance: typeof gsap, element: HTMLElement) => void,
  dependencies: any[] = []
) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      animateFn(gsap, ref.current!);
    }, ref.current);

    return () => ctx.revert();
  }, dependencies);

  return ref;
};

/**
 * @spec: Hook for scroll-triggered animations
 * @param options - ScrollTrigger options
 * @returns ref for element to animate
 */
export const useScrollTrigger = (
  options: ScrollTrigger.Vars
) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const trigger = ScrollTrigger.create({
      trigger: ref.current,
      ...options,
    });

    return () => {
      trigger.kill();
    };
  }, [options]);

  return ref;
};

/**
 * @spec: Hook for parallax scrolling effect
 * @param speed - parallax speed multiplier
 * @returns ref for element to animate
 */
export const useParallax = (speed: number = 0.5) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    const rect = element.getBoundingClientRect();
    const start = window.pageYOffset + rect.top;
    const end = start + window.innerHeight;
    const height = window.innerHeight - rect.height;

    const update = () => {
      const scroll = window.pageYOffset;
      const progress = scroll < start ? 0 : (scroll - start) / height;
      const y = (progress - 0.5) * (rect.height * speed);

      element.style.transform = `translateY(${y}px)`;
    };

    ScrollTrigger.addEventListener('refresh', update);
    update();

    return () => {
      ScrollTrigger.removeEventListener('refresh', update);
    };
  }, [speed]);

  return ref;
};

/**
 * @spec: Hook for fade-in animation on scroll
 * @param options - animation options
 * @returns ref and inView status
 */
export const useScrollFadeIn = (
  options: {
    duration?: number;
    delay?: number;
    distance?: number;
    once?: boolean;
  } = {}
) => {
  const {
    duration = 0.8,
    delay = 0,
    distance = 50,
    once = true,
  } = options;

  const { ref, inView } = useInViewElement(0.1, once);

  useGSAPAnimation((gsapInstance, element) => {
    if (inView) {
      gsapInstance.fromTo(
        element,
        {
          opacity: 0,
          y: distance,
        },
        {
          opacity: 1,
          y: 0,
          duration,
          delay,
          ease: 'power2.out',
        }
      );
    }
  }, [inView, duration, delay, distance]);

  return { ref, inView };
};

/**
 * @spec: Hook for scale animation on hover
 * @param scale - scale amount on hover
 * @returns ref
 */
export const useHoverScale = (scale: number = 1.05) => {
  const ref = useRef<HTMLElement>(null);

  useGSAPAnimation((gsapInstance, element) => {
    const hoverAnimation = gsapInstance.timeline({ paused: true });

    hoverAnimation
      .to(element, {
        scale,
        duration: 0.3,
        ease: 'power2.out',
      })
      .to(
        element,
        {
          scale: 1,
          duration: 0.2,
          ease: 'power2.in',
        },
        '+=0.1'
      );

    element.addEventListener('mouseenter', () => hoverAnimation.play());
    element.addEventListener('mouseleave', () => hoverAnimation.reverse());

    return () => {
      element.removeEventListener('mouseenter', () => hoverAnimation.play());
      element.removeEventListener('mouseleave', () => hoverAnimation.reverse());
    };
  }, [scale]);

  return ref;
};

/**
 * @spec: Hook for continuous looping animation
 * @param animationFn - function to create animation
 * @returns ref
 */
export const useLoopAnimation = (
  animationFn: (gsapInstance: typeof gsap, element: HTMLElement) => GSAPTimeline
) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      const tl = animationFn(gsap, ref.current!);
      tl.repeat(-1);
    }, ref.current);

    return () => ctx.revert();
  }, [animationFn]);

  return ref;
};

/**
 * @spec: Hook for text typing animation
 * @param text - text to type
 * @param speed - typing speed (characters per second)
 * @returns ref and isComplete boolean
 */
export const useTypingAnimation = (
  text: string,
  speed: number = 50
): [React.RefObject<HTMLSpanElement | null>, boolean] => {
  const ref = useRef<HTMLSpanElement>(null);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    let currentIndex = 0;

    const typeNextCharacter = () => {
      if (currentIndex < text.length) {
        element.textContent = text.slice(0, currentIndex + 1);
        currentIndex++;
        setTimeout(typeNextCharacter, 1000 / speed);
      } else {
        setIsComplete(true);
      }
    };

    // Reset animation
    element.textContent = '';
    setIsComplete(false);

    // Start typing
    setTimeout(typeNextCharacter, 100);

    return () => {
      // Cleanup if needed
    };
  }, [text, speed]);

  return [ref, isComplete];
};

/**
 * @spec: Hook to pause animations when tab is not visible
 * @returns object with isTabActive boolean
 */
export const useTabVisibility = () => {
  const [isTabActive, setIsTabActive] = useState(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabActive(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return { isTabActive };
};

/**
 * @spec: Hook to get animation controls for Framer Motion
 * @returns animation controls
 */
export const useAnimationControlsWithCleanup = (): AnimationControls => {
  const controls = useAnimationControls();

  useEffect(() => {
    return () => {
      // Clean up animation on unmount
      controls.stop();
    };
  }, []);

  return controls;
};

/**
 * @spec: Hook for drag animation with physics
 * @returns ref and drag props
 */
export const useDragAnimation = () => {
  const ref = useRef<HTMLElement>(null);
  const [dragProps, setDragProps] = useState<any>({});

  useGSAPAnimation((gsapInstance, element) => {
    let x = 0;
    let y = 0;
    let isDragging = false;

    const startX = 0;
    const startY = 0;

    const updatePosition = (e: MouseEvent) => {
      if (isDragging) {
        x += e.movementX;
        y += e.movementY;

        gsapInstance.set(element, { x, y });
      }
    };

    const startDrag = (e: MouseEvent) => {
      isDragging = true;
      gsapInstance.set(element, { scale: 1.1, zIndex: 1000 });
    };

    const endDrag = () => {
      isDragging = false;
      gsapInstance.to(element, {
        scale: 1,
        zIndex: 1,
        duration: 0.3,
        ease: 'back.out(1.7)',
      });
    };

    element.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', updatePosition);
    document.addEventListener('mouseup', endDrag);

    return () => {
      element.removeEventListener('mousedown', startDrag);
      document.removeEventListener('mousemove', updatePosition);
      document.removeEventListener('mouseup', endDrag);
    };
  }, []);

  return { ref, dragProps };
};