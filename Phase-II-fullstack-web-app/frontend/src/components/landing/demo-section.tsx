"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Play, Maximize2, CheckSquare, Calendar, Tag, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GSAPScrollReveal } from "@/components/ui/gsap-scroll-reveal";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * @spec: Demo Section Component
 * @description: Interactive demo showcase of the app
 */

export interface DemoSectionProps {
  className?: string;
}

/**
 * Demo steps configuration
 */
const demoSteps = [
  {
    icon: CheckSquare,
    title: "Create Tasks",
    description: "Quickly add tasks with titles, descriptions, and priorities",
    color: "bg-coral-500",
  },
  {
    icon: Calendar,
    title: "Set Due Dates",
    description: "Never miss a deadline with smart reminders",
    color: "bg-blue-500",
  },
  {
    icon: Tag,
    title: "Organize with Tags",
    description: "Categorize tasks with custom tags for easy filtering",
    color: "bg-purple-500",
  },
  {
    icon: TrendingUp,
    title: "Track Progress",
    description: "Monitor your productivity with detailed analytics",
    color: "bg-green-500",
  },
];

/**
 * DemoSection - Interactive demo showcase
 *
 * Features:
 * - Animated demo preview
 * - Step-by-step feature highlights
 * - CTA to try the app
 * - Responsive design
 */
export function DemoSection({ className }: DemoSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      ref={ref}
      className={cn("py-24 px-4 bg-gradient-to-b from-gray-50 to-white", className)}
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
              See It in{" "}
              <span className="bg-gradient-to-r from-coral-600 to-coral-500 bg-clip-text text-transparent">
                Action
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-600 max-w-2xl mx-auto"
            >
              Watch how Todo Modern helps you stay organized and productive
            </motion.p>
          </div>
        </GSAPScrollReveal>

        {/* Demo Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Demo Video/Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl overflow-hidden">
              {/* Demo UI Mockup */}
              <div className="absolute inset-4 flex flex-col gap-3">
                {/* Header */}
                <div className="h-8 bg-gray-700 rounded-t-lg flex items-center px-3 gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>

                {/* Task Items */}
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ duration: 0.5, delay: 0.6 + i * 0.2 }}
                    className="h-16 bg-gray-700 rounded-lg flex items-center px-4 gap-3"
                  >
                    <div className="w-5 h-5 rounded border-2 border-coral-500" />
                    <div className="flex-1">
                      <div className="h-3 bg-gray-600 rounded w-3/4 mb-2" />
                      <div className="h-2 bg-gray-600 rounded w-1/2" />
                    </div>
                    <div className="w-16 h-6 bg-coral-500/20 rounded flex items-center justify-center">
                      <div className="w-10 h-2 bg-coral-500 rounded" />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Play Button Overlay */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity hover:bg-black/50"
              >
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <Play className="w-8 h-8 text-coral-600 ml-1" />
                </div>
              </motion.button>
            </div>

            {/* Decorative elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-6 -right-6 w-24 h-24 bg-coral-100 rounded-2xl -z-10"
            />
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -left-6 w-32 h-32 bg-blue-100 rounded-full -z-10"
            />
          </motion.div>

          {/* Demo Steps */}
          <div className="space-y-6">
            {demoSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: 50 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.15 }}
                  whileHover={{ x: 10 }}
                  className="group"
                >
                  <Card className="border-l-4 border-l-transparent hover:border-l-coral-500 transition-all hover:shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                            step.color
                          )}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </motion.div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {step.title}
                          </h3>
                          <p className="text-gray-600">
                            {step.description}
                          </p>
                        </div>
                        <motion.div
                          initial={false}
                          animate={isInView ? { x: [0, 5, 0] } : {}}
                          transition={{ duration: 0.5, delay: 1 + index * 0.2 }}
                        >
                          <Maximize2 className="w-5 h-5 text-gray-400" />
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mt-16 text-center"
        >
          <Button
            size="lg"
            className="bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700"
          >
            Try It Yourself - It's Free
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

/**
 * DemoCard - Individual demo step card
 */
export interface DemoCardProps {
  step: number;
  title: string;
  description: string;
  icon: React.ElementType;
  isActive?: boolean;
}

export function DemoCard({
  step,
  title,
  description,
  icon: Icon,
  isActive = false,
}: DemoCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={cn(
        "p-6 rounded-xl border-2 transition-all",
        isActive
          ? "border-coral-500 bg-coral-50 shadow-lg"
          : "border-gray-200 hover:border-coral-300"
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
            isActive ? "bg-coral-500" : "bg-gray-200"
          )}
        >
          <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-gray-600")} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-gray-500">
              Step {step}
            </span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}
