# UI/UX Architecture Document
## Todo Fullstack Web Application

**Version:** 1.0.0
**Last Updated:** 2026-01-05
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Design System](#design-system)
3. [Component Architecture](#component-architecture)
4. [Animation Strategy](#animation-strategy)
5. [Page Layouts](#page-layouts)
6. [Reusable Intelligence Patterns](#reusable-intelligence-patterns)
7. [File Structure](#file-structure)
8. [Implementation Guidelines](#implementation-guidelines)

---

## Overview

### Vision Statement

Create a professional, production-ready task management interface that combines beauty, accessibility, and delightful interactions. The UI should feel fluid and responsive, with intelligent components that handle their own state, validation, and animations.

### Technology Stack Integration

| Library | Purpose | Integration Layer |
|---------|---------|-------------------|
| **shadcn/ui** | Base component primitives | Foundation layer |
| **Framer Motion** | Micro-interactions & transitions | Component layer |
| **GSAP** | Scroll-based animations | Page/route layer |
| **Aceternity UI** | Special effects & hero components | Showcase layer |
| **Tailwind CSS** | Styling & design tokens | All layers |
| **Radix UI** | Accessible primitives | Foundation layer |

### Design Philosophy

1. **Component-First Architecture**: Atomic components that compose into complex UIs
2. **Reusable Intelligence**: Components manage their own state, validation, animations
3. **Progressive Enhancement**: Core functionality works without JavaScript
4. **Accessibility First**: WCAG 2.1 AA compliance minimum
5. **Performance Budget**: 3s initial load, 100ms interaction response
6. **Mobile-First**: Responsive design from 320px to 1920px

---

## Design System

### Color Palette

#### Light Mode

```typescript
// tokens/colors/light.ts
export const lightColors = {
  // Primary (brand coral)
  primary: {
    50: '#fcf5f4',
    100: '#fae8e6',
    200: '#f7d4d1',
    300: '#f0b6b1',
    400: '#e0786f',
    500: '#d6675d',  // Primary brand
    600: '#c24a40',
    700: '#a23c33',
    800: '#87342d',
    900: '#71312b',
    950: '#3d1512',
  },

  // Semantic colors
  success: {
    light: '#dcfce7',
    DEFAULT: '#16a34a',
    dark: '#15803d',
  },
  warning: {
    light: '#fef3c7',
    DEFAULT: '#f59e0b',
    dark: '#d97706',
  },
  error: {
    light: '#fee2e2',
    DEFAULT: '#ef4444',
    dark: '#dc2626',
  },
  info: {
    light: '#dbeafe',
    DEFAULT: '#3b82f6',
    dark: '#2563eb',
  },

  // Priority colors
  priority: {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#6b7280',
  },

  // Neutral grays
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },
}
```

#### Dark Mode

```typescript
// tokens/colors/dark.ts
export const darkColors = {
  primary: {
    50: '#3d1512',
    100: '#71312b',
    200: '#87342d',
    300: '#a23c33',
    400: '#c24a40',
    500: '#d6675d',
    600: '#e0786f',
    700: '#f0b6b1',
    800: '#f7d4d1',
    900: '#fae8e6',
    950: '#fcf5f4',
  },

  neutral: {
    50: '#030712',
    100: '#111827',
    200: '#1f2937',
    300: '#374151',
    400: '#4b5563',
    500: '#6b7280',
    600: '#9ca3af',
    700: '#d1d5db',
    800: '#e5e7eb',
    900: '#f3f4f6',
    950: '#f9fafb',
  },
}
```

### Typography Scale

```typescript
// tokens/typography.ts
export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Monaco', 'monospace'],
  },

  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],   // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],      // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],   // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],    // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],     // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],  // 36px
    '5xl': ['3rem', { lineHeight: '1' }],          // 48px
    '6xl': ['3.75rem', { lineHeight: '1' }],       // 60px
  },

  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  letterSpacing: {
    tighter: '-0.025em',
    tight: '-0.015em',
    normal: '0',
    wide: '0.015em',
    wider: '0.025em',
  },
}
```

### Spacing System

```typescript
// tokens/spacing.ts
// 8px grid system
export const spacing = {
  0: '0',
  px: '1px',
  0.5: '0.125rem',   // 2px
  1: '0.25rem',      // 4px
  1.5: '0.375rem',   // 6px
  2: '0.5rem',       // 8px
  2.5: '0.625rem',   // 10px
  3: '0.75rem',      // 12px
  3.5: '0.875rem',   // 14px
  4: '1rem',         // 16px
  5: '1.25rem',      // 20px
  6: '1.5rem',       // 24px
  7: '1.75rem',      // 28px
  8: '2rem',         // 32px
  9: '2.25rem',      // 36px
  10: '2.5rem',      // 40px
  12: '3rem',        // 48px
  16: '4rem',        // 64px
  20: '5rem',        // 80px
  24: '6rem',        // 96px
  32: '8rem',        // 128px
  40: '10rem',       // 160px
  48: '12rem',       // 192px
  56: '14rem',       // 224px
  64: '16rem',       // 256px
}
```

### Border Radius

```typescript
// tokens/border.ts
export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
}
```

### Shadows

```typescript
// tokens/shadows.ts
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',

  // Colored shadows for emphasis
  primary: '0 10px 15px -3px rgb(214 103 93 / 0.3)',
  primaryLg: '0 20px 25px -5px rgb(214 103 93 / 0.4)',

  // Inner shadows
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
}
```

### Animation Tokens

```typescript
// tokens/animation.ts
export const animation = {
  // Durations
  duration: {
    instant: '100ms',
    fast: '200ms',
    normal: '300ms',
    slow: '500ms',
    slower: '700ms',
  },

  // Easing functions
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',

    // Custom easings
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },

  // Delays
  delay: {
    100: '100ms',
    200: '200ms',
    300: '300ms',
    500: '500ms',
    700: '700ms',
  },
}
```

---

## Component Architecture

### Atomic Design Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│                    Pages (Templates)                    │
│  LandingPage, DashboardPage, AuthPage, etc.            │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                    Organisms                            │
│  TaskDashboard, AuthForm, HeroSection, TaskCard         │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                    Molecules                            │
│  SearchBar, FilterPanel, TaskForm, TaskListItem         │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                    Atoms                                │
│  Button, Input, Badge, Dialog, Toast, Icon             │
└─────────────────────────────────────────────────────────┘
```

### Component Categories

#### 1. Foundation Components (shadcn/ui)

Location: `src/components/ui/`

Base primitive components with accessibility built-in:

```typescript
// Button with variants
export interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'link'
  size?: 'sm' | 'default' | 'lg' | 'icon'
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

// Input with validation
export interface InputProps {
  error?: string
  label?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

// Card with variants
export interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'filled'
  hoverable?: boolean
  interactive?: boolean
}
```

#### 2. Task Components (Domain-Specific)

Location: `src/components/tasks/`

Intelligent components with embedded business logic:

```typescript
// TaskCard - Complete task management in one component
export function TaskCard({
  task,
  onToggle,
  onEdit,
  onDelete
}: TaskCardProps) {
  // Internal state for animations
  const [isDragging, setIsDragging] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Optimistic updates
  const handleToggle = useCallback(() => {
    onToggle(task.id)
    // Optimistic animation feedback
  }, [task.id, onToggle])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group"
    >
      {/* Card content */}
    </motion.div>
  )
}

// TaskForm with embedded validation
export function TaskForm({
  mode,
  task,
  onSubmit,
  onCancel
}: TaskFormProps) {
  // Zod validation with automatic error display
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(taskCreateSchema)
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields with inline validation */}
    </form>
  )
}
```

#### 3. Layout Components

Location: `src/components/layout/`

Application shell components:

```typescript
// AppShell - Main layout wrapper
export function AppShell({
  children,
  header,
  sidebar
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <AnimatedBackground />
      {header && <Header />}
      <div className="flex">
        {sidebar && <Sidebar />}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}

// DashboardLayout - Specific to dashboard
export function DashboardLayout({
  children
}: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <AppShell
      header={<DashboardHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />}
      sidebar={isSidebarOpen && <DashboardSidebar />}
    >
      {children}
    </AppShell>
  )
}
```

#### 4. Animation Components

Location: `src/components/animations/`

Reusable animation patterns:

```typescript
// FadeIn - Simple fade animation
export function FadeIn({
  children,
  delay = 0,
  direction = 'up'
}: FadeInProps) {
  const variants = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
  }

  return (
    <motion.div
      initial={{ opacity: 0, ...variants[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  )
}

// StaggerChildren - Animated list
export function StaggerChildren({
  children,
  staggerDelay = 0.1
}: StaggerChildrenProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {React.Children.map(children, (child, i) => (
        <motion.div
          key={i}
          variants={fadeInUp}
          transition={{ delay: i * staggerDelay }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

// ScrollReveal - GSAP scroll trigger
export function ScrollReveal({
  children,
  threshold = 0.2
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    gsap.fromTo(element,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        scrollTrigger: {
          trigger: element,
          start: `top ${100 - threshold * 100}%`,
          toggleActions: 'play none none reverse',
        },
      }
    )

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [threshold])

  return <div ref={ref}>{children}</div>
}
```

### Component Composition Patterns

#### Smart Container + Dumb Presentation

```typescript
// Smart component (TaskListContainer)
export function TaskListContainer() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Business logic, API calls, state management
  useEffect(() => {
    loadTasks()
  }, [])

  const handleToggle = async (taskId: string) => {
    // Optimistic update
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ))

    try {
      await apiClient.toggleTask(taskId)
    } catch (error) {
      // Rollback
      setTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      ))
    }
  }

  return (
    <TaskList
      tasks={tasks}
      isLoading={isLoading}
      onToggle={handleToggle}
      // Presentation component receives data and callbacks
    />
  )
}

// Dumb component (TaskList)
export function TaskList({
  tasks,
  isLoading,
  onToggle
}: TaskListProps) {
  // Pure presentation logic, no API calls
  if (isLoading) return <TaskListSkeleton />

  return (
    <ul className="space-y-3">
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={() => onToggle(task.id)}
        />
      ))}
    </ul>
  )
}
```

#### Compound Components

```typescript
// Form compound component
export function Form({ children, onSubmit }: FormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {children}
    </form>
  )
}

Form.Input = function FormInput({
  label,
  error,
  ...props
}: FormInputProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input {...props} />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </div>
  )
}

