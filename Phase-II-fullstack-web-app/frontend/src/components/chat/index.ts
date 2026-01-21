// @spec: specs/003-ai-chatbot/spec.md
// @spec: specs/003-ai-chatbot/ui/chatkit.md
// Chat components exports

/**
 * Chat Components - Professional AI chatbot interface components
 *
 * This module exports all chat-related components for the AI Todo Assistant.
 * All components are production-ready with TypeScript types, accessibility,
 * and responsive design.
 *
 * @example
 * ```tsx
 * import { ChatWidget } from "@/components/chat"
 *
 * export default function ChatPage() {
 *   return <ChatWidget userId={user.id} />
 * }
 * ```
 *
 * @example Individual components
 * ```tsx
 * import {
 *   MessageList,
 *   ChatInput,
 *   TypingIndicator,
 *   ConversationSidebar
 * } from "@/components/chat"
 * ```
 */

// Main widget component
export { ChatWidget } from "./ChatWidget"

// Message components
export { MessageList } from "./MessageList"
export { MessageBubble } from "./MessageBubble"

// Input component
export { ChatInput } from "./ChatInput"

// UI components
export { TypingIndicator } from "./TypingIndicator"
export { ConversationSidebar } from "./ConversationSidebar"

// Types
export type {
  ChatMessage,
  ChatResponse,
  ChatRequest,
  Conversation,
  ConversationsListResponse,
  ChatError,
  ChatState,
  ChatActions,
  MessageListProps,
  MessageBubbleProps,
  TypingIndicatorProps,
  ChatInputProps,
  ConversationSidebarProps,
  ChatWidgetProps,
  SendMessageState,
  RateLimitInfo
} from "@/types/chat"
