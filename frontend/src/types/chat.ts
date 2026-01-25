// @spec: specs/003-ai-chatbot/spec.md
// @spec: specs/003-ai-chatbot/database/schema.md
// TypeScript types for AI Chatbot feature

/**
 * Message role in the conversation
 */
export type MessageRole = "user" | "assistant" | "system"

/**
 * Chat message in a conversation
 */
export interface ChatMessage {
  id: string
  conversation_id: string
  role: MessageRole
  content: string
  created_at: string
  tool_calls?: ToolCall[]
}

/**
 * Tool call made by the AI agent
 */
export interface ToolCall {
  id: string
  tool_name: string
  arguments: Record<string, unknown>
  result?: unknown
  error?: string
}

/**
 * Conversation metadata
 */
export interface Conversation {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string | null
  message_count?: number
}

/**
 * Response from chat API endpoint
 */
export interface ChatResponse {
  conversation_id: string
  message: ChatMessage
  tool_calls?: ToolCall[]
}

/**
 * Request payload for sending a chat message
 */
export interface ChatRequest {
  message: string
  conversation_id?: string
}

/**
 * List of conversations for a user
 */
export interface ConversationsListResponse {
  conversations: Conversation[]
  count: number
}

/**
 * Error response from API
 */
export interface ChatError {
  detail: string
  error_code?: string
}

/**
 * Chat widget state
 */
export interface ChatState {
  messages: ChatMessage[]
  isLoading: boolean
  isTyping: boolean
  error: string | null
  conversationId: string | null
}

/**
 * Chat widget actions
 */
export interface ChatActions {
  sendMessage: (content: string) => Promise<void>
  loadConversation: (id: string) => Promise<void>
  startNewChat: () => void
  setInput: (value: string) => void
  clearError: () => void
}

/**
 * Props for MessageList component
 */
export interface MessageListProps {
  messages: ChatMessage[]
  isTyping: boolean
  messagesEndRef?: React.RefObject<HTMLDivElement | null>
}

/**
 * Props for individual MessageBubble component
 */
export interface MessageBubbleProps {
  message: ChatMessage
  isTyping?: boolean
}

/**
 * Props for TypingIndicator component
 */
export interface TypingIndicatorProps {
  size?: "sm" | "md" | "lg"
}

/**
 * Props for ChatInput component
 */
export interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  isLoading: boolean
  disabled?: boolean
  placeholder?: string
}

/**
 * Props for ConversationSidebar component
 */
export interface ConversationSidebarProps {
  conversations: Conversation[]
  currentConversationId: string | null
  onSelectConversation: (id: string) => void
  onNewChat: () => void
  isLoading?: boolean
  isOpen?: boolean
  onToggle?: () => void
}

/**
 * Props for ChatWidget component
 */
export interface ChatWidgetProps {
  userId: string
  initialConversationId?: string | null
  showSidebar?: boolean
  className?: string
}

/**
 * Send message state for tracking message delivery
 */
export type SendMessageState = "idle" | "sending" | "success" | "error"

/**
 * Rate limit info from API headers
 */
export interface RateLimitInfo {
  limit: number
  remaining: number
  reset: number
}
