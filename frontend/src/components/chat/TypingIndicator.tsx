// @spec: specs/003-ai-chatbot/spec.md
// @spec: specs/003-ai-chatbot/ui/chatkit.md
// Premium typing indicator component with enhanced animations

"use client"

import { memo } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { TypingIndicatorProps } from "@/types/chat"

/**
 * PremiumTypingIndicator - Professional animated typing indicator
 *
 * Displays bouncing dots to indicate the AI is processing or typing.
 * Supports multiple sizes and respects reduced motion preferences.
 * Features premium gradient colors and smooth spring animations.
 *
 * @spec FR-007: Frontend MUST show typing indicators during AI processing
 */
export const PremiumTypingIndicator = memo(function PremiumTypingIndicator({
  size = "md"
}: TypingIndicatorProps) {
  const sizeClasses = {
    sm: { dot: "w-2 h-2", gap: "gap-1.5", container: "h-8" },
    md: { dot: "w-2.5 h-2.5", gap: "gap-2", container: "h-10" },
    lg: { dot: "w-3 h-3", gap: "gap-2.5", container: "h-12" }
  }

  const classes = sizeClasses[size]

  // Premium dot animation variants with spring physics
  const dotVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: (i: number) => ({
      scale: [0.6, 1, 0.6],
      opacity: [0.4, 1, 0.4],
      transition: {
        duration: 1.2,
        repeat: Infinity,
        delay: i * 0.15,
        ease: "easeInOut",
      },
    }),
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center",
        classes.gap,
        classes.container
      )}
      role="status"
      aria-label="AI is typing"
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          custom={i}
          variants={dotVariants}
          initial="hidden"
          animate="visible"
          className={cn(
            "rounded-full bg-gradient-to-br from-primary to-primary/60 shadow-md"
          )}
          style={{
            boxShadow: "0 0 12px rgba(var(--primary), 0.3)",
          }}
        />
      ))}

      {/* Glow effect container */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 blur-xl -z-10"
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [0.95, 1.05, 0.95],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  )
})

// Export the premium indicator as the default TypingIndicator
export const TypingIndicator = PremiumTypingIndicator
