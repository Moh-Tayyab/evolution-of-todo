// @spec: specs/003-ai-chatbot/ui/chatkit.md
// OpenAI ChatKit component with custom backend integration
// Enhanced with real-time dashboard context for full awareness

"use client"

import { useEffect, useState, Suspense } from "react"
import { useChatKit, ChatKit } from "@openai/chatkit-react"
import { authClient, getToken } from "@/lib/auth"
import { useTaskSync } from "@/components/tasks/task-sync-context"

interface TodoChatKitProps {
  userId: string
  className?: string
}

/**
 * TodoChatKit - OpenAI ChatKit integration with custom FastAPI backend
 *
 * Features:
 * - OpenAI ChatKit UI component for conversational interface
 * - Custom backend integration with FastAPI + OpenAI Agents SDK
 * - Better Auth JWT authentication
 * - Conversation persistence
 * - Streaming responses
 * - Dark mode support
 * - REAL-TIME DASHBOARD CONTEXT - Chatbot knows everything happening!
 *
 * @spec FR-005: Frontend MUST integrate OpenAI ChatKit widget for conversational UI
 * @spec FR-009: Frontend MUST persist conversation_id across browser sessions using localStorage
 */
function TodoChatKitInner({ userId, className }: TodoChatKitProps) {
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Get real-time dashboard context
  const { getChatContext, snapshot } = useTaskSync()

  // Get API URL from environment
  const chatkitApiUrl = process.env.NEXT_PUBLIC_CHATKIT_API_URL ||
    (typeof window !== "undefined" ? `${window.location.protocol}//${window.location.hostname}:8000/api/chatkit` : "")

  const { control } = useChatKit({
    api: {
      url: chatkitApiUrl,
      // Domain key for custom backend validation
      // For development, use localhost as the domain key
      domainKey: "localhost",
      // Custom fetch to inject JWT token AND dashboard context
      fetch: async (url, options) => {
        // Get JWT token from localStorage
        const token = await getToken()
        if (!token) {
          throw new Error("Not authenticated - No JWT token found")
        }

        // Get current dashboard context
        const dashboardContext = getChatContext()

        // Forward JWT token for authentication
        // AND include dashboard context in headers
        return fetch(url, {
          ...options,
          credentials: "include",
          headers: {
            ...options?.headers,
            "Authorization": `Bearer ${token}`,
            // Add dashboard context as a custom header
            // This lets the chatbot know exactly what's happening in the dashboard
            "X-Dashboard-Context": btoa(unescape(encodeURIComponent(dashboardContext))),
            "X-Dashboard-Timestamp": new Date().toISOString(),
            "X-Dashboard-Task-Count": snapshot?.totalTasks.toString() || "0",
          },
        })
      },
    },
    // Event handlers for ChatKit lifecycle
    onReady: () => {
      setIsReady(true)
      setIsLoading(false)
    },
    onError: ({ error: err }) => {
      console.error("ChatKit error:", err)
      setError(err?.message || "ChatKit error occurred")
      setIsLoading(false)
    },
    onResponseStart: () => {
      // ChatKit response started
    },
    onResponseEnd: () => {
      // ChatKit response ended
    },
    onThreadChange: ({ threadId }) => {
      if (threadId) {
        localStorage.setItem("chatkit_thread_id", threadId)
      } else {
        localStorage.removeItem("chatkit_thread_id")
      }
    },
    onLog: ({ name, data }) => {
      // ChatKit internal logging - silenced for production
    },
    // Theme configuration
    theme: {
      colorScheme: "dark",
      color: {
        accent: {
          primary: "#3b82f6",
          level: 2,
        },
      },
      radius: "soft",
      density: "normal",
    },
    // Start screen configuration
    startScreen: {
      greeting: "Hello! I'm your AI Todo Assistant. I can help you:",
      prompts: [
        { label: "Add Task", prompt: "Add a new task to my list" },
        { label: "Show Tasks", prompt: "Show me all my tasks" },
        { label: "Update Task", prompt: "I want to update a task" },
        { label: "Complete Task", prompt: "Mark a task as complete" },
      ],
    },
    // Composer configuration
    composer: {
      placeholder: "Ask me to add, view, update, or complete tasks...",
    },
  })

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <div className="text-center space-y-4 max-w-md px-4">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-8 w-8 text-destructive"
            >
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold">Chat Error</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  // Show ChatKit when ready
  return (
    <ChatKit
      control={control}
      className={className}
      style={{ height: "100%", width: "100%" }}
    />
  )
}

/**
 * TodoChatKit - Wrapper with Suspense boundary
 *
 * Wraps the ChatKit component in a Suspense boundary for proper
 * Next.js 13+ app router support.
 */
export function TodoChatKit(props: TodoChatKitProps) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground">Loading chat...</p>
          </div>
        </div>
      }
    >
      <TodoChatKitInner {...props} />
    </Suspense>
  )
}
