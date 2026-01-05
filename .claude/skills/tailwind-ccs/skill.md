---
name: tailwind-expert
description: >
  Expert-level Tailwind CSS skills with design system architecture, responsive patterns,
  dark mode, custom utilities, and performance optimization.
---

# Tailwind CSS Expert Skill

You are a **Tailwind CSS principal engineer** specializing in design system implementation.

## Core Responsibilities

### 1.1 Design System Architecture

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx}"],

  theme: {
    extend: {
      // Semantic colors
      colors: {
        // Brand colors with semantic names
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        // Status colors
        success: {
          50: "#f0fdf4",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
        },
        warning: {
          50: "#fffbeb",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
        },
        error: {
          50: "#fef2f2",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
        },
        // Neutral palette
        neutral: {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#e5e5e5",
          300: "#d4d4d4",
          400: "#a3a3a3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
          950: "#0a0a0a",
        },
      },

      // Typography scale
      fontSize: {
        // Display
        "display-lg": ["4rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-md": ["3rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-sm": ["2.25rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        // Heading
        "heading-lg": ["2rem", { lineHeight: "1.3" }],
        "heading-md": ["1.5rem", { lineHeight: "1.4" }],
        "heading-sm": ["1.25rem", { lineHeight: "1.4" }],
        // Body
        "body-lg": ["1.125rem", { lineHeight: "1.6" }],
        "body-md": ["1rem", { lineHeight: "1.5" }],
        "body-sm": ["0.875rem", { lineHeight: "1.5" }],
        "body-xs": ["0.75rem", { lineHeight: "1.5" }],
      },

      // Spacing scale (8px grid)
      spacing: {
        // Extra small
        "3xs": "0.125rem", // 2px
        "2xs": "0.25rem",  // 4px
        xs: "0.5rem",      // 8px
        // Standard
        sm: "0.75rem",     // 12px
        md: "1rem",        // 16px
        lg: "1.5rem",      // 24px
        xl: "2rem",        // 32px
        "2xl": "3rem",     // 48px
        "3xl": "4rem",     // 64px
        // Layout
        "4xl": "6rem",     // 96px
        "5xl": "8rem",     // 128px
      },

      // Border radius
      borderRadius: {
        // Semantic radii
        none: "0",
        sm: "0.25rem",
        DEFAULT: "0.375rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.5rem",
        full: "9999px",
        // Component-specific
        card: "0.75rem",
        button: "0.5rem",
        input: "0.5rem",
        badge: "9999px",
      },

      // Shadows
      boxShadow: {
        // Elevation levels
        "elevation-sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        elevation: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "elevation-md": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        "elevation-lg": "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        "elevation-xl": "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        // Functional
        "inner-sm": "inset 0 1px 2px 0 rgb(0 0 0 / 0.05)",
        focus: "0 0 0 2px white, 0 0 0 4px var(--color-primary-500)",
      },

      // Transitions
      transitionTimingFunction: {
        "ease-in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
        "ease-out": "cubic-bezier(0, 0, 0.2, 1)",
        "ease-in": "cubic-bezier(0.4, 0, 1, 1)",
        "spring-bounce": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      },

      // Z-index scale
      zIndex: {
        dropdown: "1000",
        sticky: "1020",
        fixed: "1030",
        "modal-backdrop": "1040",
        modal: "1050",
        popover: "1060",
        tooltip: "1070",
      },
    },
  },

  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
  ],
};

export default config;
```

### 1.2 Component Patterns

```tsx
// Button component with variants
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Base styles
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border border-input bg-background hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        success: "bg-success-500 text-white hover:bg-success-600",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 py-2",
        lg: "h-12 px-8 text-base",
        icon: "h-9 w-9",
        "icon-sm": "h-8 w-8",
      },
      state: {
        default: "",
        loading: "cursor-wait",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      state: "default",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({ className, variant, size, state, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, state, className }))}
      {...props}
    />
  );
}

// Card component
function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}>
      {children}
    </div>
  );
}

function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("flex flex-col space-y-1.5 p-6", className)}>{children}</div>;
}

function CardTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return <h3 className={cn("font-semibold leading-none tracking-tight", className)}>{children}</h3>;
}

// Input component
function Input({ className, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        error && "border-destructive focus-visible:ring-destructive",
        className
      )}
      {...props}
    />
  );
}
```

### 1.3 Responsive Design Patterns

```tsx
// Mobile-first breakpoint utilities
// Default: mobile
// sm: 640px
// md: 768px
// lg: 1024px
// xl: 1280px
// 2xl: 1536px

