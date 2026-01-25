// @spec: specs/003-ai-chatbot/spec.md
// @spec: specs/003-ai-chatbot/ui/chatkit.md
// Optimized message list component with Framer Motion animations

"use client"

import { memo, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { MessageBubble } from "./MessageBubble"
import { TypingIndicator } from "./TypingIndicator"
import type { MessageListProps } from "@/types/chat"

/**
 * MessageList - Optimized list of chat messages
 *
 * Displays all messages in a conversation with auto-scrolling.
 * Supports smooth scrolling to new messages and maintains scroll position.
 * Uses React.memo for performance optimization.
 *
 * Features:
 * - Auto-scroll to bottom on new messages
 * - Smooth scroll behavior
 * - Maintains scroll position when loading history
 * - Empty state with welcome message
 *
 * @spec FR-006: Frontend MUST display message bubbles for user (right, blue) and AI (left, gray)
 * @spec FR-007: Frontend MUST show typing indicators during AI processing
 */
export const MessageList = memo(function MessageList({
  messages,
  isTyping,
  messagesEndRef
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const prevMessagesLengthRef = useRef(0)
  const shouldAutoScrollRef = useRef(true)

  // Track scroll position to determine if user is manually scrolling
  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight
      // User is manually scrolling if more than 100px from bottom
      shouldAutoScrollRef.current = distanceFromBottom < 100
    }

    scrollContainer.addEventListener("scroll", handleScroll, { passive: true })
    return () => scrollContainer.removeEventListener("scroll", handleScroll)
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const messagesLength = messages.length
    const hasNewMessages = messagesLength > prevMessagesLengthRef.current

    if (hasNewMessages && shouldAutoScrollRef.current) {
      // Small delay to ensure DOM has updated
      requestAnimationFrame(() => {
        messagesEndRef?.current?.scrollIntoView({ behavior: "smooth" })
      })
    }

    prevMessagesLengthRef.current = messagesLength
  }, [messages, messagesEndRef])

  // Empty state when no messages
  if (messages.length === 0) {
    return <EmptyState />
  }

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-4 py-6"
      role="log"
      aria-live="polite"
      aria-label="Chat messages"
    >
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
        <AnimatePresence mode="popLayout">
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id || `message-${index}`}
              message={message}
              index={index}
            />
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
              <TypingIndicator size="md" />
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} aria-hidden="true" />
      </div>
    </div>
  )
})

/**
 * EmptyState - Welcome message when no messages exist with animations
 *
 * Shows a friendly greeting with example prompts to guide users.
 * Uses Framer Motion for smooth entrance animations.
 */
function EmptyState() {
  const examplePrompts = [
    { text: "Add buy milk tomorrow", category: "Create Task" },
    { text: "Show my tasks", category: "View Tasks" },
    { text: "Mark task 1 as done", category: "Complete Task" },
    { text: "Delete meeting task", category: "Delete Task" }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex-1 flex items-center justify-center px-4"
    >
      <div className="max-w-md w-full text-center space-y-6">
        {/* Logo/avatar with animated entrance */}
        <motion.div variants={itemVariants} className="flex justify-center">
          <div className="relative">
            <motion.div
              className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg"
              animate={{
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatDelay: 2,
                ease: "easeInOut",
              }}
            >
              <span className="text-3xl sm:text-4xl" role="img" aria-label="Robot">
                🤖
              </span>
            </motion.div>
            {/* Decorative rings */}
            <motion.div
              className="absolute -inset-2 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl -z-10"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </motion.div>

        {/* Welcome message */}
        <motion.div variants={itemVariants} className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
            Welcome to Todo Assistant!
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            I can help you manage your tasks using natural language. Try these examples:
          </p>
        </motion.div>

        {/* Example prompts with staggered animations */}
        <motion.div variants={itemVariants} className="grid gap-2 text-left">
          {examplePrompts.map((prompt, index) => (
            <motion.button
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "group flex items-center justify-between",
                "bg-card border border-border rounded-lg px-4 py-3",
                "hover:border-primary/50 hover:bg-accent/5",
                "transition-all duration-200",
                "cursor-pointer"
              )}
              onClick={() => {
                // This would trigger the prompt - parent component handles this
                const event = new CustomEvent("examplePrompt", { detail: prompt.text })
                window.dispatchEvent(event)
              }}
            >
              <span className="text-sm text-foreground font-medium">
                "{prompt.text}"
              </span>
              <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                {prompt.category}
              </span>
            </motion.button>
          ))}
        </motion.div>

        {/* Helper text */}
        <motion.p variants={itemVariants} className="text-xs text-muted-foreground">
          Type your message below or tap an example to get started
        </motion.p>
      </div>
    </motion.div>
  )
}
