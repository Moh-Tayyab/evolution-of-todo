// @spec: specs/003-modern-ui-ux/spec.md
// @spec: specs/003-modern-ui-ux/plan.md
// GSAP Scroll Reveal Component

"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GsapScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function GsapScrollReveal({ children, className = "", delay = 0 }: GsapScrollRevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.6,
        ease: "easeOut",
        delay: delay,
      }}
    >
      {children}
    </motion.div>
  );
}
