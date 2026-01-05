"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChevronDown, Play } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import { GSAPParallax } from "@/components/ui/gsap-parallax";
import { Spotlight } from "@/components/ui/aceternity/spotlight";

/**
 * @spec: Hero Section Component
 * @description: Landing page hero with animations and CTAs
 */

export interface HeroSectionProps {
  className?: string;
}

/**
 * HeroSection - Professional hero section with animations
 *
 * Features:
 * - Spotlight effect from Aceternity UI
 * - GSAP parallax background
 * - Framer Motion entrance animations
 * - Typewriter effect for headline
 * - Gradient text and buttons
 * - Scroll indicator
 */
export function HeroSection({ className }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({
    containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollY, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollY, [0, 1], [1, 0]);

  const words = [
    { text: "Organize", className: "text-coral-600" },
    { text: "Your" },
    { text: "Life," },
    { text: "Achieve" },
    { text: "Your" },
    { text: "Goals" },
  ];

  return (
    <section
      ref={containerRef}
      className={cn(
        "relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-coral-50",
        className
      )}
    >
      {/* Spotlight Effect */}
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="white"
      />

      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 left-20 w-96 h-96 bg-coral-200/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            x: [0, -100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"
        />
      </div>

      {/* Hero Content */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200 mb-8"
        >
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-gray-700">
            Now in Beta - Free for Early Adopters
          </span>
        </motion.div>

        {/* Headline with Typewriter Effect */}
        <div className="mb-8">
          <TypewriterEffect words={words} className="justify-center" />
        </div>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto"
        >
          The modern task management app that helps you stay organized,
          focused, and productive. Achieve more with less stress.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Button
            asChild
            size="lg"
            className="group text-lg px-8 py-6 bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700 shadow-lg hover:shadow-xl transition-all"
          >
            <Link href="/signup">
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="group text-lg px-8 py-6"
          >
            <Link href="/demo">
              <Play className="mr-2 w-5 h-5" />
              Watch Demo
            </Link>
          </Button>
        </motion.div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="flex items-center justify-center gap-8"
        >
          <div className="flex -space-x-2">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.3 + i * 0.1 }}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-coral-400 to-coral-600 border-2 border-white flex items-center justify-center text-white text-xs font-bold"
              >
                {String.fromCharCode(65 + i)}
              </motion.div>
            ))}
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900">
              Join 10,000+ productive users
            </p>
            <p className="text-sm text-gray-600">
              From startups to enterprises
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="flex flex-col items-center gap-2 text-gray-400"
        >
          <span className="text-sm">Scroll to learn more</span>
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </motion.div>
    </section>
  );
}

/**
 * HeroBackground - Animated background component for hero section
 */
export function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10">
      {/* Grid Pattern */}
      <div
        className="absolute inset-0 bg-grid-pattern opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-50/50" />
    </div>
  );
}
