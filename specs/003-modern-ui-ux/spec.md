# Feature Specification: Phase III - Modern UI/UX with Animation

**Feature Branch**: `003-modern-ui-ux`
**Created**: 2025-12-30
**Status**: Draft
**Input**: User description: "Create a professional, modern UI/UX with amazing animations using Framer Motion, shadcn/ui, and Aceternity UI"

## Overview

Transform the existing todo application into a visually stunning, highly interactive experience with professional-grade animations and a modern design system. This phase focuses on UI/UX enhancement while maintaining full functional parity with Phase II.

### Out of Scope
- Landing page animations and hero sections
- Onboarding tutorial animations
- Feature showcase or marketing pages

### In Scope
- Core dashboard components: Button, Input, Card, Dialog
- Task list animations (stagger, reorder, drag)
- Page transitions within the dashboard
- Filter, search, and sort component animations
- Aceternity UI premium components for dashboard enhancement

## Technology Stack

### Animation & Motion
- **Framer Motion** - Primary animation library
  - Declarative animations with `motion.div`, `motion.button`
  - Animation variants for orchestrating complex sequences
  - Scroll-linked animations with `useScroll`
  - Gesture-based interactions (drag, hover, tap)
  - Page transitions with `AnimatePresence`
  - Layout animations with `layout` prop

- **GSAP (GreenSock)** - Advanced scroll animations
  - ScrollTrigger plugin for powerful scroll-linked animations
  - Timeline-based sequencing for complex animation flows
  - Pinning and scrubbing for scroll-driven effects
  - Smooth parallax and reveal animations
  - Performance-optimized for 60fps animations

### Component Library
- **shadcn/ui** - Base component foundation
  - Copy-paste components (not npm dependency)
  - Built on Radix UI primitives
  - Full TypeScript support
  - Tailwind CSS styling
  - Accessible by default

### Premium Components
- **Aceternity UI** - Advanced animated components
  - 3D Card effects with perspective
  - Bento grid layouts
  - Spotlight effects
  - Magnetic buttons
  - Animated backgrounds

## Design System

### Color Palette

#### Primary (Brand Colors)
| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Primary-50 | #f0f9ff | 240, 249, 255 | Lightest background |
| Primary-100 | #e0f2fe | 224, 242, 254 | Hover backgrounds |
| Primary-200 | #bae6fd | 186, 230, 253 | Secondary backgrounds |
| Primary-300 | #7dd3fc | 125, 211, 252 | Accent borders |
| Primary-400 | #38bdf8 | 56, 189, 248 | Active states |
| Primary-500 | #0ea5e9 | 14, 165, 233 | Primary buttons |
| Primary-600 | #0284c7 | 2, 132, 199 | Primary buttons (hover) |
| Primary-700 | #0369a1 | 3, 105, 161 | Text on light backgrounds |
| Primary-800 | #075985 | 7, 89, 133 | Text on dark backgrounds |
| Primary-900 | #0c4a6e | 12, 74, 110 | Headings, emphasis |

#### Semantic Colors
| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Success | #22c55e | 34, 197, 94 | Completed tasks, positive actions |
| Warning | #f59e0b | 245, 158, 11 | High priority, alerts |
| Error | #ef4444 | 239, 68, 68 | Delete actions, errors |
| Info | #3b82f6 | 59, 130, 246 | Informational messages |

#### Background Colors
| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Background | #ffffff | 255, 255, 255 | Main page background |
| Surface | #f8fafc | 248, 250, 252 | Cards, modals |
| Surface-elevated | #ffffff | 255, 255, 255 | Dropdowns, popovers |

#### Text Colors
| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Foreground | #0f172a | 15, 23, 42 | Primary text |
| Muted | #64748b | 100, 116, 139 | Secondary text |
| Muted-foreground | #94a3b8 | 148, 163, 184 | Disabled text |
| Border | #e2e8f0 | 226, 232, 240 | Dividers, borders |

### Typography

