// @spec: specs/003-modern-ui-ux/spec.md
// @spec: specs/003-modern-ui-ux/plan.md
// Micro-interaction components: Checked animation and Ripple effect

"use client";

import React, { useState, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// 1. Ripple Effect for Buttons
export function Ripple({ color = "rgba(255, 255, 255, 0.3)", duration = 600 }) {
  const [rippleArray, setRippleArray] = useState<Array<{ x: number; y: number; size: number }>>([]);

  const addRipple = (event: React.MouseEvent<HTMLDivElement>) => {
    const rippleContainer = event.currentTarget.getBoundingClientRect();
    const size = rippleContainer.width > rippleContainer.height ? rippleContainer.width : rippleContainer.height;
    const x = event.pageX - rippleContainer.x - size / 2;
    const y = event.pageY - rippleContainer.y - size / 2;

    const newRipple = { x, y, size };
    setRippleArray([...rippleArray, newRipple]);
  };

  useLayoutEffect(() => {
    let bounce: NodeJS.Timeout;
    if (rippleArray.length > 0) {
      bounce = setTimeout(() => {
        setRippleArray([]);
      }, duration);
    }
    return () => clearTimeout(bounce);
  }, [rippleArray.length, duration]);

  return (
    <div
        className="absolute inset-0 overflow-hidden rounded-[inherit]"
        onMouseDown={addRipple}
    >
      {rippleArray.map((ripple, index) => (
        <motion.span
          key={"ripple-" + index}
          initial={{ transform: "scale(0)", opacity: 0.5 }}
          animate={{ transform: "scale(2)", opacity: 0 }}
          transition={{ duration: duration / 1000 }}
          style={{
            top: ripple.y,
            left: ripple.x,
            width: ripple.size,
            height: ripple.size,
            position: "absolute",
            borderRadius: "50%",
            backgroundColor: color,
            pointerEvents: "none",
          }}
        />
      ))}
    </div>
  );
}

// 2. Animated Checkmark Draw
export function AnimatedCheckmark({ checked }: { checked: boolean }) {
  return (
    <div className="relative flex items-center justify-center h-5 w-5">
      <motion.div
        initial={false}
        animate={{
          scale: checked ? 1 : 0.8,
          backgroundColor: checked ? "#22c55e" : "transparent",
          borderColor: checked ? "#22c55e" : "#d4d4d8",
        }}
        className="absolute inset-0 rounded-full border-2"
      />
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3 w-3 text-white relative z-10"
      >
        <motion.path
          d="M20 6L9 17L4 12"
          initial={false}
          animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </svg>
    </div>
  );
}
