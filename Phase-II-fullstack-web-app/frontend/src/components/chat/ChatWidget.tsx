// @spec: specs/003-ai-chatbot/spec.md
// @spec: specs/003-ai-chatbot/ui/chatkit.md
// Main chat widget component - reusable wrapper for AI chat interface

"use client"

import { useState, useEffect, useRef, useCallback, useReducer } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api"
import { MessageList } from "./MessageList"
import { ChatInput } from "./ChatInput"
import { ConversationSidebar } from "./ConversationSidebar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ChatWidgetProps, ChatMessage, Conversation } from "@/types/chat"

const CONVERSATION_ID_KEY = "chat_conversation_id"

/**
 * ChatWidget - Professional reusable chat widget for AI assistant
 *
 * Features:
 * - Complete chat interface with messages, input, and sidebar
 * - Conversation history persistence
 * - Real-time message sending and receiving
 * - Typing indicators and loading states
 * - Error handling with user-friendly messages
 * - Keyboard shortcuts (Enter to send, Shift+Enter for new line)
 * - Responsive design (mobile-first)
 * - Dark mode support
 *
 * @spec FR-005: Frontend MUST integrate OpenAI ChatKit widget for conversational UI
 * @spec FR-009: Frontend MUST persist conversation_id across browser sessions using localStorage
 */