#### Font Family
```css
/* sans-serif - Inter (Primary) */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* mono - JetBrains Mono (Code) */
font-family: 'JetBrains Mono', 'Fira Code', monospace;
```

#### Font Scale (Major Third - 1.25)
| Level | Size | Line Height | Usage |
|-------|------|-------------|-------|
| xs | 0.75rem | 1 | Labels, captions |
| sm | 0.875rem | 1.4 | Body small |
| base | 1rem | 1.6 | Body text |
| lg | 1.125rem | 1.6 | Body large |
| xl | 1.25rem | 1.5 | Section headers |
| 2xl | 1.5rem | 1.3 | Page headers |
| 3xl | 1.875rem | 1.2 | Major headings |
| 4xl | 2.25rem | 1.1 | Hero headings |
| 5xl | 3rem | 1 | Display text |

#### Font Weights
| Weight | Value | Usage |
|--------|-------|-------|
| Normal | 400 | Body text |
| Medium | 500 | Subheadings, emphasis |
| Semibold | 600 | Headings, labels |
| Bold | 700 | Display, emphasis |

### Spacing Scale (4px base)
| Name | Size | Pixels | Usage |
|------|------|--------|-------|
| space-1 | 0.25rem | 4px | Tight spacing |
| space-2 | 0.5rem | 8px | Inline elements |
| space-3 | 0.75rem | 12px | Related items |
| space-4 | 1rem | 16px | Standard gap |
| space-5 | 1.25rem | 20px | Between groups |
| space-6 | 1.5rem | 24px | Section spacing |
| space-8 | 2rem | 32px | Major sections |
| space-10 | 2.5rem | 40px | Page sections |
| space-12 | 3rem | 48px | Large containers |
| space-16 | 4rem | 64px | Page margins |

### Border Radius
| Name | Size | Pixels | Usage |
|------|------|--------|-------|
| radius-sm | 0.125rem | 2px | Small elements |
| radius-md | 0.375rem | 6px | Buttons, inputs |
| radius-lg | 0.5rem | 8px | Cards, modals |
| radius-xl | 0.75rem | 12px | Large cards |
| radius-2xl | 1rem | 16px | Popovers |
| radius-full | 9999px | Circular | Avatars, pills |

### Shadows
| Name | Value | Usage |
|------|-------|-------|
| shadow-sm | 0 1px 2px 0 rgb(0 0 0 / 0.05) | Subtle depth |
| shadow-md | 0 4px 6px -1px rgb(0 0 0 / 0.1) | Elevated elements |
| shadow-lg | 0 10px 15px -3px rgb(0 0 0 / 0.1) | Cards, dropdowns |
| shadow-xl | 0 20px 25px -5px rgb(0 0 0 / 0.1) | Modals, popovers |
| shadow-2xl | 0 25px 50px -12px rgb(0 0 0 / 0.25) | Floating elements |
| shadow-glow | 0 0 40px -10px rgba(14, 165, 233, 0.4) | Primary glow |

### Transitions
| Duration | Value | Usage |
|----------|-------|-------|
| duration-75 | 75ms | Quick interactions |
| duration-100 | 100ms | Hover states |
| duration-150 | 150ms | Standard transitions |
| duration-200 | 200ms | Button presses |
| duration-300 | 300ms | Panel transitions |
| duration-500 | 500ms | Complex animations |
| duration-700 | 700ms | Page transitions |
| duration-1000 | 1000ms | Complex sequences |

### Easing Curves
| Name | Value | Usage |
|------|-------|-------|
| ease-in | cubic-bezier(0.4, 0, 1, 1) | Out animations |
| ease-out | cubic-bezier(0, 0, 0.2, 1) | In animations |
| ease-in-out | cubic-bezier(0.4, 0, 0.2, 1) | Standard transitions |
| spring | cubic-bezier(0.175, 0.885, 0.32, 1.275) | Bouncy animations |

## Component Specifications

### Button Component

