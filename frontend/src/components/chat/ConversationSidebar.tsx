// @spec: specs/003-ai-chatbot/spec.md
// @spec: specs/003-ai-chatbot/ui/chatkit.md
// Premium conversation sidebar with glass-morphism design and enhanced animations

"use client"

import { memo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, Plus, Trash2, Clock, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { ConversationSidebarProps } from "@/types/chat"

/**
 * PremiumConversationSidebar - Sidebar with glass-morphism design
 *
 * Features:
 * - Premium glass-morphism design with subtle gradients
 * - Smooth animations for all interactions
 * - Enhanced empty state with premium styling
 * - Loading state with skeleton animations
 * - Active conversation highlighting with glow effect
 * - Hover effects with smooth transitions
 *
 * @spec FR-027: System MUST allow switching between conversations
 */
export const PremiumConversationSidebar = memo(function PremiumConversationSidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewChat,
  isLoading = false,
  isOpen = true,
  onToggle
}: ConversationSidebarProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Sort conversations by updated_at (most recent first)
  const sortedConversations = [...conversations].sort((a, b) => {
    const aDate = new Date(b.updated_at || b.created_at)
    const bDate = new Date(a.updated_at || a.created_at)
    return aDate.getTime() - bDate.getTime()
  })

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation() // Prevent selecting the conversation
    setDeleteId(id)
    // Parent component handles the actual deletion
    const event = new CustomEvent("deleteConversation", { detail: id })
    window.dispatchEvent(event)
  }

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={onToggle}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isOpen ? 0 : -280,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        className={cn(
          "fixed lg:relative inset-y-0 left-0 z-50",
          "w-72 bg-gradient-to-b from-card via-card/95 to-card/90 backdrop-blur-md",
          "border-r border-border/50 flex flex-col",
          "shadow-xl lg:shadow-none"
        )}
        aria-label="Conversation history"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border/30">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20">
              <MessageSquare className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-semibold text-foreground">Chats</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNewChat}
            className="lg:hidden hover:bg-primary/10"
            aria-label="Close sidebar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </Button>
        </div>

        {/* New chat button */}
        <div className="p-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNewChat}
            className={cn(
              "w-full flex items-center justify-center gap-2",
              "px-4 py-3 rounded-xl",
              "bg-gradient-to-r from-primary via-primary/95 to-primary/90",
              "text-primary-foreground font-medium",
              "shadow-lg shadow-primary/20",
              "hover:shadow-xl hover:shadow-primary/30",
              "transition-all duration-300"
            )}
          >
            <Plus className="w-4 h-4" />
            New Chat
            <Sparkles className="w-3.5 h-3.5 opacity-70" />
          </motion.button>
        </div>

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto px-3">
          {isLoading ? (
            <PremiumLoadingState />
          ) : sortedConversations.length === 0 ? (
            <PremiumEmptyState onNewChat={onNewChat} />
          ) : (
            <ul className="space-y-1.5" role="listbox">
              <AnimatePresence mode="popLayout">
                {sortedConversations.map((conversation) => (
                  <PremiumConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    isActive={conversation.id === currentConversationId}
                    isDeleting={deleteId === conversation.id}
                    onSelect={() => onSelectConversation(conversation.id)}
                    onDelete={(e) => handleDelete(e, conversation.id)}
                  />
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/30">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{conversations.length} chat{conversations.length !== 1 ? "s" : ""}</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Synced
            </span>
          </div>
        </div>
      </motion.aside>
    </>
  )
})

/**
 * PremiumConversationItem - Individual conversation with premium styling
 */
function PremiumConversationItem({
  conversation,
  isActive,
  isDeleting,
  onSelect,
  onDelete
}: {
  conversation: {
    id: string
    title: string
    created_at: string
    updated_at: string | null
    message_count?: number
  }
  isActive: boolean
  isDeleting: boolean
  onSelect: () => void
  onDelete: (e: React.MouseEvent) => void
}) {
  const date = new Date(conversation.updated_at || conversation.created_at)
  const timeAgo = formatTimeAgo(date)

  return (
    <li>
      <motion.button
        layout
        onClick={onSelect}
        disabled={isDeleting}
        className={cn(
          "w-full flex items-start gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200",
          "group relative overflow-hidden",
          isActive
            ? "bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border border-primary/30 shadow-md"
            : "hover:bg-accent/50 border border-transparent",
          isDeleting && "opacity-50"
        )}
        role="option"
        aria-selected={isActive}
        whileHover={{ x: isActive ? 0 : 4 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Icon with glow for active state */}
        <div className={cn(
          "mt-0.5 h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
          isActive
            ? "bg-gradient-to-br from-primary to-primary/70 shadow-md shadow-primary/20"
            : "bg-muted/50 group-hover:bg-muted"
        )}>
          {isActive ? (
            <MessageSquare className="w-4 h-4 text-primary-foreground" />
          ) : (
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 py-0.5">
          <p className={cn(
            "text-sm font-medium truncate transition-colors",
            isActive ? "text-primary" : "text-foreground group-hover:text-foreground"
          )}>
            {conversation.title || "New Conversation"}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
            <Clock className="w-3 h-3" />
            <span>{timeAgo}</span>
            {conversation.message_count !== undefined && (
              <>
                <span className="w-1 h-1 bg-border rounded-full" />
                <span>{conversation.message_count} msg{conversation.message_count !== 1 ? "s" : ""}</span>
              </>
            )}
          </div>
        </div>

        {/* Delete button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onDelete}
          className={cn(
            "opacity-0 group-hover:opacity-100",
            "p-1.5 rounded-lg",
            "hover:bg-destructive/20 hover:text-destructive",
            "transition-all"
          )}
          aria-label={`Delete ${conversation.title || "conversation"}`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </motion.button>
      </motion.button>
    </li>
  )
}

/**
 * PremiumLoadingState - Enhanced skeleton loading state
 */
function PremiumLoadingState() {
  return (
    <div className="space-y-2 p-2">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="h-16 bg-muted/30 rounded-xl border border-border/30 animate-pulse"
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

/**
 * PremiumEmptyState - Enhanced empty conversations state
 */
function PremiumEmptyState({ onNewChat }: { onNewChat: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center h-full px-4 text-center py-8"
    >
      <div className="relative mb-4">
        <motion.div
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center"
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <MessageSquare className="w-8 h-8 text-muted-foreground" />
        </motion.div>
        <motion.div
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/30 to-secondary/30 blur-xl"
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
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        No conversations yet
      </p>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onNewChat}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg",
          "bg-gradient-to-r from-primary/10 to-secondary/10",
          "border border-primary/20",
          "text-primary text-sm font-medium",
          "hover:border-primary/30 hover:from-primary/15",
          "transition-all duration-200"
        )}
      >
        <Plus className="w-4 h-4" />
        Start your first chat
      </motion.button>
    </motion.div>
  )
}

/**
 * Format date as relative time with premium styling
 */
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric"
  })
}

// Export the premium sidebar as the default ConversationSidebar
export const ConversationSidebar = PremiumConversationSidebar