export function ChatWidget({
  userId,
  initialConversationId = null,
  showSidebar = true,
  className
}: ChatWidgetProps) {
  const router = useRouter()

  // Input state - managed locally since it's only used by ChatInput
  const [inputValue, setInputValue] = useState("")

  // Chat state with useReducer for complex state management
  const [state, dispatch] = useReducer(chatReducer, {
    messages: [],
    isLoading: false,
    isTyping: false,
    error: null,
    conversationId: initialConversationId,
    conversations: [],
    sidebarOpen: false,
    streamingContent: ""
  })

  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const streamingMessageRef = useRef<string | null>(null)

  // Load conversation from localStorage on mount
  useEffect(() => {
    const savedId = localStorage.getItem(CONVERSATION_ID_KEY)
    if (savedId && !state.conversationId) {
      dispatch({ type: "SET_CONVERSATION_ID", payload: savedId })
      loadConversation(savedId)
    }
  }, [])

  // Load conversations list if sidebar is enabled
  useEffect(() => {
    if (showSidebar && userId) {
      loadConversations()
    }
  }, [showSidebar, userId])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  // Listen for example prompt clicks
  useEffect(() => {
    const handleExamplePrompt = (e: CustomEvent<string>) => {
      setInputValue(e.detail)
      // Auto-send after a brief delay to show the message in the input
      setTimeout(() => {
        handleSendMessage(e.detail)
      }, 100)
    }

    window.addEventListener("examplePrompt", handleExamplePrompt as EventListener)
    return () => {
      window.removeEventListener("examplePrompt", handleExamplePrompt as EventListener)
    }
  }, [state.isLoading, state.conversationId])

  // Load conversation messages
  const loadConversation = async (id: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })

      const data = await apiClient.getConversation(userId, id)

      dispatch({
        type: "SET_MESSAGES",
        payload: data.messages
      })
      dispatch({ type: "SET_CONVERSATION_ID", payload: id })
      dispatch({ type: "CLEAR_ERROR" })

      // Persist to localStorage
      localStorage.setItem(CONVERSATION_ID_KEY, id)
    } catch (error) {
      console.error("Failed to load conversation:", error)
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Failed to load conversation"
      })
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  // Load all conversations for sidebar
  const loadConversations = async () => {
    try {
      const data = await apiClient.getConversations(userId)
      dispatch({
        type: "SET_CONVERSATIONS",
        payload: data.conversations
      })
    } catch (error) {
      console.error("Failed to load conversations:", error)
    }
  }

  // Send message to AI with streaming support
  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim() || state.isLoading) return

    // Clear input immediately
    setInputValue("")

    // Create user message for optimistic update
    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      conversation_id: state.conversationId || "",
      role: "user",
      content: content.trim(),
      created_at: new Date().toISOString()
    }

    // Add user message immediately
    dispatch({
      type: "ADD_MESSAGE",
      payload: userMessage
    })

    // Set loading states
    dispatch({ type: "SET_LOADING", payload: true })
    dispatch({ type: "SET_TYPING", payload: true })
    dispatch({ type: "CLEAR_ERROR" })
    dispatch({ type: "SET_STREAMING_CONTENT", payload: "" })

    // Create streaming assistant message
    const assistantMessageId = `assistant-${Date.now()}`
    streamingMessageRef.current = assistantMessageId

    // Add empty assistant message that will be updated with streaming content
    dispatch({
      type: "ADD_MESSAGE",
      payload: {
        id: assistantMessageId,
        conversation_id: state.conversationId || "",
        role: "assistant",
        content: "",
        created_at: new Date().toISOString()
      }
    })

    try {
      // Use streaming API for real-time responses
      abortControllerRef.current = await apiClient.sendMessageStream(
        userId,
        {
          message: userMessage.content,
          conversation_id: state.conversationId || undefined
        },
        // onChunk - update streaming content in real-time
        (chunk: string) => {
          dispatch({
            type: "UPDATE_STREAMING_CONTENT",
            payload: chunk,
            messageId: assistantMessageId
          })
        },
        // onComplete - finalize the message
        (conversationId: string) => {
          dispatch({
            type: "FINALIZE_STREAMING_MESSAGE",
            payload: { conversationId, messageId: assistantMessageId }
          })

          // Persist to localStorage
          localStorage.setItem(CONVERSATION_ID_KEY, conversationId)

          // Reload conversations list to show updated
          if (showSidebar) {
            loadConversations()
          }

          dispatch({ type: "SET_LOADING", payload: false })
          dispatch({ type: "SET_TYPING", payload: false })
        },
        // onError - handle errors
        (error: string) => {
          console.error("Failed to send message:", error)

          // Remove streaming message
          dispatch({
            type: "REMOVE_MESSAGE",
            payload: assistantMessageId
          })

          dispatch({
            type: "SET_ERROR",
            payload: error
          })

          // Check if auth error
          if (error.includes("Not authenticated")) {
            router.push("/signin")
          }

          dispatch({ type: "SET_LOADING", payload: false })
          dispatch({ type: "SET_TYPING", payload: false })
        }
      )
    } catch (error) {
      console.error("Failed to start stream:", error)

      // Remove optimistic messages on error
      dispatch({
        type: "REMOVE_MESSAGE",
        payload: userMessage.id
      })
      if (streamingMessageRef.current) {
        dispatch({
          type: "REMOVE_MESSAGE",
          payload: streamingMessageRef.current
        })
      }

      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Failed to send message"
      })

      dispatch({ type: "SET_LOADING", payload: false })
      dispatch({ type: "SET_TYPING", payload: false })
    }
  }, [state.isLoading, state.conversationId, userId, showSidebar, router])

  // Start new chat
  const handleNewChat = useCallback(() => {
    dispatch({ type: "SET_MESSAGES", payload: [] })
    dispatch({ type: "SET_CONVERSATION_ID", payload: null })
    dispatch({ type: "CLEAR_ERROR" })
    setInputValue("")
    localStorage.removeItem(CONVERSATION_ID_KEY)

    // Close sidebar on mobile
    if (state.sidebarOpen) {
      dispatch({ type: "SET_SIDEBAR_OPEN", payload: false })
    }
  }, [state.sidebarOpen])

  // Delete conversation
  const handleDeleteConversation = useCallback(async (id: string) => {
    try {
      await apiClient.deleteConversation(userId, id)

      // Remove from list
      dispatch({
        type: "REMOVE_CONVERSATION",
        payload: id
      })

      // If deleted conversation was current, start new chat
      if (state.conversationId === id) {
        handleNewChat()
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error)
    }
  }, [userId, state.conversationId, handleNewChat])

  // Toggle sidebar
  const toggleSidebar = useCallback(() => {
    dispatch({ type: "TOGGLE_SIDEBAR" })
  }, [])

  return (
    <div className={cn("flex h-screen bg-background", className)}>
      {/* Sidebar */}
      {showSidebar && (
        <ConversationSidebar
          conversations={state.conversations}
          currentConversationId={state.conversationId}
          onSelectConversation={loadConversation}
          onNewChat={handleNewChat}
          isLoading={state.messages.length === 0 && state.isLoading}
          isOpen={state.sidebarOpen}
          onToggle={toggleSidebar}
        />
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <ChatHeader
          onNewChat={handleNewChat}
          onToggleSidebar={showSidebar ? toggleSidebar : undefined}
          showMenuButton={showSidebar}
        />

        {/* Messages */}
        <MessageList
          messages={state.messages}
          isTyping={state.isTyping}
          messagesEndRef={messagesEndRef}
        />

        {/* Error display */}
        {state.error && (
          <div className="px-4 py-2 bg-destructive/10 border-t border-destructive/20">
            <p className="text-sm text-destructive text-center">
              {state.error}
              <button
                onClick={() => dispatch({ type: "CLEAR_ERROR" })}
                className="ml-2 underline"
              >
                Dismiss
              </button>
            </p>
          </div>
        )}

        {/* Input */}
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSend={() => handleSendMessage(inputValue)}
          isLoading={state.isLoading}
          disabled={!userId}
        />
      </div>
    </div>
  )
}

/**
 * ChatHeader - Header with title and actions
 */
function ChatHeader({
  onNewChat,
  onToggleSidebar,
  showMenuButton
}: {
  onNewChat: () => void
  onToggleSidebar?: () => void
  showMenuButton?: boolean
}) {
  return (
    <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        {showMenuButton && onToggleSidebar && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="lg:hidden"
            aria-label="Toggle menu"
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
              <path d="M3 12h18" />
              <path d="M3 6h18" />
              <path d="M3 18h18" />
            </svg>
          </Button>
        )}

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-sm">
            <span className="text-lg" role="img" aria-label="Robot">
              🤖
            </span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Todo Assistant</h1>
            <p className="text-xs text-muted-foreground">Manage tasks with AI</p>
          </div>
        </div>
      </div>

      <Button
        onClick={onNewChat}
        variant="outline"
        size="sm"
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
        <span className="hidden sm:inline ml-2">New Chat</span>
      </Button>
    </header>
  )
}