```tsx
import { motion } from "framer-motion";

const buttonVariants = {
  idle: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
  loading: { scale: 1 },
};

const spinAnimation = {
  rotate: { rotate: 360 },
};

export function Button({
  variant = "default",
  size = "default",
  isLoading = false,
  children,
  ...props
}) {
  return (
    <motion.button
      variants={buttonVariants}
      initial="idle"
      whileHover="hover"
      whileTap="tap"
      disabled={isLoading}
      className={cn(buttonStyles({ variant, size }))}
      {...props}
    >
      {isLoading && (
        <motion.div
          animate={spinAnimation}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <SpinnerIcon />
        </motion.div>
      )}
      <span className={isLoading ? "invisible" : ""}>{children}</span>
    </motion.button>
  );
}
```

**Variants:**
- `default`: Primary brand color, solid fill
- `secondary`: Muted background, subtle border
- `outline`: Transparent, border only
- `ghost`: Transparent, no border
- `destructive`: Error color for destructive actions
- `link`: Text only, underline on hover

**Sizes:**
- `sm`: 8px padding, 14px text
- `default`: 12px padding, 14px text
- `lg`: 16px padding, 16px text
- `icon`: Square button with icon

### Card Component

```tsx
import { motion } from "framer-motion";
import { CardSpotlight } from "@/components/ui/aceternity/card-spotlight";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
  hover: { y: -4, transition: { duration: 0.2 } },
};

export function TaskCard({ task, index }) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      transition={{ delay: index * 0.05 }}
    >
      <CardSpotlight className="w-full">
        <Card className="overflow-hidden">
          {/* Card content */}
        </Card>
      </CardSpotlight>
    </motion.div>
  );
}
```

### Error State Animation

```tsx
import { motion } from "framer-motion";

const shakeVariants = {
  initial: { x: 0 },
  shake: {
    x: [-10, 10, -10, 10, -5, 5, 0],
    transition: { duration: 0.5 },
  },
};

const errorVariants = {
  hidden: { opacity: 0, y: -10, height: 0 },
  visible: { opacity: 1, y: 0, height: "auto" },
  exit: { opacity: 0, y: -10, height: 0 },
};

export function ErrorField({ error, shake }: ErrorFieldProps) {
  return (
    <motion.div
      animate={shake ? "shake" : "initial"}
      variants={shakeVariants}
      className="relative"
    >
      <input
        className={cn(
          "w-full px-4 py-2.5 rounded-lg border bg-white",
          "focus:outline-none focus:ring-2",
          error
            ? "border-error focus:ring-error/20"
            : "border-gray-300 focus:ring-primary-500/20"
        )}
        {...props}
      />
      <AnimatePresence>
        {error && (
          <motion.p
            variants={errorVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="mt-1 text-sm text-error"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
```

### Input Component

```tsx
import { motion } from "framer-motion";

const inputVariants = {
  default: { borderColor: "#e2e8f0" },
  focus: { borderColor: "#0ea5e9", boxShadow: "0 0 0 3px rgba(14, 165, 233, 0.1)" },
  error: { borderColor: "#ef4444" },
};

export function Input({ error, ...props }) {
  return (
    <motion.div
      animate={error ? "error" : props.isFocused ? "focus" : "default"}
      variants={inputVariants}
    >
      <input
        className={cn(
          "w-full rounded-lg border bg-white px-4 py-2.5",
          "transition-all duration-200",
          "placeholder:text-muted-foreground",
          "focus:outline-none"
        )}
        {...props}
      />
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm text-error"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}
```

### Dialog Component

```tsx
import { motion, AnimatePresence } from "framer-motion";

const dialogVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", duration: 0.4, bounce: 0.3 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2 },
  },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export function Dialog({ open, onOpenChange, children }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => onOpenChange(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <motion.div
              className="pointer-events-auto"
              variants={dialogVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
```

### Task List Animation

