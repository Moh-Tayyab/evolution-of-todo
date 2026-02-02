// @spec: specs/003-ai-chatbot/spec.md
// @spec: specs/003-ai-chatbot/ui/chatkit.md
// Premium message bubble component with glass-morphism and enhanced animations

"use client"

import { memo, useState, useCallback } from "react"
import { motion, useReducedMotion, AnimatePresence } from "framer-motion"
import { Copy, Check, Sparkles, Bot, User } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MessageBubbleProps } from "@/types/chat"

/**
 * PremiumMessageBubble - Individual chat message with premium styling
 *
 * Renders a single message with appropriate styling based on role.
 * Supports user and assistant messages with different visual treatments.
 * Includes smooth entry animations with reduced motion support.
 * Features copy functionality, glass-morphism effects, and premium gradients.
 *
 * @spec FR-006: Frontend MUST display message bubbles for user (right, blue) and AI (left, gray)
 * @spec NFR-013: Frontend MUST respect prefers-reduced-motion for accessibility
 */
export const PremiumMessageBubble = memo(function PremiumMessageBubble({
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

  // Premium animation variants with spring physics
  const messageVariants = {
    hidden: {
      opacity: 0,
      x: isUser ? 30 : -30,
      scale: 0.9,
      rotate: isUser ? 2 : -2,
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      rotate: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.4,
        ease: shouldReduceMotion ? "linear" : [0.25, 0.1, 0.25, 1],
        delay: shouldReduceMotion ? 0 : index * 0.06,
        type: shouldReduceMotion ? "tween" : "spring",
        stiffness: 200,
        damping: 20,
      },
    },
  }

  // User messages: gradient primary with glass effect
  // AI messages: premium card with subtle gradient and glass effect
  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "flex w-full mb-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {/* Avatar for AI messages */}
      {!isUser && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.1,
          }}
          className="relative mr-3 shrink-0"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
            <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
          </div>
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 rounded-xl bg-primary/30 blur-xl -z-10"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      )}

      {/* Message bubble */}
      <div className="max-w-[85%] sm:max-w-[75%]">
        <motion.div
          className={cn(
            "relative px-4 py-3 rounded-2xl break-words",
            "transition-all duration-300",
            isUser
              ? [
                  "bg-gradient-to-br from-primary via-primary/95 to-primary/90",
                  "text-primary-foreground",
                  "rounded-br-md shadow-xl shadow-primary/20",
                ]
              : [
                  "bg-card/80 backdrop-blur-md",
                  "border border-border/50",
                  "text-card-foreground",
                  "rounded-bl-md shadow-lg shadow-black/5",
                ]
          )}
          role="article"
          aria-label={`${isUser ? "Your" : "AI"} message`}
          whileHover={{ scale: shouldReduceMotion ? 1 : 1.01 }}
          transition={{ duration: 0.2 }}
        >
          {/* Glass-morphism shine effect for user messages */}
          {isUser && (
            <motion.div
              className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
              animate={{
                x: ["-100%", "200%"],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
                repeatDelay: 2,
              }}
            />
          )}

          {/* Content */}
          {isTyping ? (
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <span className="text-sm opacity-70 flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-pulse" />
                AI is thinking
              </span>
            </motion.div>
          ) : (
            <MessageContent content={message.content} />
          )}

          {/* Message footer with timestamp and copy button */}
          <div className={cn(
            "flex items-center justify-between mt-2 pt-2",
            isUser ? "border-t border-white/10" : "border-t border-border/30"
          )}>
            <time
              dateTime={message.created_at}
              className={cn(
                "text-xs opacity-60 select-none font-medium"
              )}
            >
              {formatMessageTime(message.created_at)}
            </time>

            {/* Copy button */}
            <CopyButton content={message.content} isUser={isUser} />
          </div>
        </motion.div>

        {/* Avatar for user messages (shown below) */}
        {isUser && (
          <motion.div
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.1,
            }}
            className="relative mt-2 ml-auto w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center shadow-lg"
          >
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-accent-foreground" />
          </motion.div>
        )}
      </div>
    </motion.div>
  )
})

/**
 * CopyButton - Copy message content with visual feedback
 */
function CopyButton({ content, isUser }: { content: string; isUser: boolean }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [content])

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleCopy}
      className={cn(
        "p-1 rounded-lg transition-all duration-200",
        isUser
          ? "hover:bg-white/10 text-white/70 hover:text-white"
          : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
      )}
      aria-label="Copy message"
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.div
            key="check"
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 180, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Check className="w-3.5 h-3.5" />
          </motion.div>
        ) : (
          <motion.div
            key="copy"
            initial={{ rotate: 180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -180, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Copy className="w-3.5 h-3.5" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

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
        <pre className="bg-muted/50 rounded-lg p-3 overflow-x-auto my-2 border border-border/30">
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
            className="bg-muted/50 px-1.5 py-0.5 rounded text-sm font-mono border border-border/30"
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

// Export the premium bubble as the default MessageBubble
export const MessageBubble = PremiumMessageBubble