Form.Actions = function FormActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 justify-end pt-4">
      {children}
    </div>
  )
}

// Usage
<Form onSubmit={handleSubmit}>
  <Form.Input label="Title" name="title" error={errors.title} />
  <Form.Input label="Description" name="description" />
  <Form.Actions>
    <Button type="button" variant="ghost">Cancel</Button>
    <Button type="submit">Save</Button>
  </Form.Actions>
</Form>
```

---

## Animation Strategy

### Animation Library Responsibilities

| Animation Type | Library | Use Case | Location |
|----------------|---------|----------|----------|
| **Micro-interactions** | Framer Motion | Hover, tap, focus states | Components |
| **Page transitions** | Framer Motion | Route changes, modal opens | Layout |
| **List animations** | Framer Motion | Add/remove items, reorder | Components |
| **Scroll effects** | GSAP + ScrollTrigger | Parallax, reveal on scroll | Pages |
| **Hero effects** | Aceternity UI | Landing page showcases | Landing |

### Framer Motion Patterns

#### 1. Micro-interactions

```typescript
// Hover interaction
export function InteractiveButton({ children, ...props }: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      {...props}
    >
      {children}
    </motion.button>
  )
}

// Focus animation
export function AnimatedInput(props: InputProps) {
  return (
    <motion.div
      whileFocus={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Input {...props} />
    </motion.div>
  )
}
```

#### 2. Page Transitions

```typescript
// Page wrapper with transitions
export function PageTransition({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}

// Layout wrapper for route transitions
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      <PageTransition key={useRouter().pathname}>
        {children}
      </PageTransition>
    </AnimatePresence>
  )
}
```

#### 3. List Animations

```typescript
// Animated list with layout animations
export function AnimatedTaskList({ tasks }: { tasks: Task[] }) {
  return (
    <motion.ul
      className="space-y-3"
      layout
    >
      <AnimatePresence>
        {tasks.map(task => (
          <AnimatedTaskItem key={task.id} task={task} />
        ))}
      </AnimatePresence>
    </motion.ul>
  )
}