```tsx
import { motion, Reorder, AnimatePresence } from "framer-motion";

export function TaskList({ tasks }) {
  return (
    <Reorder.Group
      axis="y"
      values={tasks}
      onReorder={setTasks}
      className="space-y-3"
    >
      <AnimatePresence>
        {tasks.map((task) => (
          <Reorder.Item
            key={task.id}
            value={task}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20, height: 0 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <TaskItem task={task} />
          </Reorder.Item>
        ))}
      </AnimatePresence>
    </Reorder.Group>
  );
}
```

### Page Transitions

```tsx
// app/layout.tsx
import { AnimatePresence, motion } from "framer-motion";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  enter: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3, ease: "easeIn" },
  },
};

export default function Template({ children }) {
  return (
    <motion.div
      initial="initial"
      animate="enter"
      exit="exit"
      variants={pageVariants}
    >
      {children}
    </motion.div>
  );
}
```

### Scroll-Linked Animations (Framer Motion)

```tsx
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{ scaleX, originX: 0 }}
      className="fixed top-0 left-0 right-0 h-1 bg-primary-500 z-50"
    />
  );
}

export function ParallaxSection() {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return <motion.div style={{ y }}>{content}</motion.div>;
}
```

### GSAP Scroll Animations

```tsx
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export function GsapScrollReveal() {
  const sectionRef = useRef(null);
  const revealRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fade in and slide up on scroll
      gsap.fromTo(
        revealRef.current,
        {
          opacity: 0,
          y: 100,
          rotationX: 10,
        },
        {
          opacity: 1,
          y: 0,
          rotationX: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            end: "top 30%",
            scrub: 1,
            toggleActions: "play none none reverse",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="min-h-screen py-20">
      <div ref={revealRef} className="container mx-auto">
        {children}
      </div>
    </section>
  );
}

export function GsapParallaxHero() {
  const heroRef = useRef(null);
  const textRef = useRef(null);
  const bgRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Background parallax
      gsap.to(bgRef.current, {
        yPercent: 30,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // Text reveal with stagger
      gsap.fromTo(
        textRef.current,
        {
          opacity: 0,
          y: 50,
          scale: 0.9,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.2,
          ease: "power4.out",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top 60%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="relative h-screen overflow-hidden">
      <div
        ref={bgRef}
        className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-700"
      />
      <div
        ref={textRef}
        className="relative z-10 flex flex-col items-center justify-center h-full text-white"
      >
        <h1 className="text-5xl md:text-7xl font-bold mb-6">Task Manager</h1>
        <p className="text-xl md:text-2xl max-w-2xl text-center">
          Organize your life, one task at a time
        </p>
      </div>
    </section>
  );
}

export function GsapTimelineAnimation() {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
      });

      // Sequential animations with timeline
      tl.from(".timeline-item-1", {
        opacity: 0,
        x: -50,
        duration: 0.5,
      })
        .from(".timeline-item-2", {
          opacity: 0,
          x: -50,
          duration: 0.5,
        })
        .from(".timeline-item-3", {
          opacity: 0,
          x: -50,
          duration: 0.5,
        })
        .to(".timeline-line", {
          height: "100%",
          duration: 1,
          ease: "none",
        }, "<");
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative py-20">
      <div className="timeline-line absolute left-8 top-0 w-0.5 h-0 bg-primary-500" />
      <div className="space-y-8">
        <div className="timeline-item-1 pl-16">Step 1: Create tasks</div>
        <div className="timeline-item-2 pl-16">Step 2: Organize with tags</div>
        <div className="timeline-item-3 pl-16">Step 3: Track progress</div>
      </div>
    </div>
  );
}

export function GsapHorizontalScroll() {
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray(".horizontal-section");

      gsap.to(sections, {
        xPercent: -100 * (sections.length - 1),
        ease: "none",
        scrollTrigger: {
          trigger: scrollContainerRef.current,
          pin: true,
          scrub: 1,
          snap: 1 / (sections.length - 1),
          end: () => "+=" + scrollContainerRef.current.offsetWidth,
        },
      });
    }, scrollContainerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={scrollContainerRef} className="h-screen flex overflow-hidden">
      <div className="horizontal-section flex-shrink-0 w-screen h-full flex items-center justify-center bg-primary-100">
        Section 1
      </div>
      <div className="horizontal-section flex-shrink-0 w-screen h-full flex items-center justify-center bg-primary-200">
        Section 2
      </div>
      <div className="horizontal-section flex-shrink-0 w-screen h-full flex items-center justify-center bg-primary-300">
        Section 3
      </div>
    </div>
  );
}
```

