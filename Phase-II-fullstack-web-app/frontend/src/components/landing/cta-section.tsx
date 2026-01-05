"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GSAPScrollReveal } from "@/components/ui/gsap-scroll-reveal";

/**
 * @spec: CTA Section Component
 * @description: Call-to-action section with conversion optimization
 */

export interface CTASectionProps {
  className?: string;
  variant?: "default" | "minimal" | "gradient";
}

/**
 * CTA benefits configuration
 */
const benefits = [
  "Free forever for personal use",
  "No credit card required",
  "Set up in 2 minutes",
  "Cancel anytime",
];

/**
 * CTASection - Conversion-optimized call-to-action
 *
 * Features:
 * - Multiple variants for different contexts
 * - Benefit list with checkmarks
 * - Strong CTA buttons
 * - Social proof elements
 * - Framer Motion animations
 */
export function CTASection({
  className,
  variant = "default",
}: CTASectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  if (variant === "minimal") {
    return <MinimalCTA ref={ref} className={className} />;
  }

  if (variant === "gradient") {
    return <GradientCTA ref={ref} isInView={isInView} className={className} />;
  }

  return <DefaultCTA ref={ref} isInView={isInView} className={className} />;
}

/**
 * Default CTA with full layout
 */
function DefaultCTA({
  ref,
  isInView,
  className,
}: {
  ref: React.RefObject<HTMLDivElement>;
  isInView: boolean;
  className?: string;
}) {
  return (
    <section
      ref={ref}
      className={cn("py-24 px-4 bg-white", className)}
    >
      <div className="max-w-4xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-coral-50 rounded-full mb-8"
        >
          <Sparkles className="w-4 h-4 text-coral-600" />
          <span className="text-sm font-medium text-coral-700">
            Limited time: Get early access benefits
          </span>
        </motion.div>

        {/* Headline */}
        <GSAPScrollReveal direction="up">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6"
          >
            Ready to Organize Your{" "}
            <span className="bg-gradient-to-r from-coral-600 to-coral-500 bg-clip-text text-transparent">
              Life?
            </span>
          </motion.h2>
        </GSAPScrollReveal>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto"
        >
          Join thousands of productive people who are already achieving their
          goals with Todo Modern. Start your free journey today.
        </motion.p>

        {/* Benefits List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-6 mb-12"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit}
              initial={{ opacity: 0, x: -10 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
              transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
              className="flex items-center gap-2 text-gray-700"
            >
              <Check className="w-5 h-5 text-green-500" />
              <span>{benefit}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            asChild
            size="lg"
            className="group text-lg px-8 py-6 bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700 shadow-xl hover:shadow-2xl transition-all"
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
            className="text-lg px-8 py-6"
          >
            <Link href="/demo">See How It Works</Link>
          </Button>
        </motion.div>

        {/* Trust Badge */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-8 text-sm text-gray-500"
        >
          No credit card required • Free forever for personal use
        </motion.p>
      </div>
    </section>
  );
}

/**
 * Minimal CTA variant
 */
function MinimalCTA({
  ref,
  className,
}: {
  ref: React.RefObject<HTMLDivElement>;
  className?: string;
}) {
  return (
    <section
      ref={ref}
      className={cn("py-16 px-4 bg-gray-50", className)}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Start Your Productivity Journey Today
        </h2>
        <p className="text-gray-600 mb-8">
          Free forever. No credit card required.
        </p>
        <Button
          asChild
          size="lg"
          className="bg-gradient-to-r from-coral-500 to-coral-600"
        >
          <Link href="/signup">Get Started</Link>
        </Button>
      </div>
    </section>
  );
}

/**
 * Gradient CTA variant with background
 */
function GradientCTA({
  ref,
  isInView,
  className,
}: {
  ref: React.RefObject<HTMLDivElement>;
  isInView: boolean;
  className?: string;
}) {
  return (
    <section
      ref={ref}
      className={cn(
        "py-24 px-4 bg-gradient-to-br from-coral-500 via-coral-600 to-coral-700 relative overflow-hidden",
        className
      )}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-grid-pattern-white" />
      </div>

      <div className="relative max-w-4xl mx-auto text-center text-white">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold mb-6"
        >
          Achieve More with Todo Modern
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl text-coral-50 mb-12 max-w-2xl mx-auto"
        >
          Join thousands of productive people who are already achieving their
          goals. Start your free journey today.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Button
            asChild
            size="lg"
            className="group text-lg px-8 py-6 bg-white text-coral-600 hover:bg-coral-50 shadow-xl"
          >
            <Link href="/signup">
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