// Individual item with exit animation
export function AnimatedTaskItem({ task }: { task: Task }) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
    >
      <TaskCard task={task} />
    </motion.li>
  )
}
```

### GSAP Patterns

#### 1. Scroll-Based Parallax

```typescript
// Parallax hero section
export function ParallaxHero() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Parallax background
      gsap.to('.hero-bg', {
        yPercent: 50,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })

      // Text reveal
      gsap.from('.hero-text', {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        scrollTrigger: {
          trigger: '.hero-text',
          start: 'top 80%',
        },
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} className="relative h-screen">
      <div className="hero-bg absolute inset-0" />
      <div className="hero-text relative z-10">
        {/* Content */}
      </div>
    </section>
  )
}
```

#### 2. Scroll-Triggered Reveals

```typescript
// Sequential reveal sections
export function ScrollRevealSection() {
  useEffect(() => {
    const sections = gsap.utils.toArray('.reveal-section')

    sections.forEach(section => {
      gsap.from(section, {
        opacity: 0,
        y: 50,
        duration: 0.8,
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      })
    })

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [])

  return (
    <div>
      <section className="reveal-section">Content 1</section>
      <section className="reveal-section">Content 2</section>
      <section className="reveal-section">Content 3</section>
    </div>
  )
}
```

#### 3. Smooth Scroll Progress

```typescript
// Reading progress indicator
export function ScrollProgress() {
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.to(progressRef.current, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3,
      },
    })
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
      <div
        ref={progressRef}
        className="h-full bg-primary-500 origin-left scale-x-0"
      />
    </div>
  )
}
```

### Aceternity UI Patterns

#### 1. Hero Effects

```typescript
// Spotlight hero
export function SpotlightHero() {
  return (
    <div className="relative h-screen">
      <SpotlightFeatureCards
        cards={[
          {
            title: 'Organize Tasks',
            description: 'Manage your tasks efficiently',
            icon: <CheckSquare />,
          },
          {
            title: 'Track Progress',
            description: 'Monitor your productivity',
            icon: <TrendingUp />,
          },
          {
            title: 'Collaborate',
            description: 'Work together seamlessly',
            icon: <Users />,
          },
        ]}
      />
    </div>
  )
}

// Text generate effect
export function HeroTitle({ text }: { text: string }) {
  return (
    <TextGenerateEffect
      words={text}
      className="text-6xl font-bold"
    />
  )
}