/**
 * Reducer for chat state management with streaming support
 */
interface ChatState {
  messages: ChatMessage[]
  isLoading: boolean
  isTyping: boolean
  error: string | null
  conversationId: string | null
  conversations: Conversation[]
  sidebarOpen: boolean
  streamingContent: string
}

type ChatAction =
  | { type: "SET_MESSAGES"; payload: ChatMessage[] }
  | { type: "ADD_MESSAGE"; payload: ChatMessage }
  | { type: "REMOVE_MESSAGE"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_TYPING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "CLEAR_ERROR" }
  | { type: "SET_CONVERSATION_ID"; payload: string | null }
  | { type: "SET_CONVERSATIONS"; payload: Conversation[] }
  | { type: "REMOVE_CONVERSATION"; payload: string }
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "SET_SIDEBAR_OPEN"; payload: boolean }
  | { type: "SET_STREAMING_CONTENT"; payload: string }
  | { type: "UPDATE_STREAMING_CONTENT"; payload: string; messageId: string }
  | { type: "FINALIZE_STREAMING_MESSAGE"; payload: { conversationId: string; messageId: string } }

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "SET_MESSAGES":
      return { ...state, messages: action.payload }
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.payload] }
    case "REMOVE_MESSAGE":
      return {
        ...state,
        messages: state.messages.filter((m) => m.id !== action.payload)
      }
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }
    case "SET_TYPING":
      return { ...state, isTyping: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload }
    case "CLEAR_ERROR":
      return { ...state, error: null }
    case "SET_CONVERSATION_ID":
      return { ...state, conversationId: action.payload }
    case "SET_CONVERSATIONS":
      return { ...state, conversations: action.payload }
    case "REMOVE_CONVERSATION":
      return {
        ...state,
        conversations: state.conversations.filter((c) => c.id !== action.payload)
      }
    case "TOGGLE_SIDEBAR":
      return { ...state, sidebarOpen: !state.sidebarOpen }
    case "SET_SIDEBAR_OPEN":
      return { ...state, sidebarOpen: action.payload }
    case "SET_STREAMING_CONTENT":
      return { ...state, streamingContent: action.payload }
    case "UPDATE_STREAMING_CONTENT":
      return {
        ...state,
        streamingContent: state.streamingContent + action.payload,
        messages: state.messages.map((m) =>
          m.id === action.messageId
            ? { ...m, content: state.streamingContent + action.payload }
            : m
        ),
      }
    case "FINALIZE_STREAMING_MESSAGE":
      return {
        ...state,
        conversationId: action.payload.conversationId,
        streamingContent: "",
      }
    default:
      return state
  }
}
