// @spec: specs/003-modern-ui-ux/spec.md
// @spec: specs/003-modern-ui-ux/plan.md
// Animated Input component with Framer Motion

"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export interface InputProps extends Omit<HTMLMotionProps<"input">, "onAnimationStart"> {
  error?: string;
  label?: string;
}

// Animation variants for input
const inputContainerVariants = {
  default: { borderColor: "#e2e8f0" },
  focus: {
    borderColor: "#0ea5e9",
    boxShadow: "0 0 0 3px rgba(14, 165, 233, 0.1)",
    transition: { duration: 0.2 },
  },
  error: {
    borderColor: "#ef4444",
    boxShadow: "0 0 0 3px rgba(239, 68, 68, 0.1)",
    transition: { duration: 0.2 },
  },
};

const shakeVariants = {
  idle: { x: 0 },
  shake: {
    x: [-8, 8, -6, 6, -4, 4, 0],
    transition: { duration: 0.4 },
  },
};

const errorVariants = {
  hidden: { opacity: 0, y: -8, height: 0 },
  visible: { opacity: 1, y: 0, height: "auto", transition: { duration: 0.2 } },
  exit: { opacity: 0, y: -8, height: 0, transition: { duration: 0.15 } },
};

export const Input = motion(
  React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, error, label, isFocused, ...props }, ref) => {
      const [focused, setFocused] = React.useState(false);

      return (
        <motion.div
          className="relative"
          animate={
            error
              ? "error"
              : focused
              ? "focus"
              : "default"
          }
          variants={inputContainerVariants}
        >
          {label && (
            <motion.label
              className={cn(
                "absolute left-3 text-sm transition-all duration-200 pointer-events-none",
                focused || props.value
                  ? "-top-2.5 bg-white px-1 text-xs text-primary-500"
                  : "top-3.5 text-muted-foreground"
              )}
              animate={
                focused || props.value
                  ? { scale: 0.9, color: "#0ea5e9" }
                  : { scale: 1, color: "#64748b" }
              }
              transition={{ duration: 0.2 }}
            >
              {label}
            </motion.label>
          )}
          <input
            type={type}
            className={cn(
              "flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm transition-all duration-200",
              "placeholder:text-muted-foreground",
              "focus:outline-none",
              error ? "border-error" : "",
              className
            )}
            ref={ref}
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
          <AnimatePresence>
            {error && (
              <motion.p
                variants={errorVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="mt-1 text-sm text-error px-1"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      );
    }
  )
);

Input.displayName = "Input";

// Shake helper for triggering shake animation
export function useInputShake() {
  const [shake, setShake] = React.useState(false);

  const triggerShake = React.useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  }, []);

  return { shake, triggerShake };
}

// For AnimatePresence
import { AnimatePresence } from "framer-motion";
