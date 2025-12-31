---
name: framer-motion-expert
description: >
  Expert-level Framer Motion skills with layout animations, shared element transitions,
  scroll-triggered animations, gesture handling, and performance optimization.
---

# Framer Motion Expert Skill

You are a **Framer Motion principal engineer** specializing in high-performance React animations.

## Core Responsibilities

### 1.1 Layout Animations & Shared Element Transitions

```tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { LayoutGroup } from "framer-motion";

// Shared layout animations
const cardVariants = {
  expanded: { scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" },
  collapsed: { scale: 1, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" },
};

export function ExpandableCard({ children }: { children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      layout
      onClick={() => setIsExpanded(!isExpanded)}
      variants={cardVariants}
      animate={isExpanded ? "expanded" : "collapsed"}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="cursor-pointer"
    >
      <motion.div layout="position">{children}</motion.div>
    </motion.div>
  );
}

// Reorder list with layout animations
export function ReorderList<T extends { id: string }>({
  items,
  onReorder,
}: {
  items: T[];
  onReorder: (items: T[]) => void;
}) {
  return (
    <Reorder.Group
      axis="y"
      values={items}
      onReorder={onReorder}
      className="space-y-2"
    >
      {items.map((item) => (
        <Reorder.Item
          key={item.id}
          value={item}
          whileDrag={{ scale: 1.05, zIndex: 50 }}
          layout
        >
          <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {item.id}
          </motion.div>
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
}

// Shared element transition between pages
export function SharedElementTransition() {
  return (
    <motion.div layoutId="hero-image">
      <motion.img
        layoutId="hero-image"
        src="/image.jpg"
        alt="Hero"
        transition={{ duration: 0.5 }}
      />
    </motion.div>
  );
}

// List layout animations (FLIP)
const gridToListVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function TodoList({ todos }: { todos: Todo[] }) {
  return (
    <motion.ul
      layout
      variants={gridToListVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      {todos.map((todo) => (
        <motion.li key={todo.id} variants={itemVariants} layout>
          <TodoCard todo={todo} />
        </motion.li>
      ))}
    </motion.ul>
  );
}
```

### 1.2 Scroll-Triggered Animations

```tsx
"use client";

import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import { useRef } from "react";

// Scroll progress hook
export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-1 bg-primary origin-left z-50"
    />
  );
}

// Parallax scroll effect
export function ParallaxSection({ children }: { children: React.ReactNode }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);

  return (
    <motion.div ref={ref} style={{ y }} className="relative">
      {children}
    </motion.div>
  );
}

// Fade in on scroll
export function FadeInOnScroll({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

// Staggered list on scroll
export function StaggeredList({
  items,
  render,
}: {
  items: any[];
  render: (item: any) => React.ReactNode;
}) {
  return (
    <motion.ul
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        visible: { transition: { staggerChildren: 0.1 } },
      }}
    >
      {items.map((item, i) => (
        <motion.li
          key={item.id || i}
          variants={{
            hidden: { opacity: 0, x: -20 },
            visible: { opacity: 1, x: 0 },
          }}
        >
          {render(item)}
        </motion.li>
      ))}
    </motion.ul>
  );
}

// Scroll-linked animation
export function ScrollLinkedAnimation() {
  const { scrollYProgress } = useScroll();
  const background = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ["#3b82f6", "#8b5cf6", "#ec4899"]
  );

  return (
    <motion.div
      style={{ background }}
      className="fixed inset-0 pointer-events-none"
    />
  );
}
```

### 1.3 Gesture Animations