// Typewriter effect
export function HeroSubtitle() {
  return (
    <TypewriterEffect
      words={['Organize your life', 'Achieve your goals', 'Boost productivity']}
      className="text-2xl text-gray-600"
    />
  )
}
```

#### 2. Special Effects

```typescript
// Canvas reveal effect
export function RevealButton({ children }: { children: React.ReactNode }) {
  return (
    <CanvasRevealEffect
      colors={[#d6675d, #c24a40, #a23c33]}
      dotSize={2}
    >
      <Button>{children}</Button>
    </CanvasRevealEffect>
  )
}

// 3D card hover effect
export function ThreeDCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="group perspective-1000">
      <Card3D className="transform transition-transform duration-500 group-hover:rotate-y-12">
        {children}
      </Card3D>
    </div>
  )
}
```

### Animation Performance Guidelines

1. **Use transform and opacity only** - Avoid animating layout properties
2. **Will-change hint** - Add for complex animations
3. **Reduce motion** - Respect `prefers-reduced-motion`
4. **GPU acceleration** - Use `transform: translate3d()` for hardware acceleration
5. **Batch animations** - Use FLIP technique for complex layout changes
6. **Debounce scroll handlers** - Use requestAnimationFrame
7. **Cleanup GSAP** - Always revert contexts on unmount
8. **Limit concurrent animations** - Maximum 5-7 simultaneous animations

```typescript
// Reduced motion check
export function useReducedMotion() {
  const [shouldReduce, setShouldReduce] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setShouldReduce(mediaQuery.matches)

    const listener = (e: MediaQueryListEvent) => setShouldReduce(e.matches)
    mediaQuery.addEventListener('change', listener)

    return () => mediaQuery.removeEventListener('change', listener)
  }, [])

  return shouldReduce
}

