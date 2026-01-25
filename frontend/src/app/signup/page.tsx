// @spec: specs/002-fullstack-web-app/spec.md
// @spec: specs/002-fullstack-web-app/plan.md
// Sign up page

"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import SignUpForm from "@/components/auth/SignUpForm";

export default function SignUpPage() {
  const prefersReducedMotion = useReducedMotion();

  const handleSuccess = () => {
    window.location.href = "/dashboard";
  };

  const handleError = (error: string) => {
    // You might want to use a toast here instead of alert in production
    alert(`Error: ${error}`);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.2,
      },
    },
  };

  const brandVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.7,
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
        duration: 0.5,
        delay: 0.2,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  const blobVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 0.1,
      transition: {
        duration: 1.5,
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

  const adjustedBlobVariants = prefersReducedMotion
    ? { hidden: {}, visible: {} }
    : blobVariants;

  return (
    <motion.div
      className="min-h-screen flex"
      variants={adjustedContainerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Brand Side */}
      <motion.div
        className="hidden lg:flex w-1/2 bg-gradient-to-br from-purple-500 to-pink-600 items-center justify-center p-12 relative overflow-hidden"
        variants={adjustedBrandVariants}
      >
        {/* Animated Background pattern */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"
          style={{ backgroundSize: "200% 200%" }}
          variants={adjustedBlobVariants}
          animate={prefersReducedMotion ? {} : {
            backgroundPosition: ["0% 0%", "200% 200%", "0% 0%"],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Animated decorative blobs */}
        {!prefersReducedMotion && (
          <>
            <motion.div
              className="absolute top-20 right-20 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl"
              animate={{
                x: [0, 30, 0],
                y: [0, -30, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute bottom-20 left-20 w-48 h-48 bg-pink-300 rounded-full mix-blend-overlay filter blur-3xl"
              animate={{
                x: [0, -20, 0],
                y: [0, 20, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </>
        )}

        <motion.div
          className="relative z-10 text-white max-w-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <motion.h1
            className="text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            Join Us
          </motion.h1>
          <motion.p
            className="text-xl text-purple-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            Create an account and start managing your tasks with clarity and style.
          </motion.p>
        </motion.div>
      </motion.div>

      {/* Form Side */}
      <motion.div
        className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-900"
        variants={adjustedFormVariants}
      >
        <div className="w-full max-w-md">
          <motion.div
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={!prefersReducedMotion ? { boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" } : {}}
          >
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <motion.h2
                className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600"
                animate={
                  !prefersReducedMotion
                    ? {
                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                      }
                    : {}
                }
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  backgroundSize: "200% 200%",
                }}
              >
                Create Account
              </motion.h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/signin"
                    className="text-purple-600 hover:text-purple-700 font-semibold hover:underline transition-all"
                  >
                    Sign in
                  </Link>
                </motion.span>
              </p>
            </motion.div>
            <SignUpForm onSuccess={handleSuccess} onError={handleError} />
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
