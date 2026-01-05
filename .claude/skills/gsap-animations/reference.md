# GSAP Animations Reference

## Installation

```bash
pnpm install gsap @gsap/react
```

## Core API

### Tweens
```typescript
gsap.to(target, vars)       // Animate TO values
gsap.from(target, vars)     // Animate FROM values
gsap.fromTo(target, fromVars, toVars) // Explicit start and end
gsap.set(target, vars)      // Immediate set (duration: 0)
```

### Timelines
```typescript
const tl = gsap.timeline({ 
  paused: true, 
  repeat: -1, 
  yoyo: true,
  defaults: { duration: 0.5, ease: 'power2.inOut' }
});

tl.to(".box", { x: 100 })
  .to(".circle", { y: 50 }, "-=0.2") // Relative start
  .addLabel("step2")
  .to(".text", { opacity: 1 }, "step2+=0.5"); // At label + offset
```

### useGSAP (React)
```tsx
import { useGSAP } from "@gsap/react";

useGSAP(() => {
  // animations here
}, { 
  dependencies: [someValue], 
  scope: containerRef, 
  revertOnUpdate: true 
});
```

## Common Plugins

### ScrollTrigger
```typescript
gsap.registerPlugin(ScrollTrigger);

gsap.to(".box", {
  scrollTrigger: {
    trigger: ".container",
    start: "top 80%",
    end: "bottom 20%",
    scrub: true, // or number for lag
    pin: true,
    markers: true // for debugging
  },
  x: 500
});
```

### Flip
```typescript
gsap.registerPlugin(Flip);

const state = Flip.getState(".items");
// toggle some classes or move elements
Flip.from(state, { duration: 0.6, ease: "power1.inOut", stagger: 0.1 });
```

## Easing Reference
- `power1`, `power2`, `power3`, `power4`: Classic eases (in, out, inOut)
- `back`: Overshoots then returns. `back.out(1.7)`
- `elastic`: Bouncing spring effect. `elastic.out(1, 0.3)`
- `bounce`: Realistic bouncing. `bounce.out`
- `steps`: Discrete jumps. `steps(10)`
- `none`: Linear motion.

## Common Properties
- `x`, `y`, `z`: Transforms (translate)
- `rotation`, `rotationX`, `rotationY`: Rotation in degrees
- `scale`, `scaleX`, `scaleY`: Scale factor
- `skewX`, `skewY`: Skew in degrees
- `opacity`, `autoAlpha`: Transparency (autoAlpha sets visibility:hidden at 0)
- `backgroundColor`, `color`: Color properties
- `borderRadius`, `borderWidth`: CSS properties
