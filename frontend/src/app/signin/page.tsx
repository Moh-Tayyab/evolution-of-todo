// @spec: specs/002-fullstack-web-app/spec.md
// @spec: specs/002-fullstack-web-app/plan.md
// Premium Sign in page with luxury glass morphism design

"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Target, Sparkles, Zap, ArrowRight } from "lucide-react";
import SignInForm from "@/components/auth/SignInForm";

export default function SignInPage() {
  const prefersReducedMotion = useReducedMotion();

  // Premium animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.15,
      },
    },
  };

  const brandVariants = {
    hidden: { opacity: 0, x: -50, scale: 0.95 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  const formVariants = {
    hidden: { opacity: 0, x: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: 0.2,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  const floatVariants = {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const glowVariants = {
    animate: {
      opacity: [0.3, 0.6, 0.3],
      scale: [1, 1.05, 1],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const adjustedContainerVariants = prefersReducedMotion
    ? { hidden: {}, visible: {} }
    : containerVariants;

  const adjustedBrandVariants = prefersReducedMotion
    ? { hidden: {}, visible: {} }
    : brandVariants;

  const adjustedFormVariants = prefersReducedMotion
    ? { hidden: {}, visible: {} }
    : formVariants;

  return (
    <motion.div
      className="min-h-screen flex relative overflow-hidden bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-pink-950"
      variants={adjustedContainerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Premium animated background orbs */}
      {!prefersReducedMotion && (
        <>
          <motion.div
            className="absolute top-20 left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
            {...glowVariants}
          />
          <motion.div
            className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"
            animate={{
              ...glowVariants.animate,
              transition: { ...glowVariants.animate.transition, delay: 1.5 },
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
              transition: {
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
          />
        </>
      )}

      {/* Brand Side */}
      <motion.div
        className="hidden lg:flex w-1/2 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 items-center justify-center p-12 relative overflow-hidden"
        variants={adjustedBrandVariants}
      >
        {/* Premium animated background pattern */}
        <motion.div
          className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"
          style={{ backgroundSize: "200% 200%" }}
          animate={
            !prefersReducedMotion
              ? {
                  backgroundPosition: ["0% 0%", "200% 200%", "0% 0%"],
                }
              : {}
          }
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Animated decorative gradient orbs */}
        {!prefersReducedMotion && (
          <>
            <motion.div
              className="absolute top-32 right-32 w-72 h-72 bg-white/10 rounded-full backdrop-blur-sm"
              animate={{
                x: [0, 40, 0],
                y: [0, -40, 0],
                scale: [1, 1.15, 1],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute bottom-32 left-32 w-56 h-56 bg-pink-300/20 rounded-full backdrop-blur-sm"
              animate={{
                x: [0, -30, 0],
                y: [0, 30, 0],
                scale: [1, 1.25, 1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute top-1/2 left-1/3 w-40 h-40 bg-violet-300/20 rounded-full backdrop-blur-sm"
              {...floatVariants}
            />
          </>
        )}

        {/* Content */}
        <motion.div
          className="relative z-10 text-white max-w-lg"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {/* Floating logo */}
          <motion.div
            className="mb-8 inline-flex"
            {...floatVariants}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-premium-xl">
              <Target className="w-12 h-12" />
            </div>
          </motion.div>

          <motion.h1
            className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-white bg-300% animate-gradient"
            style={{ backgroundSize: "200% auto" }}
            animate={
              !prefersReducedMotion
                ? {
                    backgroundPosition: ["0% center", "200% center", "0% center"],
                  }
                : {}
            }
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          >
            Welcome Back
          </motion.h1>

          <motion.p
            className="text-xl text-purple-100 mb-8 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            Organize your life with elegance. Access your tasks and boost productivity.
          </motion.p>

          {/* Premium feature highlights */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            {[
              { icon: Sparkles, text: "Premium task management" },
              { icon: Zap, text: "Lightning-fast performance" },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 1 + index * 0.1 }}
                whileHover={{ x: 5, backgroundColor: "rgba(255,255,255,0.15)" }}
              >
                <feature.icon className="w-5 h-5 text-purple-200" />
                <span className="text-sm font-medium">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Form Side */}
      <motion.div
        className="w-full lg:w-1/2 flex items-center justify-center p-8 relative"
        variants={adjustedFormVariants}
      >
        {/* Premium glass card */}
        <motion.div
          className="w-full max-w-md relative"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {/* Glass morphism effect with gradient border */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/60 dark:from-slate-800/80 dark:to-slate-900/60 backdrop-blur-2xl rounded-3xl shadow-premium-xl border border-white/30 dark:border-white/10" />

          {/* Animated gradient border */}
          {!prefersReducedMotion && (
            <motion.div
              className="absolute inset-0 rounded-3xl bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 opacity-20 blur-xl"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              style={{ backgroundSize: "200% 100%" }}
            />
          )}

          <div className="relative z-10 p-10">
            {/* Header */}
            <motion.div
              className="text-center mb-10"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              {/* Floating icon */}
              <motion.div
                className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 mb-6 shadow-premium-lg"
                {...floatVariants}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Target className="w-6 h-6 text-white" />
              </motion.div>

              <motion.h2
                className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-300% animate-gradient"
                style={{ backgroundSize: "200% auto" }}
                animate={
                  !prefersReducedMotion
                    ? {
                        backgroundPosition: ["0% center", "200% center", "0% center"],
                      }
                    : {}
                }
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              >
                Sign In
              </motion.h2>

              <p className="text-sm text-slate-600 dark:text-slate-400">
                Don't have an account?{" "}
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block"
                >
                  <Link
                    href="/signup"
                    className="text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text font-semibold hover:underline decoration-2 underline-offset-2 inline-flex items-center gap-1 group"
                  >
                    Create account
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.span>
              </p>
            </motion.div>

            {/* Form */}
            <SignInForm />
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