### Staggered List Animation

```tsx
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 },
  },
};

export function TaskGrid({ tasks }) {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {tasks.map((task) => (
        <motion.div key={task.id} variants={itemVariants}>
          <TaskCard task={task} />
        </motion.div>
      ))}
    </motion.div>
  );
}
```

### Bento Grid Layout (Aceternity)

```tsx
import { BentoGrid, BentoGridItem } from "@/components/ui/aceternity/bento-grid";

const gridItems = [
  {
    title: "Task Analytics",
    description: "Visualize your productivity trends over time.",
    header: <AnalyticsCard />,
    icon: <ChartIcon />,
    className: "md:col-span-2",
  },
  {
    title: "Quick Add",
    description: "Create a new task in seconds.",
    header: <QuickAddCard />,
    icon: <PlusIcon />,
  },
  {
    title: "Tags",
    description: "Organize with colorful labels.",
    header: <TagsCard />,
    icon: <TagIcon />,
  },
];

export function DashboardGrid() {
  return (
    <BentoGrid className="max-w-5xl mx-auto">
      {gridItems.map((item, i) => (
        <BentoGridItem
          key={i}
          title={item.title}
          description={item.description}
          header={item.header}
          icon={item.icon}
          className={item.className}
        />
      ))}
    </BentoGrid>
  );
}
```

### 3D Card Effect (Aceternity)

```tsx
import { CardContainer, CardBody, CardItem } from "@/components/ui/aceternity/3d-card";

export function PremiumTaskCard({ task }) {
  return (
    <CardContainer className="inter-var">
      <CardBody className="bg-white relative group/card w-auto rounded-xl p-6 border border-white/[0.2] shadow-xl">
        <CardItem
          translateZ="50"
          className="text-xl font-bold text-neutral-600"
        >
          {task.title}
        </CardItem>
        <CardItem
          as="p"
          translateZ="60"
          className="text-neutral-500 text-sm mt-2"
        >
          {task.description}
        </CardItem>
        <CardItem
          translateZ="70"
          className="w-full mt-4 flex items-center gap-2"
        >
          <PriorityBadge priority={task.priority} />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg"
          >
            View Details
          </motion.button>
        </CardItem>
      </CardBody>
    </CardContainer>
  );
}
```

### Spotlight Card Effect

```tsx
import { CardSpotlight } from "@/components/ui/aceternity/card-spotlight";

export function FeatureCard({ title, description, icon }) {
  return (
    <CardSpotlight className="w-full max-w-sm mx-auto">
      <div className="relative z-20 p-6 bg-white rounded-xl shadow-lg">
        <div className="mb-4">{icon}</div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-muted-foreground mt-2">{description}</p>
      </div>
    </CardSpotlight>
  );
}
```

### Empty State

```tsx
import { motion } from "framer-motion";

const emptyStateVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, staggerChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function EmptyState({ onCreateFirst }: EmptyStateProps) {
  return (
    <motion.div
      variants={emptyStateVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center py-16"
    >
      <motion.div variants={itemVariants} className="mb-6">
        <EmptyIllustration />
      </motion.div>
      <motion.h3 variants={itemVariants} className="text-xl font-semibold mb-2">
        No tasks yet
      </motion.h3>
      <motion.p variants={itemVariants} className="text-muted-foreground mb-6">
        Create your first task to get started
      </motion.p>
      <motion.button
        variants={itemVariants}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onCreateFirst}
        className="px-6 py-3 bg-primary-500 text-white rounded-lg"
      >
        Create First Task
      </motion.button>
    </motion.div>
  );
}
```

### Loading State (Skeleton + Spinner)

