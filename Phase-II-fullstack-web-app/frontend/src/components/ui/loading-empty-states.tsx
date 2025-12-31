// @spec: specs/003-modern-ui-ux/spec.md
// @spec: specs/003-modern-ui-ux/plan.md
// Loading and empty state components for Phase III

"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

const shimmerKeyframes = {
  "0%": { backgroundPosition: "-200% 0" },
  "100%": { backgroundPosition: "200% 0" },
};

export function TaskCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100 overflow-hidden relative">
      <div className="flex items-start gap-4 animate-pulse">
        {/* Checkbox skeleton */}
        <div className="w-5 h-5 rounded bg-zinc-200 mt-1" />

        <div className="flex-1 space-y-3">
          {/* Title skeleton */}
          <div className="h-5 rounded bg-zinc-200 w-3/4" />

          {/* Description skeleton */}
          <div className="space-y-2">
            <div className="h-4 rounded bg-zinc-100 w-full" />
            <div className="h-4 rounded bg-zinc-100 w-1/2" />
          </div>

          {/* Tags skeleton */}
          <div className="flex gap-2 pt-2">
            <div className="h-6 rounded-full bg-zinc-100 w-16" />
            <div className="h-6 rounded-full bg-zinc-100 w-20" />
          </div>
        </div>
      </div>

      {/* Shimmer effect overlay */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0) 100%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 2s infinite linear"
        }}
      />
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}

export function LoadingSpinner({
  size = "default",
  className,
}: {
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    default: "h-6 w-6 border-2",
    lg: "h-10 w-10 border-3",
  };

  return (
    <motion.div
      className={cn(
        "border-primary-500 border-t-transparent rounded-full",
        sizeClasses[size],
        className
      )}
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
    />
  );
}

const emptyStateVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.15,
      ease: "easeOut",
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function EmptyState({
  title = "No tasks yet",
  description = "Get started by creating your first task.",
  actionLabel = "Create task",
  onAction,
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <motion.div
      variants={emptyStateVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <motion.div
        variants={itemVariants}
        className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-6"
      >
        <Search className="h-10 w-10 text-primary-500" />
      </motion.div>
      <motion.h3 variants={itemVariants} className="text-xl font-semibold text-zinc-900 mb-2">
        {title}
      </motion.h3>
      <motion.p variants={itemVariants} className="text-zinc-500 max-w-xs mx-auto mb-8">
        {description}
      </motion.p>
      {onAction && (
        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
          className="px-6 py-3 bg-primary-500 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-colors"
        >
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
}
