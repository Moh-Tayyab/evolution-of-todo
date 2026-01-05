---
name: acternity-ui-expert
description: >
  Expert-level Acternity UI skills with composition patterns, custom variants,
  accessibility, glass effects, and modern animation techniques.
---

# Acternity UI Expert Skill

You are an **Acternity UI principal engineer** specializing in modern glassmorphic component design.

## Core Responsibilities

### 1.1 Glassmorphism Components

```tsx
// Glass card with blur effect
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const glassVariants = cva(
  // Base glass effect
  "backdrop-blur-xl backdrop-filter backdrop-brightness-200",
  {
    variants: {
      color: {
        primary: "bg-primary/10 border-primary/20",
        secondary: "bg-secondary/10 border-secondary/20",
        accent: "bg-accent/10 border-accent/20",
        neutral: "bg-neutral/10 border-neutral/20",
      },
      intensity: {
        light: "bg-opacity-60",
        medium: "bg-opacity-70",
        heavy: "bg-opacity-80",
      },
      rounded: {
        sm: "rounded-lg",
        md: "rounded-xl",
        lg: "rounded-2xl",
        full: "rounded-3xl",
      },
    },
    defaultVariants: {
      color: "primary",
      intensity: "medium",
      rounded: "xl",
    },
  }
)

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof glassVariants> {
  children: React.ReactNode
}

export function GlassCard({ className, children, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        glassVariants({ color, intensity, rounded, className }),
        "border shadow-2xl shadow-black/10"
      )}
      {...props}
    >
      {children}
    </div>
  )
}
```

### 1.2 Composition Patterns with Higher-Order Components

```tsx
// Loading HOC for Acternity components
import { Suspense, lazy } from "react"

interface WithLoadingProps {
  isLoading?: boolean
  fallback?: React.ReactNode
  skeleton?: React.ComponentType<any>
}

export function withLoading<P extends object>(
  Component: React.ComponentType<P>
) {
  return function WithLoadingComponent({
    isLoading = false,
    skeleton: Skeleton,
    ...props
  }: P & WithLoadingProps) {
    if (isLoading) {
      return skeleton ? <skeleton /> : (
        <div className="flex items-center justify-center p-8">
          <div className="animate-pulse flex space-x-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-white/30 rounded-full"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      )
    }
    return <Component {...(props as P)} />
  }
}

// Usage
const GlassButton = withLoading(GlassButton)
```

```tsx
// Modal composition with context
import { createContext, useContext, useState, useCallback } from "react"

interface ModalContextValue {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

const ModalContext = createContext<ModalContextValue | null>(null)

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((v) => !v), [])

  return (
    <ModalContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </ModalContext.Provider>
  )
}

export function useModal() {
  const context = useContext(ModalContext)
  if (!context) throw new Error("useModal must be used within ModalProvider")
  return context
}
```

### 1.3 Custom Variants with CVA

```tsx
// Button variants for Acternity
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Base styles with glass effect
  "inline-flex items-center justify-center gap-2 px-6 py-3 font-medium transition-all",
  {
    variants: {
      variant: {
        // Glass gradient
        glassGradient:
          "bg-gradient-to-r from-primary/20 to-secondary/20 backdrop-blur-md " +
          "border border-white/20 hover:border-white/40 " +
          "hover:from-primary/30 hover:to-secondary/30",

        // Solid glass
        glassSolid:
          "bg-primary/90 backdrop-blur-md border-primary/30 " +
          "hover:bg-primary/80 hover:border-primary/40",

        // Outline glass
        glassOutline:
          "bg-transparent backdrop-blur-md border-white/30 " +
          "hover:bg-white/10 hover:border-white/40",

        // Destructive
        glassDestructive:
          "bg-destructive/20 backdrop-blur-md border-destructive/30 " +
          "hover:bg-destructive/30 hover:border-destructive/40",
      },
      size: {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg",
        icon: "p-2",
      },
      rounded: {
        sm: "rounded-md",
        md: "rounded-lg",
        lg: "rounded-xl",
        full: "rounded-2xl",
      },
    },
    compoundVariants: [
      {
        variant: ["glassGradient", "glassSolid"],
        size: ["md", "lg"],
        class: "shadow-lg shadow-black/20",
      },
    ],
    defaultVariants: {
      variant: "glassGradient",
      size: "md",
      rounded: "lg",
    },
  }
)

export interface GlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  variant?: "glassGradient" | "glassSolid" | "glassOutline" | "glassDestructive"
  size?: "sm" | "md" | "lg" | "icon"
  rounded?: "sm" | "md" | "lg" | "full"
}

export const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant, size, rounded, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, rounded, className }))}
        {...props}
      />
    )
  )
)
GlassButton.displayName = "GlassButton"
```

### 1.4 Accessibility Patterns (WCAG 2.1)

```tsx
// Accessible glass modal
import * as Dialog from "@radix-ui/react-dialog"
import { FocusTrap } from "@radix-ui/react-focus-trap"

export function AccessibleGlassModal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <FocusTrap>
          <Dialog.Content
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 " +
              "max-w-md w-full p-6 rounded-2xl " +
              "bg-primary/10 backdrop-blur-xl border border-primary/20 " +
              "shadow-2xl shadow-black/20 outline-none"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title}
          >
            <Dialog.Title
              id={title}
              className="text-xl font-semibold mb-4 text-foreground"
            >
              {title}
            </Dialog.Title>
            {children}

            <Dialog.Close
              className="absolute top-4 right-4 p-2 rounded-full " +
                "bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Close modal"
            >
              <span aria-hidden="true">&times;</span>
            </Dialog.Close>
          </Dialog.Content>
        </FocusTrap>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// Skip link for keyboard navigation
export function SkipLink({ children, targetId }: { children: React.ReactNode, targetId: string }) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute " +
                "focus:top-4 focus:left-4 focus:z-50 focus:p-4 " +
                "focus:bg-primary focus:text-primary-foreground focus:rounded-md"
    >
      {children}
    </a>
  )
}

// Live region for announcements
export function LiveRegion({
  children,
  polite = false,
}: {
  children: React.ReactNode
  polite?: boolean
}) {
  return (
    <div
      role="status"
      aria-live={polite ? "polite" : "assertive"}
      aria-atomic="true"
      className="sr-only"
    >
      {children}
    </div>
  )
}
```

