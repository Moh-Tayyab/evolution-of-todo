// @spec: specs/003-modern-ui-ux/spec.md
// @spec: specs/003-modern-ui-ux/plan.md
// GSAP Parallax Hero Component

"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";

export function GsapParallaxHero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  return (
    <section className="relative h-[60vh] overflow-hidden flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-300">
      {/* Animated background elements */}
      <motion.div
        animate={{
          scale: [1, 1.5, 1],
          rotate: [0, 180, 360],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 bg-gradient-to-br from-primary-200/30 to-primary-400/30"
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute w-4 h-4 bg-primary-400/20 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${60 + Math.random() * 20}%`,
            }}
          />
        ))}
      </div>

      {/* Hero content */}
      <motion.div
        ref={textRef}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 text-center px-4"
      >
        <motion.h1
          className="text-5xl md:text-7xl font-bold text-primary-900 mb-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Todo App
        </motion.h1>
        <motion.p
          className="text-xl md:text-2xl text-primary-700 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Modern task management with beautiful animations
        </motion.p>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-primary-400 rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-primary-400 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}
