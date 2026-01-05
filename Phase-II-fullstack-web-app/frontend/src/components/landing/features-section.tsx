"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Zap,
  Shield,
  Palette,
  Globe,
  Smartphone,
  Users,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GSAPScrollReveal } from "@/components/ui/gsap-scroll-reveal";
import { StaggerChildren } from "@/components/animations/stagger-children";

/**
 * @spec: Features Section Component
 * @description: Landing page features showcase
 */

export interface FeaturesSectionProps {
  className?: string;
}

/**
 * Feature configuration
 */
const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Built for speed with instant load times and smooth interactions. No waiting, no lag.",
    color: "from-yellow-400 to-orange-500",
    bgColor: "bg-yellow-50",
  },
  {
    icon: Shield,
    title: "Secure by Default",
    description:
      "Your data is encrypted at rest and in transit. We never sell your information.",
    color: "from-green-400 to-emerald-500",
    bgColor: "bg-green-50",
  },
  {
    icon: Palette,
    title: "Beautiful Design",
    description:
      "Modern UI that delights users with smooth animations and intuitive interactions.",
    color: "from-purple-400 to-pink-500",
    bgColor: "bg-purple-50",
  },
  {
    icon: Globe,
    title: "Works Everywhere",
    description:
      "Access your tasks from any device, anywhere. Always in sync, always available.",
    color: "from-blue-400 to-cyan-500",
    bgColor: "bg-blue-50",
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    description:
      "Designed for mobile with native app experience. Use it on the go, anywhere.",
    color: "from-red-400 to-rose-500",
    bgColor: "bg-red-50",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Share tasks, assign responsibilities, and track progress together with your team.",
    color: "from-indigo-400 to-violet-500",
    bgColor: "bg-indigo-50",
  },
];

/**
 * FeaturesSection - Professional features showcase
 *
 * Features:
 * - GSAP scroll reveal animations
 * - Staggered children animations
 * - Interactive hover effects
 * - Gradient icons
 * - Responsive grid layout
 */
export function FeaturesSection({ className }: FeaturesSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section
      ref={ref}
      className={cn("py-24 px-4 bg-white", className)}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <GSAPScrollReveal direction="up">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
            >
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-coral-600 to-coral-500 bg-clip-text text-transparent">
                Stay Productive
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-600 max-w-2xl mx-auto"
            >
              Powerful features that help you manage tasks efficiently and
              achieve your goals faster.
            </motion.p>
          </div>
        </GSAPScrollReveal>

        {/* Features Grid */}
        <StaggerChildren
          staggerDelay={0.1}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group"
              >
                <div className="relative h-full p-8 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300">
                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={cn(
                      "w-14 h-14 rounded-xl bg-gradient-to-br",
                      feature.color,
                      "flex items-center justify-center mb-6 shadow-lg"
                    )}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </motion.div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Hover Effect Background */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      "absolute inset-0 rounded-2xl opacity-0 transition-opacity",
                      feature.bgColor
                    )}
                    style={{ zIndex: -1 }}
                  />
                </div>
              </motion.div>
            );
          })}
        </StaggerChildren>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <Button
            asChild
            size="lg"
            variant="outline"
            className="group"
          >
            <Link href="/features">
              Explore All Features
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

/**
 * FeatureDetail - Detailed feature showcase component
 */
export interface FeatureDetailProps {
  icon: React.ElementType;
  title: string;
  description: string;
  benefits: string[];
  reverse?: boolean;
  className?: string;
}

export function FeatureDetail({
  icon: Icon,
  title,
  description,
  benefits,
  reverse = false,
  className,
}: FeatureDetailProps) {
  return (
    <section className={cn("py-24 px-4 bg-gray-50", className)}>
      <div className="max-w-7xl mx-auto">
        <div
          className={cn(
            "grid grid-cols-1 lg:grid-cols-2 gap-12 items-center",
            reverse && "lg:flex-row-reverse"
          )}
        >
          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: reverse ? 20 : -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative aspect-square bg-gradient-to-br from-coral-100 to-coral-200 rounded-3xl flex items-center justify-center">
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Icon className="w-32 h-32 text-coral-600" />
              </motion.div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: reverse ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {title}
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              {description}
            </p>

            <ul className="space-y-4">
              {benefits.map((benefit, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-coral-100 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-coral-600" />
                  </div>
                  <span className="text-gray-700">{benefit}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