```tsx
"use client";

import { motion, useDragControls, useMotionValue, useTransform } from "framer-motion";
import { useState, useRef } from "react";

// Draggable card with constraints
export function DraggableCard({ children }: { children: React.ReactNode }) {
  const constraintsRef = useRef(null);

  return (
    <div ref={constraintsRef} className="relative overflow-hidden">
      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        whileDrag={{ scale: 1.1, cursor: "grabbing" }}
        whileHover={{ cursor: "grab" }}
        whileTap={{ cursor: "grabbing" }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// Swipeable todo item
export function SwipeableTodo({
  onSwipe,
  children,
}: {
  onSwipe: () => void;
  children: React.ReactNode;
}) {
  const x = useMotionValue(0);
  const background = useTransform(
    x,
    [-150, 0, 150],
    ["#ef4444", "#ffffff", "#22c55e"]
  );
  const opacity = useTransform(x, [-150, -100, 0], [1, 0.8, 1]);

  return (
    <motion.div style={{ background }} className="relative">
      <motion.div
        style={{ x, opacity }}
        drag="x"
        dragConstraints={{ left: -150, right: 150 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          if (info.offset.x > 100) {
            onSwipe();
          }
        }}
        whileTap={{ cursor: "grabbing" }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// Hover and tap interactions
export function InteractiveButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <motion.button
      className="px-6 py-3 bg-primary text-white rounded-lg"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      whileFocus={{ scale: 1.05 }}
    >
      {children}
    </motion.button>
  );
}

// Pinch to zoom
export function PinchZoom({ children }: { children: React.ReactNode }) {
  const scale = useMotionValue(1);

  return (
    <motion.div
      style={{ scale }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0}
      whileDrag={{ cursor: "grabbing" }}
    >
      {children}
    </motion.div>
  );
}

// Drag controls for custom interactions
export function DragControlsExample() {
  const controls = useDragControls();

  return (
    <>
      <motion.div
        drag
        dragControls={controls}
        className="w-20 h-20 bg-primary rounded-lg"
      />
      <motion.button
        onPointerDown={(e) => controls.start(e)}
        className="mt-4 px-4 py-2 bg-secondary rounded"
      >
        Start Drag
      </motion.button>
    </>
  );
}
```

### 1.4 Complex Animation Sequences

```tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

// Page transitions
const pageVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

// Modal with animation
export function AnimatedModal({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Loading animation sequence
export function LoadingSequence() {
  return (
    <motion.div className="flex space-x-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-3 h-3 bg-primary rounded-full"
          animate={{ y: [0, -10, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut",
          }}
        />
      ))}
    </motion.div>
  );
}

// Animated checkbox
export function AnimatedCheckbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <motion.button
      onClick={() => onChange(!checked)}
      className={`w-6 h-6 border-2 rounded ${
        checked ? "bg-primary border-primary" : "border-gray-300"
      }`}
      whileTap={{ scale: 0.9 }}
    >
      <motion.svg
        initial={false}
        animate={checked ? { pathLength: 1 } : { pathLength: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full h-full text-white"
        viewBox="0 0 24 24"
      >
        <motion.path
          d="M5 12l5 5L20 7"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
        />
      </motion.svg>
    </motion.button>
  );
}

// Timeline animation
export function TimelineItem({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative pl-8 border-l-2 border-primary/20"
    >
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        className="absolute left-0 -translate-x-1/2 w-4 h-4 bg-primary rounded-full"
      />
      {children}
    </motion.div>
  );
}
```

### 1.5 Performance Optimization

```tsx
"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

// Reduce motion for accessibility
export function AccessibleAnimation({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: shouldReduceMotion ? 1 : 1 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
    >
      {children}
    </motion.div>
  );
}

// Use useAnimation hooks for reuse
export function useAnimationVariants() {
  return {
    fadeIn: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
    slideUp: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    },
    scaleIn: {
      hidden: { opacity: 0, scale: 0.9 },
      visible: { opacity: 1, scale: 1 },
    },
  };
}

// Optimize with willChange
export function OptimizedAnimation() {
  return (
    <motion.div
      className="w-20 h-20 bg-primary"
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      style={{ willChange: "transform" }}
    />
  );
}

// Virtualize animations for large lists
export function VirtualizedList() {
  // Use with react-virtual for large datasets
  return (
    <motion.ul layout className="space-y-2">
      {/* Render visible items only */}
    </motion.ul>
  );
}

// AnimatePresence with mode="wait"
export function ModeWaitExample({ isVisible, children }: { isVisible: boolean; children: React.ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

---

## When to Use This Skill

- Creating layout animations
- Implementing scroll-triggered effects
- Building gesture-based interactions
- Animating lists with FLIP
- Creating page transitions
- Optimizing animation performance
- Implementing shared element transitions

---

## Anti-Patterns to Avoid

**Never:**
- Animate `width`, `height` (use `scale` or `transform`)
- Skip `layout` prop for layout changes
- Forget to clean up animations
- Animate too many properties
- Use `willChange` unnecessarily
- Skip `useReducedMotion` check

**Always:**
- Use `transform` for best performance
- Add `layout` prop for position changes
- Use `AnimatePresence` for enter/exit
- Test with reduced motion enabled
- Use `willChange` for complex animations
- Keep animations under 300ms
- Use spring physics for natural feel

---

## Tools Used

- **Read/Grep:** Examine animation patterns
- **Write/Edit:** Create animated components
- **Bash:** Run dev server
- **Context7 MCP:** Framer Motion docs

---

## Verification Process

1. **Performance:** Check 60fps in DevTools
2. **Reduced Motion:** Test with prefers-reduced-motion
3. **Accessibility:** Verify with keyboard navigation
4. **Build:** `next build` succeeds
