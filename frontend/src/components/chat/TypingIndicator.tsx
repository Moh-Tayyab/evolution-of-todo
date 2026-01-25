// @spec: specs/003-ai-chatbot/spec.md
// @spec: specs/003-ai-chatbot/ui/chatkit.md
// Professional typing indicator component for chat interface

"use client"

import { memo } from "react"
import { cn } from "@/lib/utils"
import type { TypingIndicatorProps } from "@/types/chat"

/**
 * TypingIndicator - Professional animated typing indicator
 *
 * Displays bouncing dots to indicate the AI is processing or typing.
 * Supports multiple sizes and respects reduced motion preferences.
 *
 * @spec FR-007: Frontend MUST show typing indicators during AI processing
 */
export const TypingIndicator = memo(function TypingIndicator({
  size = "md"
}: TypingIndicatorProps) {
  const sizeClasses = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-2.5 h-2.5"
  }

  const containerClasses = {
    sm: "gap-1",
    md: "gap-1.5",
    lg: "gap-2"
  }

  return (
    <div
      className={cn(
        "flex items-center",
        containerClasses[size]
      )}
      role="status"
      aria-label="AI is typing"
    >
      <span
        className={cn(
          "rounded-full bg-primary-foreground/60 animate-bounce",
          sizeClasses[size]
        )}
        style={{ animationDelay: "0ms" }}
      />
      <span
        className={cn(
          "rounded-full bg-primary-foreground/60 animate-bounce",
          sizeClasses[size]
        )}
        style={{ animationDelay: "150ms" }}
      />
      <span
        className={cn(
          "rounded-full bg-primary-foreground/60 animate-bounce",
          sizeClasses[size]
        )}
        style={{ animationDelay: "300ms" }}
      />
    </div>
  )
})
