# GSAP Animations Skill

## Overview
Expertise in GSAP (GreenSock Animation Platform), the industry-standard JavaScript animation library for high-performance, complex, and interactive web animations.

## Usage
Use for creating robust animations, scroll-triggered effects, complex timelines, and high-performance UI transitions in both vanilla JavaScript and React environments.

## Core Concepts
- **Tweens:** The foundation of GSAP (gsap.to, gsap.from, gsap.fromTo).
- **Timelines:** Sequencing tool for complex animation orchestrations.
- **useGSAP Hook:** The official React hook for safe GSAP integration, handling cleanup and scoping automatically.
- **Plugins:** Specialized modules like ScrollTrigger, Flip, MotionPath, and Draggable.
- **Eases:** Fine-tuning the feel of motion (power, bounce, elastic, custom).
- **Staggers:** Animating multiple elements with coordinated delays.

## Examples
```tsx
import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export function AnimatedComponent() {
  const container = useRef();
  
  useGSAP(() => {
    gsap.from('.box', { 
      opacity: 0, 
      y: 50, 
      stagger: 0.2,
      ease: 'power2.out' 
    });
  }, { scope: container });

  return (
    <div ref={container}>
      <div className="box">Item 1</div>
      <div className="box">Item 2</div>
    </div>
  );
}
```

## Best Practices
1. **React Integration:** Always use `@gsap/react`'s `useGSAP` hook for automatic cleanup.
2. **Performance:** Animate `transform` (x, y, scale, rotation) and `opacity` for GPU acceleration.
3. **Scoping:** Use the `scope` property in `useGSAP` to avoid global selector collisions.
4. **Context Safe:** Use `contextSafe` for event-driven animations (like click handlers).
5. **Registration:** Don't forget to `gsap.registerPlugin(useGSAP, ScrollTrigger, ...)` at the top level.
6. **Kill Animations:** If not using `useGSAP`, manually kill/revert animations on component unmount.

## Tools Used
- **Read/Grep Tools:** Examine existing animations, find CSS classes, read component structures.
- **Write/Edit Tools:** Implement animations, create complex timelines, register plugins.
- **Bash:** Install `gsap` and `@gsap/react` dependencies.
- **Context7 MCP:** Access latest GSAP API documentation and plugin references.

## Verification Process
1. **Visual Verification:** Check for smooth motion, correct easing, and expected triggers.
2. **Cleanup Check:** Ensure animations stop/revert when navigating away (no memory leaks).
3. **Console Audit:** Watch for GSAP warnings (e.g., target not found).
4. **Performance Audit:** Use DevTools to check for layout thrashing vs. GPU acceleration.
5. **Responsive Test:** Verify `ScrollTrigger` and layout animations work across screen sizes.

## Error Patterns
- **Missing Plugin Registration:** Using `ScrollTrigger` or `useGSAP` without `gsap.registerPlugin`.
- **Selector Collisions:** Using global selectors (like `.btn`) without scoping to a container.
- **Memory Leaks:** Creating animations in `useEffect` without reverting them in the cleanup function.
- **Invalid Targets:** Passing `null` or `undefined` as an animation target.
- **Property Typo:** Using `left` instead of `x`, or `top` instead of `y` (less performant).
