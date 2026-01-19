# Framer Motion References

Official documentation and resources for Framer Motion, the production-ready motion library for React.

## Official Resources

### Framer Motion Documentation
- **Official Website**: https://www.framer.com/motion/
- **GitHub**: https://github.com/framer/motion
- **Documentation**: https://www.framer.com/motion/introduction/
- **Examples**: https://www.framer.com/motion/examples/
- **API Reference**: https://www.framer.com/motion/api/

## Installation

```bash
npm install framer-motion
# or
yarn add framer-motion
# or
pnpm add framer-motion
```

## Core Concepts

### motion Component
```tsx
import { motion } from "framer-motion";

export function MyComponent() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      Hello
    </motion.div>
  );
}
```

### Animation Props
- `initial` - Starting state
- `animate` - Target state
- `exit` - Exit state (with AnimatePresence)
- `transition` - Timing configuration
- `whileHover` - Hover state
- `whileTap` - Tap/click state
- `whileInView` - When in viewport
- `drag` - Enable dragging

## Basic Animations

### Fade In
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>
```

### Slide Up
```tsx
<motion.div
  initial={{ y: 50, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ duration: 0.5, ease: "easeOut" }}
>
  Content
</motion.div>
```

### Scale
```tsx
<motion.div
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.9 }}
>
  Hover me
</motion.div>
```

## Gestures

### Hover
```tsx
<motion.button
  whileHover={{ scale: 1.05, backgroundColor: "#000" }}
  transition={{ type: "spring", stiffness: 400, damping: 10 }}
>
  Hover me
</motion.button>
```

### Tap/Click
```tsx
<motion.button
  whileTap={{ scale: 0.95 }}
  onTap={() => console.log("Tapped!")}
>
  Click me
</motion.button>
```

### Drag
```tsx
<motion.div
  drag
  dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
  whileDrag={{ scale: 1.1 }}
>
  Drag me
</motion.div>
```

## Layout Animations

### Layout Prop
```tsx
import { LayoutGroup } from "framer-motion";

function MyComponent() {
  return (
    <LayoutGroup>
      {items.map(item => (
        <motion.div layout key={item.id}>
          {item.content}
        </motion.div>
      ))}
    </LayoutGroup>
  );
}
```

### AnimateSharedLayout
```tsx
<AnimateSharedLayout>
  <motion.div layoutId="underline" />
</AnimateSharedLayout>
```

## Page Transitions

### AnimatePresence
```tsx
import { AnimatePresence } from "framer-motion";

function App() {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.3 }}
      >
        <Routes>{/* routes */}</Routes>
      </motion.div>
    </AnimatePresence>
  );
}
```

## Scroll Animations

### useScroll
```tsx
import { useScroll, useTransform } from "framer-motion";

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <motion.div
      className="progress-bar"
      style={{ scaleX }}
    />
  );
}
```

### useInView
```tsx
import { useInView } from "framer-motion";
import { useRef } from "react";

function RevealOnScroll() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
    >
      Content
    </motion.div>
  );
}
```

## Variants

```tsx
const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1 }
  })
};

function StaggeredList({ items }) {
  return (
    <motion.ul>
      {items.map((item, i) => (
        <motion.li
          key={item.id}
          custom={i}
          variants={variants}
          initial="hidden"
          animate="visible"
        >
          {item.text}
        </motion.li>
      ))}
    </motion.ul>
  );
}
```

## Hooks

### useAnimation
```tsx
import { useAnimation } from "framer-motion";

function ControlledAnimation() {
  const controls = useAnimation();

  return (
    <>
      <motion.div
        animate={controls}
        initial={{ x: 0 }}
      />
      <button onClick={() => controls.start({ x: 100 })}>
        Move
      </button>
    </>
  );
}
```

### useMotionValue
```tsx
import { useMotionValue, useTransform } from "framer-motion";

function MouseFollow() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  return (
    <div onMouseMove={(e) => {
      x.set(e.clientX);
      y.set(e.clientY);
    }}>
      <motion.div style={{ x, y }} />
    </div>
  );
}
```

## Animation Controls

### Timeline
```tsx
import { motion } from "framer-motion";

const sequence = async () => {
  await controls.start({ x: 100 });
  await controls.start({ y: 100 });
  await controls.start({ rotate: 360 });
};
```

## Server-Side Rendering

```tsx
'use client';

import { motion } from "framer-motion";

// Always add 'use client' for Framer Motion
export function ClientComponent() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      Content
    </motion.div>
  );
}
```

## Performance

### GPU Acceleration
```tsx
// Good - uses transform (GPU)
<motion.div animate={{ x: 100, scale: 1.5 }} />

// Avoid - uses layout (CPU)
<motion.div animate={{ width: "100%", top: 50 }} />
```

### will-change
```tsx
<motion.div
  style={{ willChange: "transform" }}
  animate={{ x: 100 }}
/>
```

### Layout Thrashing Prevention
```tsx
// Batch reads and writes
const x = useMotionValue(0);
const y = useMotionValue(0);
```

## Accessibility

### Reduced Motion
```tsx
const prefersReducedMotion = useReducedMotion();

<motion.div
  animate={prefersReducedMotion ? { opacity: 1 } : { x: 100 }}
  transition={{ duration: prefersReducedMotion ? 0.1 : 0.5 }}
/>
```

## Best Practices

- Always add 'use client' directive
- Use transform for better performance
- Use variants for complex animations
- Implement reduced motion support
- Test on mobile devices
- Use appropriate easing functions
- Consider accessibility

## Easing Functions

- `linear` - No easing
- `easeIn`, `easeOut`, `easeInOut` - Standard easing
- `circIn`, `circOut`, `circInOut` - Circular
- `backIn`, `backOut`, `backInOut` - Back
- `anticipate` - Moves back then forward

## Related Libraries

- **React Spring**: https://www.react-spring.dev/
- **React Transition Group**: https://reactcommunity.org/react-transition-group/
- **Auto Animate**: https://auto-animate.formkit.com/

## Resources

- **Framer Motion Examples**: https://www.framer.com/motion/examples/
- **Motion One**: https://motion.dev/
- **Framer University**: https://www.framer.com/academy/