// Responsive typography
function ResponsiveTypography() {
  return (
    <div className="space-y-4">
      {/* Mobile: text-lg, Tablet+: text-xl, Desktop: text-2xl */}
      <p className="text-lg md:text-xl lg:text-2xl">
        Responsive text sizing
      </p>

      {/* Hide on mobile, show on tablet+ */}
      <div className="hidden md:block">
        Hidden on mobile, visible on tablet+
      </div>

      {/* Stacked on mobile, inline on desktop */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div>Item 1</div>
        <div>Item 2</div>
      </div>

      {/* Grid that changes columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <Card>Item 1</Card>
        <Card>Item 2</Card>
        <Card>Item 3</Card>
        <Card>Item 4</Card>
      </div>
    </div>
  );
}

// Container queries (requires plugin)
function ContainerQueryExample() {
  return (
    <div className="@container">
      <div className="@lg:bg-blue-500 @md:bg-green-500">
        Container-based styling
      </div>
    </div>
  );
}
```

### 1.4 Dark Mode Patterns

```tsx
// Dark mode with CSS variables
// tailwind.config.ts
colors: {
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
  // ...
},

// @layer base in globals.css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}

// Dark mode component usage
function DarkModeComponent() {
  return (
    <div className="bg-background text-foreground">
      <div className="bg-card p-4 rounded-lg">
        <h2 className="text-primary">Card Title</h2>
        <p className="text-muted-foreground">Description text</p>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded">
          Action
        </button>
      </div>
    </div>
  );
}

// Manual dark mode toggle
function ThemeToggle() {
  const isDark = useTheme(); // custom hook

  return (
    <button
      onClick={() => toggleTheme()}
      className={cn(
        "p-2 rounded-md transition-colors",
        isDark ? "bg-gray-800 text-white" : "bg-gray-100 text-black"
      )}
    >
      {isDark ? "🌙" : "☀️"}
    </button>
  );
}
```

### 1.5 Custom Utilities

```tsx
// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// lib/tailwind-utils.ts
@layer utilities {
  // Aspect ratios
  .aspect-video-4-3 {
    aspect-ratio: 4 / 3;
  }

  // Truncate at line
  .line-clamp-1 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
  }

  .line-clamp-2 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .line-clamp-3 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
  }

  // Text balance
  .text-balance {
    text-wrap: balance;
  }

  // Gradient text
  .text-gradient {
    background: linear-gradient(to right, var(--color-primary), var(--color-secondary));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  // Glass effect
  .glass {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  .glass-dark {
    background: rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  // Scrollbar hiding
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  // Focus ring
  .focus-ring {
    @apply focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2;
  }

  // Transitions
  .transition-colors-slow {
    @apply transition-colors duration-500 ease-in-out;
  }
}
```

### 1.6 Performance Optimization

```tsx
// Use CSS containment for performance
function OptimizedComponent() {
  return (
    <div className="contain-[layout|paint]">
      {/* Content that won't affect parent layout */}
    </div>
  );
}

// Optimize with content-visibility (CSS)
function VirtualizedList() {
  return (
    <div className="[content-visibility:auto]">
      {/* Items */}
    </div>
  );
}

// Use will-change sparingly
function AnimatedComponent() {
  return (
    <motion.div
      className="w-20 h-20"
      animate={{ rotate: 360 }}
      style={{ willChange: "transform" }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
    />
  );
}

// Optimize font loading
function OptimizedTypography() {
  return (
    <p className="font-sans font-medium antialiased">
      Optimized text rendering
    </p>
  );
}
```

---

## When to Use This Skill

- Building design systems
- Creating responsive layouts
- Implementing dark mode
- Writing custom utilities
- Optimizing for performance
- Configuring Tailwind config
- Managing theme with CSS variables

---

## Anti-Patterns to Avoid

**Never:**
- Hardcode colors (use design tokens)
- Skip mobile-first approach
- Use arbitrary values excessively
- Nest Tailwind classes too deeply
- Forget `content` in config
- Mix CSS and Tailwind arbitrarily
- Skip dark mode testing

**Always:**
- Use semantic naming (brand, success, error)
- Extend, don't override theme
- Use `@apply` sparingly
- Test responsive breakpoints
- Use CSS variables for themes
- Enable JIT mode
- Use `cn()` utility for composition

---

## Tools Used

- **Read/Grep:** Examine design tokens
- **Write/Edit:** Create components, config
- **Bash:** Run build commands
- **Context7 MCP:** Tailwind docs

---

## Verification Process

1. **Build:** `pnpm build` succeeds
2. **Linting:** `eslint --ext .ts,.tsx`
3. **Type Check:** `tsc --noEmit`
4. **Dark Mode:** Test in system preference
5. **Responsive:** Test all breakpoints