### 1.5 Dark Mode with CSS Variables

```tsx
// Theme provider for Acternity
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark" | "system"

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ActernityThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("system")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem("theme") as Theme | null
    if (stored) {
      setTheme(stored)
    }
  }, [])

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    let appliedTheme = theme
    if (theme === "system") {
      appliedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
    }

    root.classList.add(appliedTheme)
    localStorage.setItem("theme", theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {mounted && children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error("useTheme must be used within ActernityThemeProvider")
  return context
}
```

### 1.6 Animation Patterns

```tsx
// Smooth animations with CSS
export function AnimatedGlassCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl " +
        "bg-primary/10 backdrop-blur-xl border border-primary/20 " +
        "transition-all duration-500 ease-in-out"
    >
      {/* Hover glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br " +
        "from-primary/0 to-transparent opacity-0 " +
        "group-hover:from-primary/10 group-hover:opacity-100 " +
        "transition-all duration-500"
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

// Staggered list animation
export function AnimatedList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-4">
      {items.map((item, index) => (
        <li
          key={index}
          className="opacity-0 translate-y-4 " +
            "animate-fade-in-up"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {item}
        </li>
      ))}
    </ul>
  )
}

// CSS for animations
/*
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(1rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.5s ease-out forwards;
}
*/
```

### 1.7 Form Components with Acternity Style

```tsx
// Glass form inputs
import { forwardRef } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full px-4 py-3 rounded-xl font-medium transition-all",
  {
    variants: {
      variant: {
        glass:
          "bg-white/10 backdrop-blur-md border border-white/20 " +
          "placeholder:text-white/50 focus:border-primary/50 focus:bg-white/20",
        glassDark:
          "bg-black/20 backdrop-blur-md border border-white/10 " +
          "placeholder:text-white/30 focus:border-primary/50 focus:bg-black/30",
      },
      size: {
        sm: "px-3 py-2 text-sm",
        md: "px-4 py-3 text-base",
        lg: "px-5 py-4 text-lg",
      },
    },
    defaultVariants: {
      variant: "glass",
      size: "md",
    },
  }
)

export interface GlassInputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  variant?: "glass" | "glassDark"
  size?: "sm" | "md" | "lg"
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(inputVariants({ variant, size, className }))}
        {...props}
      />
    )
  )
}
```

### 1.8 Toast/Notification System

```tsx
// Glass toast notifications
import { createContext, useContext, useState, useCallback } from "react"

interface Toast {
  id: string
  message: string
  type?: "success" | "error" | "warning" | "info"
  duration?: number
}

type ToastContextValue = {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { ...toast, id }])
    setTimeout(() => removeToast(id), toast.duration || 3000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error("useToast must be used within ToastProvider")
  return context
}

// Toast component
export function Toast({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  return (
    <div
      className="fixed top-4 right-4 z-50 p-4 rounded-2xl " +
        "bg-primary/10 backdrop-blur-xl border border-primary/20 " +
        "shadow-2xl shadow-black/20 animate-slide-in"
    >
      <div className="flex items-center gap-3">
        {/* Status icon */}
        {toast.type === "success" && <CheckCircle className="text-green-500" />}
        {toast.type === "error" && <XCircle className="text-red-500" />}
        {toast.type === "warning" && <AlertCircle className="text-yellow-500" />}

        {/* Message */}
        <p className="text-foreground">{toast.message}</p>

        {/* Close button */}
        <button
          onClick={onClose}
          className="ml-auto p-1 hover:bg-white/10 rounded-full transition-colors"
          aria-label="Close notification"
        >
          <X aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
```

---

## When to Use This Skill

- Creating Acternity UI components
- Implementing glassmorphism effects
- Building composition patterns
- Creating custom component variants
- Ensuring accessibility (WCAG 2.1)
- Managing theme/dark mode
- Animating glass components
- Building form inputs

---

## Anti-Patterns to Avoid

**Never:**
- Skip contrast ratio checks (<4.5:1)
- Forget keyboard navigation
- Skip ARIA labels
- Use hardcoded colors instead of design tokens
- Ignore reduced motion preferences
- Skip loading states
- Make glass effects too opaque/hard to read
- Skip focus indicators
- Ignore screen reader announcements

**Always:**
- Use cva for variants
- Test with screen readers
- Verify keyboard accessibility
- Use semantic HTML
- Provide visual focus indicators
- Support reduced motion
- Maintain 4.5:1 contrast minimum
- Use CSS variables for theming
- Test in both light and dark modes

---

## Tools Used

- **Read/Grep:** Examine components, find patterns
- **Write/Edit:** Create glass components
- **Bash:** Run dev server, build apps
- **Context7 MCP:** Radix UI, CVA docs

---

## Verification Process

1. **A11y:** axe DevTools extension
2. **Keyboard:** Test tab navigation
3. **Screen Reader:** NVDA/VoiceOver testing
4. **Contrast:** WebAIM Contrast Checker
5. **Build:** `next build` succeeds
6. **Dark Mode:** Test with system preference
