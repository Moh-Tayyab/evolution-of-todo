// @spec: specs/003-ai-chatbot/spec.md
// @spec: specs/003-ai-chatbot/ui/chatkit.md
// Conversation sidebar with history management

"use client"

import { memo, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { ConversationSidebarProps } from "@/types/chat"

/**
 * ConversationSidebar - Sidebar showing conversation history
 *
 * Features:
 * - List of all conversations with titles
 * - Active conversation highlighting
 * - New chat button
 * - Mobile responsive (collapsible on mobile)
 * - Delete conversation option
 * - Empty state with helpful message
 *
 * @spec FR-027: System MUST allow switching between conversations
 */
export const ConversationSidebar = memo(function ConversationSidebar({
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
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:relative inset-y-0 left-0 z-50",
          "w-72 bg-card border-r border-border",
          "flex flex-col",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0"
        )}
        aria-label="Conversation history"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Conversations</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNewChat}
            className="lg:hidden"
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
          <Button
            onClick={onNewChat}
            className="w-full"
            variant="default"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
            New Chat
          </Button>
        </div>

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto px-2">
          {isLoading ? (
            <LoadingState />
          ) : sortedConversations.length === 0 ? (
            <EmptyState onNewChat={onNewChat} />
          ) : (
            <ul className="space-y-1" role="listbox">
              {sortedConversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  isActive={conversation.id === currentConversationId}
                  isDeleting={deleteId === conversation.id}
                  onSelect={() => onSelectConversation(conversation.id)}
                  onDelete={(e) => handleDelete(e, conversation.id)}
                />
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
          </p>
        </div>
      </aside>
    </>
  )
})

/**
 * ConversationItem - Individual conversation in the list
 */
function ConversationItem({
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
      <button
        onClick={onSelect}
        disabled={isDeleting}
        className={cn(
          "w-full flex items-start gap-3 px-3 py-3 rounded-lg",
          "text-left transition-colors",
          "group relative",
          isActive
            ? "bg-primary/10 text-primary"
            : "hover:bg-accent hover:text-accent-foreground",
          isDeleting && "opacity-50"
        )}
        role="option"
        aria-selected={isActive}
      >
        {/* Icon */}
        <div className={cn(
          "mt-0.5 h-5 w-5 rounded-md flex items-center justify-center shrink-0",
          isActive ? "bg-primary/20" : "bg-muted"
        )}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn(
              "h-3 w-3",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {conversation.title || "New Conversation"}
          </p>
          <p className="text-xs text-muted-foreground">
            {timeAgo}
            {conversation.message_count !== undefined && (
              <>
                {" · "}{conversation.message_count} message{conversation.message_count !== 1 ? "s" : ""}
              </>
            )}
          </p>
        </div>

        {/* Delete button */}
        <button
          onClick={onDelete}
          className={cn(
            "opacity-0 group-hover:opacity-100",
            "p-1 rounded hover:bg-destructive/20 hover:text-destructive",
            "transition-all"
          )}
          aria-label={`Delete ${conversation.title || "conversation"}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
        </button>
      </button>
    </li>
  )
}

/**
 * LoadingState - Skeleton loading state
 */
function LoadingState() {
  return (
    <div className="space-y-2 p-2">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="h-16 bg-muted/50 rounded-lg animate-pulse"
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

/**
 * EmptyState - Empty conversations state
 */
function EmptyState({ onNewChat }: { onNewChat: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 text-center">
      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6 text-muted-foreground"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        No conversations yet
      </p>
      <Button onClick={onNewChat} variant="outline" size="sm">
        Start your first chat
      </Button>
    </div>
  )
}

/**
 * Format date as relative time
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