```tsx
import { motion } from "framer-motion";

const shimmerKeyframes = {
  "0%": { backgroundPosition: "-200% 0" },
  "100%": { backgroundPosition: "200% 0" },
};

export function TaskCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
      <div className="flex items-start gap-4">
        {/* Checkbox skeleton */}
        <div className="w-5 h-5 rounded bg-gray-200" />

        <div className="flex-1 space-y-3">
          {/* Title skeleton */}
          <div className="h-5 rounded bg-gray-200 w-3/4" />

          {/* Description skeleton */}
          <div className="h-4 rounded bg-gray-200 w-full" />
          <div className="h-4 rounded bg-gray-200 w-1/2" />

          {/* Tags skeleton */}
          <div className="flex gap-2">
            <div className="h-6 rounded-full bg-gray-200 w-16" />
            <div className="h-6 rounded-full bg-gray-200 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function LoadingSpinner({ size = "default" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    default: "h-5 w-5 border-2",
    lg: "h-8 w-8 border-3",
  };

  return (
    <motion.div
      className={cn(
        "border-primary-500 border-t-transparent rounded-full",
        sizeClasses[size]
      )}
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
    />
  );
}
```

### Magnetic Button

```tsx
import { motion } from "framer-motion";
import { useRef, useState } from "react";

export function MagneticButton({ children }) {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    setPosition({ x: x * 0.3, y: y * 0.3 });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className="px-6 py-3 bg-primary-500 text-white rounded-xl"
    >
      {children}
    </motion.button>
  );
}
```

## Animation Specifications

### Page Load Animations

| Element | Animation | Duration | Delay | Easing |
|---------|-----------|----------|-------|--------|
| Header | Slide in from top | 300ms | 0ms | ease-out |
| Page title | Fade in + slide up | 400ms | 100ms | ease-out |
| Task cards | Staggered fade in | 400ms | 200ms (stagger) | ease-out |
| Add button | Scale in | 300ms | 400ms | spring |
| Search bar | Fade in | 200ms | 300ms | ease-out |
| Filter panel | Slide down + fade in | 250ms | 0ms | ease-out |

### Interaction Animations

| Interaction | Element | Animation | Duration | Easing |
|-------------|---------|-----------|----------|--------|
| Hover | Button | Scale up slightly | 150ms | ease-out |
| Click | Button | Scale down | 100ms | ease-in |
| Focus | Input | Border highlight | 200ms | ease-out |
| Hover | Task card | Lift up | 200ms | ease-out |
| Click | Checkbox | Scale + check | 200ms | spring |
| Hover | Delete button | Color change + scale | 150ms | ease-out |

### Modal Animations

| State | Animation | Duration | Easing |
|-------|-----------|----------|--------|
| Open | Scale from 0.95 + fade in | 300ms | spring |
| Close | Scale to 0.95 + fade out | 200ms | ease-in |
| Overlay | Fade in | 200ms | ease-out |
| Overlay | Fade out | 150ms | ease-in |

### List Animations

| State | Animation | Duration | Easing |
|-------|-----------|----------|--------|
| Add task | Slide in from right + fade | 300ms | ease-out |
| Delete task | Slide out to left + fade | 200ms | ease-in |
| Reorder | Layout animation | 300ms | spring |
| Toggle complete | Scale + color change | 200ms | spring |
| Filter | Staggered fade | 300ms | ease-out |

## Responsive Design

### Breakpoints
| Breakpoint | Width | Target |
|------------|-------|--------|
| sm | 640px | Mobile landscape |
| md | 768px | Tablets |
| lg | 1024px | Laptops |
| xl | 1280px | Desktops |
| 2xl | 1536px | Large screens |

### Container Sizes
| Container | Max Width | Padding |
|-----------|-----------|---------|
| sm | 640px | 16px |
| md | 768px | 16px |
| lg | 1024px | 24px |
| xl | 1280px | 32px |
| 2xl | 1536px | 32px |