// Usage
export function AnimatedComponent() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      animate={prefersReducedMotion ? { opacity: 1 } : { x: 100, opacity: 1 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5 }}
    >
      Content
    </motion.div>
  )
}
```

---

## Page Layouts

### 1. Landing Page

**Location:** `src/app/page.tsx`

**Components:**
```typescript
// Landing page structure
export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - Full viewport height */}
      <HeroSection />

      {/* Features Section - Scroll reveal */}
      <FeaturesSection />

      {/* Demo Section - Interactive preview */}
      <DemoSection />

      {/* Testimonials - Carousel */}
      <TestimonialsSection />

      {/* CTA Section - Final conversion */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </div>
  )
}
```

**Hero Section:**
```typescript
export function HeroSection() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background with GSAP parallax */}
      <ParallaxBackground />

      {/* Spotlight effect from Aceternity */}
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="white"
      />

      {/* Content with Framer Motion animations */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center"
      >
        <TextGenerateEffect
          words="Organize Your Life with Todo Modern"
          className="text-5xl md:text-7xl font-bold mb-6"
        />

        <TypewriterEffect
          words={['Task Management', 'Productivity Boost', 'Goal Achievement']}
          className="text-xl text-gray-600 mb-8"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="flex gap-4 justify-center"
        >
          <Button size="lg" asChild>
            <Link href="/signup">Get Started Free</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/demo">Watch Demo</Link>
          </Button>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <ChevronDown className="w-6 h-6" />
      </motion.div>
    </section>
  )
}
```

**Features Section:**
```typescript
export function FeaturesSection() {
  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Lightning Fast',
      description: 'Instant load times and smooth interactions',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Secure by Default',
      description: 'Your data is encrypted and protected',
    },
    {
      icon: <Palette className="w-8 h-8" />,
      title: 'Beautiful Design',
      description: 'Modern UI that delights users',
    },
  ]

  return (
    <ScrollRevealSection>
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Why Choose Todo Modern?</h2>
            <p className="text-xl text-gray-600">
              Built for productivity, designed for humans
            </p>
          </motion.div>

          <SpotlightFeatureCards cards={features} />
        </div>
      </section>
    </ScrollRevealSection>
  )
}
```

### 2. Sign In / Sign Up Pages

**Location:** `src/app/signin/page.tsx`, `src/app/signup/page.tsx`

**Layout:**
```typescript
export default function AuthPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding/Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <AuthVisuals />
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <AuthForm />
        </motion.div>
      </div>
    </div>
  )
}
```

**Auth Visuals:**
```typescript
export function AuthVisuals() {
  return (
    <div className="relative h-screen w-full bg-gradient-to-br from-primary-500 to-primary-700">
      {/* Animated background blobs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
        }}
        transition={{ duration: 20, repeat: Infinity }}
        className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          rotate: [90, 0, 90],
        }}
        transition={{ duration: 25, repeat: Infinity }}
        className="absolute bottom-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"
      />

      {/* Floating cards */}
      <div className="absolute inset-0 flex items-center justify-center">
        <StaggerChildren staggerDelay={0.2}>
          {[
            { icon: <CheckSquare />, text: 'Complete tasks' },
            { icon: <Target />, text: 'Reach goals' },
            { icon: <Trophy />, text: 'Achieve success' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="bg-white/20 backdrop-blur-lg rounded-xl p-4 m-2"
            >
              <div className="flex items-center gap-3 text-white">
                {item.icon}
                <span className="font-medium">{item.text}</span>
              </div>
            </motion.div>
          ))}
        </StaggerChildren>
      </div>

      {/* Quote */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-12 left-12 right-12 text-white"
      >
        <blockquote className="text-2xl font-light italic">
          "The secret of getting ahead is getting started."
        </blockquote>
        <cite className="text-sm opacity-75">— Mark Twain</cite>
      </motion.div>
    </div>
  )
}
```

**Auth Form:**
```typescript
export function AuthForm() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
      name: mode === 'signup' ? '' : undefined,
    },
  })

  const handleSubmit = async (data: AuthFormData) => {
    setIsLoading(true)
    try {
      if (mode === 'signin') {
        await authClient.signIn.email(data)
      } else {
        await authClient.signUp.email(data)
      }
      router.push('/dashboard')
    } catch (error) {
      toast.error('Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center mb-8"
      >
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
            <CheckSquare className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold">Todo Modern</span>
        </Link>
      </motion.div>

      {/* Form */}
      <motion.div
        key={mode}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
      >
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-6">
            {mode === 'signin' ? 'Welcome back' : 'Create account'}
          </h2>

          <Form onSubmit={form.handleSubmit(handleSubmit)}>
            {mode === 'signup' && (
              <Form.Input
                label="Full Name"
                {...form.register('name')}
                error={form.formState.errors.name?.message}
              />
            )}

            <Form.Input
              label="Email"
              type="email"
              {...form.register('email')}
              error={form.formState.errors.email?.message}
            />

            <Form.Input
              label="Password"
              type="password"
              {...form.register('password')}
              error={form.formState.errors.password?.message}
            />

            <Form.Actions>
              <Button
                type="submit"
                className="w-full"
                loading={isLoading}
              >
                {mode === 'signin' ? 'Sign In' : 'Create Account'}
              </Button>
            </Form.Actions>
          </Form>

          <div className="mt-6 text-center text-sm text-gray-600">
            {mode === 'signin' ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => setMode('signup')}
                  className="text-primary-600 font-medium hover:underline"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => setMode('signin')}
                  className="text-primary-600 font-medium hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
```

### 3. Dashboard Page

**Location:** `src/app/dashboard/page.tsx`

**Layout:**
```typescript
export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        {/* Dashboard Header */}
        <DashboardHeader />

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main content - Tasks */}
          <div className="lg:col-span-3">
            <TaskDashboard />
          </div>

          {/* Sidebar - Stats & filters */}
          <div className="lg:col-span-1">
            <DashboardSidebar />
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
```

**Dashboard Header:**
```typescript
export function DashboardHeader() {
  const { data: user } = useUser()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold">Todo Modern</span>
          </Link>

          {/* Search */}
          <div className="hidden md:block flex-1 max-w-lg mx-8">
            <SearchInput
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button onClick={() => setShowNewTask(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback>
                      {user?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem onClick={() => authClient.signOut()}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
```

**Task Dashboard:**
```typescript
export function TaskDashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [view, setView] = useState<'list' | 'board'>('list')

  return (
    <div className="space-y-6">
      {/* View toggle & filters */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={view === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('list')}
          >
            <List className="w-4 h-4 mr-2" />
            List
          </Button>
          <Button
            variant={view === 'board' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('board')}
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            Board
          </Button>
        </div>

        <FilterPanel />
      </div>

      {/* Stats cards */}
      <DashboardStats tasks={tasks} />

      {/* Task list/board */}
      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <TaskList tasks={tasks} />
          </motion.div>
        ) : (
          <motion.div
            key="board"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <TaskBoard tasks={tasks} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```

**Dashboard Stats:**
```typescript
export function DashboardStats({ tasks }: { tasks: Task[] }) {
  const stats = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
    highPriority: tasks.filter(t => t.priority === 'high').length,
  }), [tasks])

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        {
          label: 'Total Tasks',
          value: stats.total,
          icon: <Layers className="w-5 h-5" />,
          color: 'bg-blue-500',
        },
        {
          label: 'Completed',
          value: stats.completed,
          icon: <CheckCircle className="w-5 h-5" />,
          color: 'bg-green-500',
        },
        {
          label: 'Pending',
          value: stats.pending,
          icon: <Clock className="w-5 h-5" />,
          color: 'bg-yellow-500',
        },
        {
          label: 'High Priority',
          value: stats.highPriority,
          icon: <AlertCircle className="w-5 h-5" />,
          color: 'bg-red-500',
        },
      ].map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ scale: 1.05 }}
          className="bg-white rounded-xl p-4 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <div className={`p-2 ${stat.color} rounded-lg text-white`}>
              {stat.icon}
            </div>
            <span className="text-2xl font-bold">{stat.value}</span>
          </div>
          <p className="text-sm text-gray-600">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  )
}
```

---

## Reusable Intelligence Patterns

### 1. Smart Form Components

```typescript
// Form with built-in validation & submission handling
export function SmartForm<T extends Record<string, any>>({
  schema,
  onSubmit,
  defaultValues,
  children,
}: SmartFormProps<T>) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string>()

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const handleSubmit = async (data: T) => {
    setIsSubmitting(true)
    setServerError(undefined)

    try {
      await onSubmit(data)
      toast.success('Saved successfully')
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'An error occurred')
      toast.error('Failed to save')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form onSubmit={form.handleSubmit(handleSubmit)}>
      {/* Provide form state to children via context */}
      <FormContext.Provider value={{ form, isSubmitting, serverError }}>
        {children}
      </FormContext.Provider>
    </Form>
  )
}

