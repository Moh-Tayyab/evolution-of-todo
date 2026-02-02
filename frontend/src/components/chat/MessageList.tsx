// @spec: specs/003-ai-chatbot/spec.md
// @spec: specs/003-ai-chatbot/ui/chatkit.md
// Premium message list component with enhanced empty state

"use client"

import { memo, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, MessageSquare, Plus, Clock, Target, Trash2, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { MessageBubble } from "./MessageBubble"
import { TypingIndicator } from "./TypingIndicator"
import type { MessageListProps } from "@/types/chat"

/**
 * PremiumMessageList - Enhanced list with premium empty state
 *
 * Displays all messages in a conversation with auto-scrolling.
 * Supports smooth scrolling to new messages and maintains scroll position.
 * Uses React.memo for performance optimization.
 *
 * Features:
 * - Auto-scroll to bottom on new messages
 * - Smooth scroll behavior
 * - Maintains scroll position when loading history
 * - Premium empty state with animated icons and interactive example prompts
 *
 * @spec FR-006: Frontend MUST display message bubbles for user (right, blue) and AI (left, gray)
 * @spec FR-007: Frontend MUST show typing indicators during AI processing
 */
export const PremiumMessageList = memo(function PremiumMessageList({
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

  // Empty state when no messages - Premium version
  if (messages.length === 0) {
    return <PremiumEmptyState />
  }

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 bg-gradient-to-b from-background to-background/50"
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
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex justify-start"
          >
            <div className="bg-card/80 backdrop-blur-md border border-border/50 rounded-2xl rounded-bl-md px-4 py-3 shadow-lg">
              <TypingIndicator size="md" />
            </div>
          </motion.div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} aria-hidden="true" />
      </div>
    </div>
  )
})

/**
 * PremiumEmptyState - Enhanced welcome message with glass-morphism and premium animations
 *
 * Shows a friendly greeting with interactive example prompts.
 * Uses Framer Motion for smooth entrance animations.
 */
function PremiumEmptyState() {
  const examplePrompts = [
    { text: "Add task: Buy groceries tomorrow", category: "Create Task", icon: Plus },
    { text: "Show my high priority tasks", category: "View Tasks", icon: Target },
    { text: "Mark task 1 as completed", category: "Complete Task", icon: Check },
    { text: "Delete the meeting task", category: "Delete Task", icon: Trash2 },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
        duration: 0.5,
      },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex-1 flex items-center justify-center px-4 bg-gradient-to-b from-background via-background/95 to-background/90"
    >
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Premium animated logo */}
        <motion.div variants={itemVariants} className="flex justify-center relative">
          {/* Animated rings */}
          <motion.div
            className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/30 via-primary/20 to-secondary/30 blur-2xl"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <motion.div
            className="absolute inset-0 rounded-3xl bg-gradient-to-br from-secondary/20 via-secondary/10 to-primary/20 blur-xl"
            animate={{
              scale: [1.1, 1.3, 1.1],
              rotate: [360, 180, 0],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          />

          {/* Main logo */}
          <motion.div
            className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary via-primary/90 to-secondary rounded-3xl flex items-center justify-center shadow-2xl"
            animate={{
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatDelay: 2,
              ease: "easeInOut",
            }}
            whileHover={{ scale: 1.05, rotate: 0 }}
          >
            <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 text-primary-foreground" />

            {/* Sparkle accent */}
            <motion.div
              className="absolute -top-1 -right-1"
              animate={{
                rotate: [0, 360],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <Sparkles className="w-5 h-5 text-yellow-300 fill-yellow-300" />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Welcome message */}
        <motion.div variants={itemVariants} className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
            Welcome to AI Task Assistant
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Manage your tasks using natural language. I can help you create, view, complete, and delete tasks with simple commands.
          </p>
        </motion.div>

        {/* Premium stats badges */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center gap-4 flex-wrap"
        >
          {[
            { icon: MessageSquare, label: "Smart Chat", color: "text-primary" },
            { icon: Target, label: "Task Focus", color: "text-secondary" },
            { icon: Sparkles, label: "AI Powered", color: "text-accent" },
          ].map((badge, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card/50 backdrop-blur border border-border/50 shadow-md"
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <badge.icon className={cn("w-4 h-4", badge.color)} />
              <span className="text-xs font-medium text-foreground">{badge.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Example prompts with enhanced interactions */}
        <motion.div variants={itemVariants} className="space-y-3 text-left">
          <p className="text-sm text-muted-foreground text-center mb-4">
            Try these example commands:
          </p>
          <div className="space-y-2">
            {examplePrompts.map((prompt, index) => (
              <motion.button
                key={index}
                variants={itemVariants}
                whileHover={{ x: 8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "group flex items-center justify-between w-full",
                  "bg-card/60 backdrop-blur-md border border-border/50 rounded-xl px-4 py-4",
                  "hover:border-primary/50 hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent",
                  "hover:shadow-lg hover:shadow-primary/10",
                  "transition-all duration-300",
                  "cursor-pointer"
                )}
                onClick={() => {
                  const event = new CustomEvent("examplePrompt", { detail: prompt.text })
                  window.dispatchEvent(event)
                }}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <prompt.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm text-foreground font-medium truncate">
                    {prompt.text}
                  </span>
                </div>
                <span className={cn(
                  "text-xs px-2.5 py-1 rounded-full font-medium",
                  "bg-muted/50 group-hover:bg-primary/10",
                  "text-muted-foreground group-hover:text-primary",
                  "transition-colors whitespace-nowrap"
                )}>
                  {prompt.category}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Premium helper text */}
        <motion.p
          variants={itemVariants}
          className="text-xs text-muted-foreground flex items-center justify-center gap-2"
        >
          <Sparkles className="w-3 h-3" />
          Type a message or tap an example to get started
          <Sparkles className="w-3 h-3" />
        </motion.p>
      </div>
    </motion.div>
  )
}

// Export the premium list as the default MessageList
export const MessageList = PremiumMessageList