### Grid Layouts
| Viewport | Columns | Gap |
|----------|---------|-----|
| sm | 1 | 16px |
| md | 2 | 20px |
| lg | 3 | 24px |
| xl | 4 | 24px |

## Accessibility Requirements

### Animation Preferences
```tsx
// Respect reduced motion preferences (system setting only, no UI toggle)
import { useReducedMotion } from "framer-motion";

export function AnimatedComponent() {
  const shouldReduceMotion = useReducedMotion();

  // When reduced motion is enabled, use instant transitions
  const transition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.4, ease: "easeOut" };

  const initial = shouldReduceMotion
    ? { opacity: 1 }
    : { opacity: 0, y: 20 };

  return (
    <motion.div
      initial={initial}
      animate={{ opacity: 1, y: 0 }}
      transition={transition}
    />
  );
}
```

### WCAG 2.1 Compliance
- [ ] All interactive elements have visible focus states
- [ ] Color contrast meets AA standards (4.5:1 for text)
- [ ] Animations can be disabled via prefers-reduced-motion
- [ ] All animations complete within 5 seconds
- [ ] No flashing content (>3 flashes per second)
- [ ] Keyboard navigation fully functional
- [ ] Screen reader announcements for dynamic content

## Performance Guidelines

### Animation Performance
- Use `transform` and `opacity` for best performance
- Avoid animating `width`, `height`, `margin`, `padding`
- Use `will-change` sparingly for complex animations
- Limit simultaneous animations to 3-5 elements
- Use `layout` prop for smooth layout changes

### Code Splitting
```tsx
// Lazy load animation components
const AnimatedCard = lazy(() =>
  import("@/components/ui/animated-card").then((mod) => mod.AnimatedCard)
);
```

### Bundle Optimization
- Tree-shake unused Framer Motion exports
- Use motion variants for shared animations
- Implement code splitting for heavy components

## Testing Requirements

### Visual Testing
- [ ] Screenshot tests for all page states
- [ ] Animation timing verification
- [ ] Responsive layout testing
- [ ] Dark mode compatibility

### Interaction Testing
- [ ] User flow testing with Cypress/Playwright
- [ ] Animation completion verification
- [ ] Error state testing
- [ ] Loading state testing

## Clarifications

### Session 2025-12-30

- Q: What areas should be EXCLUDED from Phase III animations? → A: Core components only (Button, Input, Card, Dialog, Task list) - no landing page, onboarding, or marketing pages
- Q: How should empty state (no tasks) be animated? → A: Animated illustration with stagger children (0.2s), scale from 0.9, with CTA button
- Q: Should reduced motion be a toggle in UI or only respect system preference? → A: System preference only (useReducedMotion hook), no UI toggle
- Q: What loading state style should be used while tasks are fetching? → A: Skeleton cards with pulse animation + rotating spinner in loading buttons
- Q: How should form/validation errors be animated? → A: Shake animation (x: -10 to 10) + inline error message with AnimatePresence

---

## Success Criteria

### Functional
- [ ] All Phase II features remain fully functional
- [ ] No regression in core task management
- [ ] Responsive design works on 320px - 1920px

### Performance
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Animation frame rate > 60fps

### UX
- [ ] Animation Response: All animations feel responsive (<100ms latency)
- [ ] User Satisfaction: Polished, professional appearance
- [ ] Accessibility: Full keyboard and screen reader support

---

## Implementation Plan

See `plan.md` for detailed implementation steps.

## Dependencies

- `framer-motion` ^11.x
- `gsap` ^3.12.x (with ScrollTrigger plugin)
- `shadcn/ui` latest
- `@aceternity/ui` latest
- `lucide-react` latest (icons)

## References

- [Framer Motion Documentation](https://www.framer.com/motion/)
- [GSAP Documentation](https://gsap.com/docs/v3/)
- [GSAP ScrollTrigger](https://greensock.com/docs/v3/Plugins/ScrollTrigger/)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Aceternity UI](https://ui.aceternity.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Radix UI Primitives](https://www.radix-ui.com)
