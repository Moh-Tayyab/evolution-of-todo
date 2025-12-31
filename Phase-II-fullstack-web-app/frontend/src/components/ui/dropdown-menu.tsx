// @spec: specs/003-modern-ui-ux/spec.md
// @spec: specs/003-modern-ui-ux/plan.md
// Animated Dropdown Menu component with Framer Motion

"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  align?: "left" | "right";
}

const dropdownVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      duration: 0.3,
      bounce: 0.3,
      staggerChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: { duration: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

export function DropdownMenu({ trigger, children, className, align = "left" }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              "absolute z-50 mt-2 min-w-[8rem] rounded-md border bg-white shadow-lg py-1 px-1",
              align === "right" ? "right-0" : "left-0",
              className
            )}
          >
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                return (
                  <motion.div
                    variants={itemVariants}
                    onClick={() => setIsOpen(false)}
                  >
                    {child}
                  </motion.div>
                );
              }
              return child;
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DropdownMenuItem({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "flex w-full items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-zinc-100 text-left",
        className
      )}
      {...props}
    />
  );
}
