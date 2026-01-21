// @spec: specs/003-ai-chatbot/spec.md
// @spec: specs/003-ai-chatbot/ui/chatkit.md
// Chat page with AI-powered todo assistant using professional ChatWidget

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth"
import { ChatWidget } from "@/components/chat"

/**
 * Chat Page - AI-powered Todo Assistant
 *
 * Provides a conversational interface for task management using AI.
 * The user can create, read, update, and delete tasks through natural language.
 *
 * Features:
 * - Professional chat interface with message history
 * - Conversation sidebar for managing multiple chat sessions
 * - Real-time AI responses via OpenAI integration
 * - Typing indicators and loading states
 * - Responsive design with mobile sidebar toggle
 * - LocalStorage persistence for conversation state
 *
 * @spec FR-001: System MUST provide AI chatbot interface for natural language task management
 * @spec FR-005: Frontend MUST integrate OpenAI ChatKit widget for conversational UI
 * @spec FR-009: Frontend MUST persist conversation_id across browser sessions using localStorage
 */
export default function ChatPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Get current user session on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const session = await authClient.getSession()
        if (!session?.user) {
          // Redirect to signin if not authenticated
          router.push("/signin")
          return
        }
        setUserId(session.user.id)
      } catch (error) {
        console.error("Failed to load user session:", error)
        router.push("/signin")
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [router])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    )
  }

  // Show message if user ID not available
  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4 max-w-md px-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-8 w-8 text-muted-foreground"
            >
              <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-1.39 1.39l.27.28v.79l4 4L19 19l-4-4Z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold">Sign In Required</h2>
          <p className="text-muted-foreground">
            Please sign in to access the AI Todo Assistant.
          </p>
          <button
            onClick={() => router.push("/signin")}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    )
  }

  // Render the professional ChatWidget component
  return <ChatWidget userId={userId} showSidebar={true} />
}
