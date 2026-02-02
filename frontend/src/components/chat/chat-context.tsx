// @spec: specs/003-ai-chatbot/spec.md
// Global Chat State Management - Connect AI Dashboard to ChatKit

"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"

/**
 * Agent State - Current state of the AI agent
 */
export type AgentState = "idle" | "thinking" | "executing" | "responding" | "error"

/**
 * Tool Execution - Record of a tool execution
 */
export interface ToolExecution {
  id: string
  tool: string
  status: "running" | "success" | "error"
  timestamp: Date
  duration?: number
}

/**
 * Chat State - Global chat state
 */
interface ChatState {
  isOpen: boolean
  initialPrompt: string | null
  agentState: AgentState
  toolExecutions: ToolExecution[]
  activeTool: string | null
}

/**
 * Chat Context Actions - Functions to modify chat state
 */
interface ChatContextActions {
  openChat: (prompt?: string) => void
  closeChat: () => void
  setAgentState: (state: AgentState) => void
  startToolExecution: (tool: string) => string
  completeToolExecution: (id: string, success: boolean, duration?: number) => void
  clearExecutions: () => void
}

/**
 * Chat Context Value - Combined state and actions
 */
interface ChatContextValue extends ChatState, ChatContextActions {}

// Create context with undefined default (will be provided by provider)
const ChatContext = createContext<ChatContextValue | undefined>(undefined)

/**
 * ChatProvider - Provider component for chat state
 *
 * This context manages:
 * - Chat open/close state
 * - Initial prompt for quick actions
 * - Agent state for activity monitoring
 * - Tool execution history
 */
export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ChatState>({
    isOpen: false,
    initialPrompt: null,
    agentState: "idle",
    toolExecutions: [],
    activeTool: null,
  })

  // Open chat with optional initial prompt
  const openChat = useCallback((prompt?: string) => {
    setState(prev => ({
      ...prev,
      isOpen: true,
      initialPrompt: prompt || null,
    }))
  }, [])

  // Close chat
  const closeChat = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: false,
      initialPrompt: null,
      agentState: "idle",
      activeTool: null,
    }))
  }, [])

  // Set agent state
  const setAgentState = useCallback((agentState: AgentState) => {
    setState(prev => ({ ...prev, agentState }))
  }, [])

  // Start a tool execution
  const startToolExecution = useCallback((tool: string) => {
    const execution: ToolExecution = {
      id: `${Date.now()}-${Math.random()}`,
      tool,
      status: "running",
      timestamp: new Date(),
    }

    setState(prev => ({
      ...prev,
      agentState: "executing",
      activeTool: tool,
      toolExecutions: [...prev.toolExecutions, execution],
    }))

    return execution.id
  }, [])

  // Complete a tool execution
  const completeToolExecution = useCallback((
    id: string,
    success: boolean,
    duration?: number
  ) => {
    setState(prev => ({
      ...prev,
      agentState: "responding",
      activeTool: null,
      toolExecutions: prev.toolExecutions.map(exec =>
        exec.id === id
          ? { ...exec, status: success ? "success" : "error", duration }
          : exec
      ),
    }))
  }, [])

  // Clear execution history
  const clearExecutions = useCallback(() => {
    setState(prev => ({ ...prev, toolExecutions: [] }))
  }, [])

  const value: ChatContextValue = {
    ...state,
    openChat,
    closeChat,
    setAgentState,
    startToolExecution,
    completeToolExecution,
    clearExecutions,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

/**
 * useChatContext - Hook to access chat context
 *
 * @throws Error if used outside ChatProvider
 *
 * Usage:
 * ```tsx
 * const { openChat, closeChat, agentState, toolExecutions } = useChatContext()
 *
 * // Open chat with a prompt
 * openChat("Add a new task")
 *
 * // Check agent state
 * if (agentState === "executing") {
 *   console.log("Agent is working...")
 * }
 * ```
 */
export function useChatContext(): ChatContextValue {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider")
  }
  return context
}
