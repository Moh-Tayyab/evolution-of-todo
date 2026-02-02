// @spec: specs/003-ai-chatbot/spec.md
// Professional Floating Chat Button with Enhanced Animations and Full Functionality
// Fixed: Close button, fullscreen toggle, horizontal scroll, voice input

"use client"

import { MessageSquare, X, Minimize2, Maximize2, Sparkles } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { ChatWidget } from "@/components/chat/ChatWidget"
import { useChatContext } from "@/components/chat/chat-context"
import { cn } from "@/lib/utils"
import { getCurrentUserId } from "@/lib/auth"

/**
 * FloatingChatButton - Professional floating action button with full functionality
 *
 * Features:
 * - Pulse animation for attention
 * - Hover effects with glow
 * - Smooth transitions
 * - Professional styling
 * - WORKING close button (X)
 * - WORKING fullscreen/minimize toggle
 * - Integration with AI Dashboard via chat context
 * - Supports initial prompts from Quick Actions
 * - Fixed horizontal scroll issues
 */
export function FloatingChatButton() {
  const [isHovered, setIsHovered] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const { isOpen, initialPrompt, openChat, closeChat } = useChatContext()

  useEffect(() => {
    getCurrentUserId().then(setUserId)
  }, [])

  // Handle close button click
  const handleClose = useCallback(() => {
    closeChat()
    setIsFullscreen(false) // Reset fullscreen when closing
  }, [closeChat])

  // Handle fullscreen toggle
  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev)
  }, [])

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            className="fixed bottom-6 right-6 z-50"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
          >
            {/* Pulse rings for attention */}
            <AnimatePresence>
              <>
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary/20"
                  animate={{
                    scale: [1, 1.5, 1.5],
                    opacity: [0.5, 0, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary/10"
                  animate={{
                    scale: [1, 1.3, 1.3],
                    opacity: [0.8, 0, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut",
                    delay: 0.5,
                  }}
                />
              </>
            </AnimatePresence>

            {/* Main button */}
            <motion.div
              animate={{
                scale: isHovered ? 1.1 : 1,
                rotate: isHovered ? 5 : 0,
              }}
              transition={{ duration: 0.2 }}
            >
              <Button
                onClick={() => openChat()}
                size="lg"
                className={cn(
                  "h-16 w-16 rounded-full shadow-2xl transition-all duration-300 relative overflow-hidden",
                  "bg-gradient-to-br from-primary to-primary/80",
                  "hover:shadow-primary/50 hover:shadow-2xl",
                  "border-2 border-primary/20"
                )}
                aria-label="Open AI chatbot"
              >
                {/* Animated gradient background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{
                    x: ["-100%", "200%"],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />

                {/* Icon */}
                <div className="relative">
                  <MessageSquare className="h-7 w-7 text-primary-foreground" />
                  {/* Sparkle accent */}
                  <motion.div
                    className="absolute -top-1 -right-1"
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Sparkles className="h-3 w-3 text-yellow-300 fill-yellow-300" />
                  </motion.div>
                </div>
              </Button>
            </motion.div>

            {/* Tooltip */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, x: 10, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 10, scale: 0.8 }}
                  className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-2 rounded-lg bg-foreground text-background text-sm font-medium whitespace-nowrap shadow-xl"
                >
                  AI Assistant
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-foreground" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Dialog Modal - Fixed horizontal scroll and added fullscreen toggle */}
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent
          showClose={false}
          className={cn(
            "p-0 gap-0 overflow-hidden",
            // Fixed horizontal scroll with max-width constraints and overflow-x-hidden
            "max-w-[95vw] md:max-w-[90vw] lg:max-w-5xl",
            isFullscreen ? "h-[95vh] w-[95vw] max-w-none" : "h-[85vh]",
            // Ensure no horizontal scroll
            "[overflow-x:hidden]"
          )}
        >
          {/* Premium header with working controls */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-gradient-to-r from-card via-card/95 to-card shrink-0">
            <div className="flex items-center gap-3">
              <motion.div
                className="relative"
                animate={{
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
              >
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                  <MessageSquare className="h-4 w-4 text-primary-foreground" />
                </div>
                <motion.div
                  className="absolute inset-0 rounded-xl bg-primary/30 blur-xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-foreground">AI Task Assistant</h2>
                  <motion.span
                    className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-medium border border-emerald-500/20 flex items-center gap-1"
                    animate={{
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  >
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Online
                  </motion.span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Ask me anything about your tasks
                </p>
              </div>
            </div>

            {/* Action buttons with working handlers */}
            <div className="flex items-center gap-1">
              {/* Fullscreen toggle - NOW WORKING */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleToggleFullscreen}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
                title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                type="button"
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Maximize2 className="h-4 w-4 text-muted-foreground" />
                )}
              </motion.button>

              {/* Close button (X) - NOW WORKING */}
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
                title="Close chat"
                type="button"
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </motion.button>
            </div>
          </div>

          {/* Chat content - Fixed horizontal scroll */}
          <div
            className="overflow-hidden"
            style={{ height: isFullscreen ? 'calc(95vh - 4rem)' : 'calc(85vh - 4rem)' }}
          >
            {userId && (
              <div className="h-full w-full overflow-x-hidden">
                <ChatWidget userId={userId} showSidebar={false} />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