// Usage
<SmartForm
  schema={taskCreateSchema}
  onSubmit={createTask}
  defaultValues={{ title: '', description: '' }}
>
  <Form.Input label="Title" name="title" />
  <Form.Input label="Description" name="description" />
  <Form.Submit>Create Task</Form.Submit>
</SmartForm>
```

### 2. Smart Data Display

```typescript
// Data table with sorting, filtering, pagination
export function SmartTable<T>({
  data,
  columns,
  pageSize = 10,
}: SmartTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>({})
  const [filters, setFilters] = useState<Filters>({})
  const [page, setPage] = useState(0)

  const filteredAndSortedData = useMemo(() => {
    let result = [...data]

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter(row =>
          String(row[key]).toLowerCase().includes(String(value).toLowerCase())
        )
      }
    })

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key!]
        const bVal = b[sortConfig.key!]
        const direction = sortConfig.direction === 'asc' ? 1 : -1
        return aVal > bVal ? direction : -direction
      })
    }

    return result
  }, [data, filters, sortConfig])

  const paginatedData = useMemo(() => {
    const start = page * pageSize
    return filteredAndSortedData.slice(start, start + pageSize)
  }, [filteredAndSortedData, page, pageSize])

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2">
        {columns.map(col => (
          col.filterable && (
            <Input
              key={col.key}
              placeholder={`Filter by ${col.label}`}
              value={filters[col.key] || ''}
              onChange={e => setFilters({ ...filters, [col.key]: e.target.value })}
            />
          )
        ))}
      </div>

      {/* Table */}
      <table className="w-full">
        <thead>
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                className="cursor-pointer"
                onClick={() => col.sortable && setSortConfig({
                  key: col.key,
                  direction: sortConfig.key === col.key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
                })}
              >
                {col.label}
                {sortConfig.key === col.key && (
                  <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((row, i) => (
            <motion.tr
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              {columns.map(col => (
                <td key={col.key}>{col.render(row[col.key])}</td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <Button
          disabled={page === 0}
          onClick={() => setPage(p => p - 1)}
        >
          Previous
        </Button>
        <span>
          Page {page + 1} of {Math.ceil(filteredAndSortedData.length / pageSize)}
        </span>
        <Button
          disabled={(page + 1) * pageSize >= filteredAndSortedData.length}
          onClick={() => setPage(p => p + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
```

### 3. Smart Async Component

```typescript
// Component with built-in loading/error/empty states
export function SmartAsync<T>({
  query,
  children,
  loadingComponent,
  errorComponent,
  emptyComponent,
}: SmartAsyncProps<T>) {
  const [state, setState] = useState<{
    data: T | null
    loading: boolean
    error: Error | null
  }>({
    data: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    let cancelled = false

    query()
      .then(data => {
        if (!cancelled) {
          setState({ data, loading: false, error: null })
        }
      })
      .catch(error => {
        if (!cancelled) {
          setState({ data: null, loading: false, error })
        }
      })

    return () => { cancelled = true }
  }, [query])

  if (state.loading) {
    return <>{loadingComponent || <LoadingSpinner />}</>
  }

  if (state.error) {
    return <>{errorComponent || <ErrorMessage error={state.error} />}</>
  }

  if (!state.data) {
    return <>{emptyComponent || <EmptyState />}</>
  }

  return <>{children(state.data)}</>
}

// Usage
<SmartAsync
  query={() => apiClient.getTasks(userId)}
  loadingComponent={<TaskListSkeleton />}
  errorComponent={(error) => <ErrorState error={error} retry={() => window.location.reload()} />}
  emptyComponent={<EmptyTasks onCreate={() => setShowForm(true)} />}
>
  {(tasks) => <TaskList tasks={tasks} />}
</SmartAsync>
```

### 4. Smart Hover Card

```typescript
// Hover card with intelligent positioning
export function SmartHoverCard({
  trigger,
  content,
  delay = 300,
}: SmartHoverCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(true)
    }, delay)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsOpen(false)
  }

  return (
    <HoverCard open={isOpen} onOpenChange={setIsOpen}>
      <HoverCardTrigger
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {trigger}
      </HoverCardTrigger>
      <HoverCardContent>
        {content}
      </HoverCardContent>
    </HoverCard>
  )
}
```

### 5. Smart Infinite Scroll

```typescript
// Infinite scroll with debouncing & loading states
export function SmartInfiniteScroll<T>({
  loadMore,
  renderItem,
  threshold = 200,
}: SmartInfiniteScrollProps<T>) {
  const [items, setItems] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const observerRef = useRef<IntersectionObserver>()
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const loadMoreItems = useCallback(async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    try {
      const newItems = await loadMore(items.length)
      if (newItems.length === 0) {
        setHasMore(false)
      } else {
        setItems(prev => [...prev, ...newItems])
      }
    } catch (error) {
      console.error('Failed to load more items:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, hasMore, loadMore, items.length])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMoreItems()
        }
      },
      { threshold: 0, rootMargin: `${threshold}px` }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    observerRef.current = observer

    return () => {
      observer.disconnect()
    }
  }, [loadMoreItems, threshold])

  return (
    <div>
      <AnimatePresence>
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            {renderItem(item, i)}
          </motion.div>
        ))}
      </AnimatePresence>

      {isLoading && <LoadingSpinner />}

      <div ref={loadMoreRef} className="h-10" />
    </div>
  )
}
```

---

## File Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   ├── signin/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   └── dashboard/
│   │       └── page.tsx
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Landing page (redirects)
│   └── globals.css
│
├── components/
│   ├── ui/                       # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── select.tsx
│   │   ├── badge.tsx
│   │   ├── toast.tsx
│   │   └── ...
│   │
│   ├── animations/               # Reusable animation components
│   │   ├── fade-in.tsx
│   │   ├── slide-in.tsx
│   │   ├── scale-in.tsx
│   │   ├── stagger-children.tsx
│   │   ├── scroll-reveal.tsx
│   │   └── page-transition.tsx
│   │
│   ├── aceternity/               # Aceternity UI components
│   │   ├── spotlight-hero.tsx
│   │   ├── feature-cards.tsx
│   │   ├── text-generate-effect.tsx
│   │   ├── typewriter-effect.tsx
│   │   ├── canvas-reveal-effect.tsx
│   │   └── 3d-card.tsx
│   │
│   ├── layout/                   # Layout components
│   │   ├── app-shell.tsx
│   │   ├── dashboard-layout.tsx
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   ├── footer.tsx
│   │   └── protected-route.tsx
│   │
│   ├── auth/                     # Authentication components
│   │   ├── sign-in-form.tsx
│   │   ├── sign-up-form.tsx
│   │   ├── auth-visuals.tsx
│   │   └── sign-out-button.tsx
│   │
│   ├── tasks/                    # Task-related components
│   │   ├── task-list.tsx
│   │   ├── task-item.tsx
│   │   ├── task-card.tsx
│   │   ├── task-form.tsx
│   │   ├── task-board.tsx
│   │   ├── priority-selector.tsx
│   │   └── tag-input.tsx
│   │
│   ├── search/                   # Search & filter components
│   │   ├── search-input.tsx
│   │   ├── filter-panel.tsx
│   │   ├── sort-selector.tsx
│   │   └── active-filters.tsx
│   │
│   └── landing/                  # Landing page components
│       ├── hero-section.tsx
│       ├── features-section.tsx
│       ├── demo-section.tsx
│       ├── testimonials-section.tsx
│       └── cta-section.tsx
│
├── lib/
│   ├── animations/               # Animation utilities
│   │   ├── variants.ts           # Framer Motion variants
│   │   ├── easings.ts            # Custom easing functions
│   │   ├── hooks.ts              # Custom animation hooks
│   │   └── gsap-provider.tsx     # GSAP context provider
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── use-reduced-motion.ts
│   │   ├── use-debounce.ts
│   │   ├── use-local-storage.ts
│   │   └── use-media-query.ts
│   │
│   ├── api.ts                    # API client
│   ├── auth.ts                   # Auth client
│   ├── validation.ts             # Zod schemas
│   └── utils.ts                  # General utilities
│
├── tokens/                       # Design tokens
│   ├── colors/
│   │   ├── light.ts
│   │   ├── dark.ts
│   │   └── index.ts
│   ├── typography.ts
│   ├── spacing.ts
│   ├── border.ts
│   ├── shadows.ts
│   └── animation.ts
│
├── styles/                       # Global styles
│   └── globals.css
│
└── types/
    └── index.ts                  # TypeScript types
```

---

## Implementation Guidelines

### 1. Component Development Workflow

**Step 1: Design Token Selection**
```typescript
// Use design tokens instead of hardcoded values
import { spacing, shadows, borderRadius } from '@/tokens'

className="p-4 rounded-lg shadow-md"
// Good: uses Tailwind scale based on tokens
```

**Step 2: Accessibility First**
```typescript
// Always include semantic HTML and ARIA labels
<button
  aria-label="Create new task"
  className="..."
>
  <Plus className="sr-only" />
  <span>Add Task</span>
</button>
```

**Step 3: Add Animations**
```typescript
// Wrap with motion component
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
>
  {/* Content */}
</motion.div>
```

**Step 4: Handle Loading/Error States**
```typescript
// Always handle async states
{isLoading ? (
  <Skeleton />
) : error ? (
  <ErrorMessage />
) : data ? (
  <Content data={data} />
) : (
  <EmptyState />
)}
```

**Step 5: Test Responsiveness**
```typescript
// Test on mobile, tablet, desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

### 2. Performance Optimization

**Code Splitting:**
```typescript
// Lazy load heavy components
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
})
```

**Image Optimization:**
```typescript
// Use Next.js Image component
import Image from 'next/image'

