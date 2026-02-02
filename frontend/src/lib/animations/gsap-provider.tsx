'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Draggable } from 'gsap/Draggable';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { TextPlugin } from 'gsap/TextPlugin';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

/**
 * @spec: GSAP context provider with cleanup
 */

gsap.registerPlugin(
  ScrollTrigger,
  Draggable,
  MotionPathPlugin,
  TextPlugin,
  ScrollToPlugin
);

// Create context for GSAP utilities
type GSAPContextType = {
  context: (scope?: Element | HTMLElement | undefined) => gsap.Context;
  to: typeof gsap.to;
  from: typeof gsap.from;
  fromTo: typeof gsap.fromTo;
  set: typeof gsap.set;
  timeline: typeof gsap.timeline;
};

const GSAPContext = createContext<GSAPContextType | null>(null);

/**
 * @spec: Provider for GSAP animations with cleanup
 */
export const GSAPProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const contextRef = useRef<gsap.Context | undefined>(undefined);

  // Initialize GSAP context on mount
  useEffect(() => {
    contextRef.current = gsap.context(() => {
      // Clean up on unmount
      return () => {
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      };
    });

    // Handle cleanup
    return () => {
      contextRef.current?.revert();
    };
  }, []);

  const value: GSAPContextType = {
    context: (scope) => {
      return gsap.context(() => {}, scope);
    },
    to: gsap.to,
    from: gsap.from,
    fromTo: gsap.fromTo,
    set: gsap.set,
    timeline: gsap.timeline,
  };

  return (
    <GSAPContext.Provider value={value}>
      {children}
    </GSAPContext.Provider>
  );
};

/**
 * @spec: Hook to use GSAP context
 */
export const useGSAP = () => {
  const context = useContext(GSAPContext);

  if (!context) {
    throw new Error('useGSAP must be used within GSAPProvider');
  }

  return {
    ...context,
    // Helper functions
    animate: (targets: gsap.TweenTarget, vars: gsap.TweenVars) => {
      return context.to(targets, vars);
    },
    animateFrom: (targets: gsap.TweenTarget, vars: gsap.TweenVars) => {
      return context.from(targets, vars);
    },
    animateFromTo: (targets: gsap.TweenTarget, fromVars: gsap.TweenVars, toVars: gsap.TweenVars) => {
      return context.fromTo(targets, fromVars, toVars);
    },
  };
};

/**
 * @spec: Hook forGSAP animations with proper cleanup
 */
export const useGSAPAnimationWithCleanup = (
  animateFn: (gsapInstance: typeof gsap, cleanup: () => void) => void,
  dependencies: any[] = []
) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    // Create local context for this animation
    const ctx = gsap.context(() => {
      let isMounted = true;

      const cleanup = () => {
        isMounted = false;
      };

      // Run animation with cleanup callback
      animateFn(gsap, cleanup);

      // Return cleanup for this context
      return () => {
        if (!isMounted) {
          // Clean up any active animations
          ScrollTrigger.getAll().forEach(trigger => {
            if (trigger.trigger === ref.current) {
              trigger.kill();
            }
          });
        }
      };
    }, ref.current);

    return () => {
      ctx.revert();
    };
  }, dependencies);

  return ref;
};

/**
 * @spec: Component wrapper for GSAP animations
 */
export const GSAPWrapper: React.FC<{
  children: React.ReactNode;
  animate?: (gsapInstance: typeof gsap, element: HTMLElement) => void;
}> = ({ children, animate }) => {
  const ref = useRef<HTMLDivElement>(null);

  useGSAPAnimationWithCleanup((gsapInstance, cleanup) => {
    if (ref.current && animate) {
      // Run the animation
      animate(gsapInstance, ref.current);

      // Store animation timeline for cleanup
      const timeline = gsapInstance.timeline();

      // Return cleanup function
      cleanup = () => {
        timeline.kill();
      };
    }
  }, [animate]);

  return <div ref={ref}>{children}</div>;
};

/**
 * @spec: Hook for scroll animations with auto-refresh
 */
export const useGSAPScrollTrigger = (
  options: ScrollTrigger.Vars
) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    // Create local context
    const ctx = gsap.context(() => {
      const triggers = ScrollTrigger.getAll();

      // Create new trigger
      const trigger = ScrollTrigger.create({
        trigger: ref.current,
        ...options,
      });

      // Clean up trigger
      return () => {
        trigger.kill();
      };
    }, ref.current);

    return () => {
      ctx.revert();
    };
  }, [options]);

  return ref;
};

/**
 * @spec: Hook for GSAP ScrollSmoother
 * @note: This requires GSAP ScrollSmoother plugin to be loaded
 */
export const useGSAPScrollSmoother = () => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    // Note: You need to load ScrollSmoother plugin separately
    // gsap.registerPlugin(ScrollSmoother);

    const ctx = gsap.context(() => {
      // Initialize smoother would go here
      // const smoother = ScrollSmoother.create({
      //   wrapper: ref.current,
      //   content: '#smooth-content',
      // });

      // return () => smoother.kill();
    }, ref.current);

    return () => {
      ctx.revert();
    };
  }, []);

  return ref;
};