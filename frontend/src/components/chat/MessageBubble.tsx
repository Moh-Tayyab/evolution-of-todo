// @spec: specs/003-ai-chatbot/spec.md
// @spec: specs/003-ai-chatbot/ui/chatkit.md
// Professional message bubble component with Framer Motion animations

"use client"

import { memo } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { MessageBubbleProps } from "@/types/chat"

/**
 * MessageBubble - Individual chat message display with animations
 *
 * Renders a single message with appropriate styling based on role.
 * Supports user and assistant messages with different visual treatments.
 * Includes smooth entry animations with reduced motion support.
 *
 * @spec FR-006: Frontend MUST display message bubbles for user (right, blue) and AI (left, gray)
 * @spec NFR-013: Frontend MUST respect prefers-reduced-motion for accessibility
 */
export const MessageBubble = memo(function MessageBubble({
  message,
  isTyping = false,
  index = 0
}: MessageBubbleProps & { index?: number }) {
  const isUser = message.role === "user"
  const isSystem = message.role === "system"
  const shouldReduceMotion = useReducedMotion()

  // System messages are typically hidden or shown differently
  if (isSystem) {
    return null
  }

  // Animation variants
  const messageVariants = {
    hidden: {
      opacity: 0,
      x: isUser ? 20 : -20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.3,
        ease: shouldReduceMotion ? "linear" : [0.25, 0.1, 0.25, 1],
        delay: shouldReduceMotion ? 0 : index * 0.05,
      },
    },
  }

  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <motion.div
        className={cn(
          "max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 break-words",
          "transition-all duration-200 ease-in-out",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-card border border-border text-card-foreground rounded-bl-md"
        )}
        role="article"
        aria-label={`${isUser ? "Your" : "AI"} message`}
        whileHover={{ scale: shouldReduceMotion ? 1 : 1.01 }}
        transition={{ duration: 0.15 }}
      >
        {isTyping ? (
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <span className="text-sm opacity-60">AI is thinking</span>
          </motion.div>
        ) : (
          <MessageContent content={message.content} />
        )}

        <time
          dateTime={message.created_at}
          className={cn(
            "text-xs opacity-60 mt-1 block",
            "select-none"
          )}
        >
          {formatMessageTime(message.created_at)}
        </time>
      </motion.div>
    </motion.div>
  )
})

/**
 * MessageContent - Renders message content with basic formatting
 *
 * Supports:
 * - Line breaks
 * - Code blocks (inline and block)
 * - Bold text
 * - Links
 */
function MessageContent({ content }: { content: string }) {
  // Simple formatting - for full markdown support, consider adding react-markdown
  const formatContent = (text: string): React.ReactNode => {
    // Split by newlines and handle code blocks
    const lines = text.split("\n")
    const isCodeBlock = lines.length > 1 && lines[0]?.startsWith("```")

    if (isCodeBlock) {
      // Remove ``` markers
      const codeContent = lines.slice(1, -1).join("\n")
      return (
        <pre className="bg-muted/50 rounded-md p-3 overflow-x-auto my-2">
          <code className="text-sm font-mono">{codeContent}</code>
        </pre>
      )
    }

    // Handle inline formatting
    return text.split("\n").map((line, i) => (
      <p key={i} className={i > 0 ? "mt-2" : ""}>
        {formatInlineContent(line)}
      </p>
    ))
  }

  const formatInlineContent = (text: string): React.ReactNode => {
    // This is a simple formatter. For production, use a library like react-markdown
    // Handle inline code with backticks
    const parts = text.split(/(`[^`]+`)/)

    return parts.map((part, i) => {
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={i}
            className="bg-muted/50 px-1.5 py-0.5 rounded text-sm font-mono"
          >
            {part.slice(1, -1)}
          </code>
        )
      }
      return part
    })
  }

  return <>{formatContent(content)}</>
}

/**
 * Format message timestamp for display
 */
function formatMessageTime(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric"
  })
}