<Image
  src="/hero.png"
  alt="Hero"
  width={1920}
  height={1080}
  priority
/>
```

**Memoization:**
```typescript
// Memoize expensive computations
const sortedTasks = useMemo(() => {
  return tasks.sort((a, b) => a.title.localeCompare(b.title))
}, [tasks])
```

**Debouncing:**
```typescript
// Debounce search input
const debouncedSearch = useMemo(
  () => debounce((value: string) => {
    setSearchQuery(value)
  }, 300),
  []
)
```

### 3. Accessibility Checklist

- [ ] Semantic HTML elements
- [ ] ARIA labels for interactive elements
- [ ] Keyboard navigation support
- [ ] Focus indicators
- [ ] Color contrast (WCAG AA: 4.5:1)
- [ ] Screen reader support
- [ ] Reduced motion support
- [ ] Form error announcements
- [ ] Skip to content link
- [ ] Alt text for images

### 4. Testing Strategy

**Unit Tests:**
```typescript
// Test component behavior
test('TaskCard calls onToggle when checkbox clicked', () => {
  const handleToggle = jest.fn()
  render(<TaskCard task={mockTask} onToggle={handleToggle} />)

  fireEvent.click(screen.getByRole('checkbox'))

  expect(handleToggle).toHaveBeenCalledWith(mockTask.id)
})
```

**Integration Tests:**
```typescript
// Test user flows
test('User can create a task', async () => {
  render(<DashboardPage />)

  fireEvent.click(screen.getByText('Add Task'))

  fireEvent.change(screen.getByLabelText('Title'), {
    target: { value: 'New Task' },
  })

  fireEvent.click(screen.getByText('Create'))

  await waitFor(() => {
    expect(screen.getByText('New Task')).toBeInTheDocument()
  })
})
```

### 5. Browser Support

- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- Mobile iOS: Last 2 major versions
- Mobile Android: Last 2 major versions

### 6. Analytics & Monitoring

```typescript
// Track key interactions
import { trackEvent } from '@/lib/analytics'

