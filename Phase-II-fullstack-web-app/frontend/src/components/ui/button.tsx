// @spec: specs/003-modern-ui-ux/spec.md
// @spec: specs/003-modern-ui-ux/plan.md
// Animated Button component with Framer Motion

"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  isLoading?: boolean;
  children: React.ReactNode;
}

// Button variants for styling
const buttonStyles = {
  base: "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  variants: {
    default: "bg-primary-500 text-white hover:bg-primary-600",
    destructive: "bg-error text-white hover:bg-error/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
  },
  sizes: {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  },
};

// Animation variants for button
const buttonVariants = {
  idle: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
  loading: { scale: 1 },
};

const spinAnimation = {
  rotate: { rotate: 360 },
};

export const Button = motion(
  React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
      {
        className,
        variant = "default",
        size = "default",
        isLoading = false,
        children,
        disabled,
        ...props
      },
      ref
    ) => {
      return (
        <motion.button
          ref={ref}
          className={cn(
            buttonStyles.base,
            buttonStyles.variants[variant],
            buttonStyles.sizes[size],
            isLoading && "cursor-wait",
            className
          )}
          variants={buttonVariants}
          initial="idle"
          whileHover={!disabled && !isLoading ? "hover" : "idle"}
          whileTap={!disabled && !isLoading ? "tap" : "idle"}
          disabled={disabled || isLoading}
          {...props}
        >
          {isLoading && (
            <motion.div
              animate={spinAnimation}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="mr-2 h-4 w-4"
            >
              <Loader2 className="h-4 w-4" />
            </motion.div>
          )}
          <span className={isLoading ? "invisible" : ""}>{children}</span>
        </motion.button>
      );
    }
  )
);

Button.displayName = "Button";

export { buttonStyles };