export function TaskCard({ task, onToggle, onDelete }: TaskCardProps) {
  const handleToggle = () => {
    trackEvent('task_toggled', { taskId: task.id })
    onToggle(task.id)
  }

  const handleDelete = () => {
    trackEvent('task_deleted', { taskId: task.id })
    onDelete(task.id)
  }

  // ... rest of component
}
```

---

## Migration Strategy

### Phase 1: Foundation (Week 1)
1. Set up design tokens
2. Create base UI components
3. Implement animation utilities
4. Set up GSAP provider

### Phase 2: Core Components (Week 2)
1. Build layout components
2. Create task components
3. Implement search/filter components
4. Build auth components

### Phase 3: Pages (Week 3)
1. Implement landing page
2. Build auth pages
3. Create dashboard page
4. Add page transitions

### Phase 4: Polish (Week 4)
1. Add micro-interactions
2. Implement scroll effects
3. Optimize performance
4. Accessibility audit
5. Cross-browser testing

---

## Success Criteria

### Performance
- [ ] Lighthouse score: 90+ Performance
- [ ] First Contentful Paint: < 1.5s
- [ ] Time to Interactive: < 3s
- [ ] Cumulative Layout Shift: < 0.1

### Accessibility
- [ ] Lighthouse score: 100 Accessibility
- [ ] All components keyboard navigable
- [ ] Screen reader compatible
- [ ] WCAG 2.1 AA compliant

### User Experience
- [ ] Smooth animations (60fps)
- [ ] Clear visual hierarchy
- [ ] Consistent spacing & sizing
- [ ] Intuitive interactions

### Code Quality
- [ ] TypeScript strict mode
- [ ] 80%+ test coverage
- [ ] No console errors
- [ ] Responsive on all devices

---

## Resources

### Documentation
- [shadcn/ui Docs](https://ui.shadcn.com/)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [GSAP Docs](https://greensock.com/docs/)
- [Aceternity UI](https://ui.aceternity.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Inspiration
- [Linear](https://linear.app/) - Task management UI
- [Notion](https://notion.so/) - Block-based editing
- [Raycast](https://raycast.com/) - Command palette
- [Vercel](https://vercel.com/) - Dashboard design

### Tools
- [Figma](https://figma.com/) - Design mockups
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Performance testing
- [axe DevTools](https://www.deque.com/axe/devtools/) - Accessibility testing
- [React DevTools](https://react.dev/learn/react-developer-tools) - Debugging

---

**Document Status:** Complete
**Next Steps:** Begin Phase 1 implementation
