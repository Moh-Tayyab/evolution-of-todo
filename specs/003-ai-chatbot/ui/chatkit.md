# UI Specification: OpenAI ChatKit Integration

**Feature**: AI-Powered Chatbot
**Phase**: Phase III - AI Chatbot
**Related**: [spec.md](../spec.md), [features/chatbot.md](../features/chatbot.md)

## Overview

Defines OpenAI ChatKit frontend integration patterns for the conversational AI todo assistant. Provides clean, responsive chat interface with message history management, typing indicators, and loading states.

## ChatKit Component Architecture

### Widget Integration

**Basic Chat Setup**:
```tsx
// @spec: specs/003-ai-chatbot/ui/chatkit.md
import { ChatWidget } from "@openai/chatkit";
import { getCurrentUserId } from "@/lib/auth";

export default function ChatPage() {
  return (
    <ChatWidget
      apiUrl="/api/chat"
      authToken={await getCurrentUserId()}
      theme="light"
      initialGreeting="Hi! I'm your todo assistant. How can I help you manage your tasks today?"
      onMessageSent={(message) => console.log("Message sent:", message)}
    />
  );
}
```

### Configuration Props

| Prop | Type | Required | Default | Description |
|------|------|-----------|---------|-------------|
| `apiUrl` | string | Yes | - | Backend chat endpoint |
| `authToken` | string | Yes | - | JWT bearer token for authentication |
| `theme` | 'light' \| 'dark' | No | 'light' | UI color theme |
| `initialGreeting` | string | No | AI greeting message on load |
| `onMessageSent` | function | No | - | Callback when user sends message |

### Advanced Configuration

**Custom Message Styling**:
```tsx
<ChatWidget
  apiUrl="/api/chat"
  authToken={token}
  theme="light"
  customStyles={{
    userMessage: {
      backgroundColor: "#3b82f6",  // Blue-500
      color: "#ffffff",
      borderRadius: "18px 18px 4px 18px",  // Asymmetric corners
      maxWidth: "70%",
      padding: "12px 16px",
      marginLeft: "auto"
    },
    aiMessage: {
      backgroundColor: "#f3f4f6",  // Gray-100
      color: "#1f2937",  // Gray-800
      borderRadius: "18px 18px 18px 4px",  // Asymmetric corners
      maxWidth: "70%",
      padding: "12px 16px",
      marginRight: "auto"
    }
  }}
/>
```

### Message History Management

**Auto-Archival**:
- When conversation exceeds 100 messages, ChatKit automatically archives old ones
- Archived conversations accessible via conversation list UI

**Manual Conversation Switching**:
```tsx
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";

export function ConversationSidebar() {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    async function loadConversations() {
      const userId = await getCurrentUserId();
      const convos = await apiClient.getConversations(userId);
      setConversations(convos);
    }
    loadConversations();
  }, []);

  return (
    <div className="w-64 bg-white border-r">
      <h3 className="font-bold mb-4">Conversations</h3>
      <ul className="space-y-2">
        {conversations.map(convo => (
          <li
            key={convo.id}
            className="p-2 rounded cursor-pointer hover:bg-gray-100"
            onClick={() => switchConversation(convo.id)}
          >
            <div className="font-medium truncate">{convo.title || "Untitled"}</div>
            <div className="text-sm text-gray-500">{convo.message_count} messages</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Component Specifications

### ChatPage Component

**Full Layout with Sidebar**:
```tsx
// @spec: specs/003-ai-chatbot/ui/chatkit.md
"use client";

import { useState } from "react";
import { ChatWidget } from "@openai/chatkit";
import ConversationSidebar from "@/components/chat/ConversationSidebar";
import { getCurrentUserId } from "@/lib/auth";

export default function ChatPage() {
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <div className="flex h-screen">
      {showSidebar && (
        <ConversationSidebar />
      )}

      <main className="flex-1 flex flex-col">
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Todo Assistant</h1>
            <p className="text-gray-600 text-sm">Manage your tasks with natural language</p>
          </div>
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 rounded hover:bg-gray-100"
          >
            {showSidebar ? "Hide Sidebar" : "Show Conversations"}
          </button>
        </header>

        <div className="flex-1">
          <ChatWidget
            apiUrl="/api/chat"
            authToken={await getCurrentUserId()}
            theme="light"
            initialGreeting="Hi! I'm your todo assistant. How can I help you manage your tasks today?"
          />
        </div>
      </main>
    </div>
  );
}
```

### TypingIndicator Component

**Three-dot bounce animation during AI processing**:
```tsx
// @spec: specs/003-ai-chatbot/ui/chatkit.md
"use client";

import { motion } from "framer-motion";

export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 p-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-2 h-2 bg-gray-400 rounded-full"
      />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear", delay: 0.2 }}
        className="w-2 h-2 bg-gray-400 rounded-full"
      />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear", delay: 0.4 }}
        className="w-2 h-2 bg-gray-400 rounded-full"
      />
      <span className="text-gray-500 text-sm ml-2">AI is thinking...</span>
    </div>
  );
}
```

### MessageList Component

**Display messages with proper styling and role indicators**:
```tsx
// @spec: specs/003-ai-chatbot/ui/chatkit.md
import { Message } from "@openai/chatkit";
import TypingIndicator from "./TypingIndicator";

export default function MessageList({ messages, isLoading }) {
  const isUserMessage = (role: string) => role === "user";

  return (
    <div className="flex flex-col space-y-4 p-4">
      {messages.map((message, index) => (
        <div
          key={message.id || index}
          className={`flex ${isUserMessage(message.role) ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[70%] p-3 ${
              isUserMessage(message.role)
                ? "bg-blue-500 text-white rounded-tr-[18px] rounded-br-[18px] rounded-bl-[4px] rounded-tl-[4px] rounded-trl-[18px]"
                : "bg-gray-100 text-gray-800 rounded-tl-[18px] rounded-tr-[18px] rounded-br-[4px] rounded-bl-[4px] rounded-tl-[18px]"
            }`}
          >
            {message.content}
          </div>
        </div>
      ))}

      {isLoading && <TypingIndicator />}
    </div>
  );
}
```

### Input Area Component

**Multi-line text input with send button**:
```tsx
// @spec: specs/003-ai-chatbot/ui/chatkit.md
"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export default function ChatInput({ onSend, isLoading }) {
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (message.trim() && !isLoading) {
      onSend(message);
      setMessage("");
    }
  };

  return (
    <div className="p-4 border-t">
      <div className="flex items-center gap-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Ask me to add, view, or complete tasks..."
          className="flex-1 p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none resize-none"
          rows={2}
          disabled={isLoading}
        />
        <button
          onClick={handleSubmit}
          disabled={isLoading || !message.trim()}
          className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={20} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>
    </div>
  );
}
```

## Integration Patterns

### API Client Extension

**Add chat endpoint to existing apiClient**:
```typescript
// @spec: specs/003-ai-chatbot/ui/chatkit.md
// Extended from Phase II api.ts

interface ChatRequest {
  message: string;
  conversation_id?: string;  // UUID or "latest"
}

interface ChatResponse {
  reply: string;
  conversation_id: string;
  tool_calls?: ToolCall[];
}

interface ToolCall {
  tool_name: string;
  tool_args: Record<string, any>;
  tool_result: {
    success: boolean;
    message_id: string;
  };
}

export const apiClient = {
  // ... existing Phase II methods (getTasks, createTask, etc.)

  async chat(userId: string, request: ChatRequest): Promise<ChatResponse> {
    const token = await authClient.getToken();

    const response = await fetch(`${API_URL}/api/${userId}/chat`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error("Chat request failed");
    }

    return response.json();
  },

  async getConversations(userId: string): Promise<Conversation[]> {
    const token = await authClient.getToken();

    const response = await fetch(`${API_URL}/api/${userId}/conversations`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch conversations");
    }

    return response.json();
  },

  async getMessages(userId: string, conversationId: string): Promise<Message[]> {
    const token = await authClient.getToken();

    const response = await fetch(`${API_URL}/api/${userId}/conversations/${conversationId}/messages`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch messages");
    }

    return response.json();
  }
};
```

### TypeScript Types

**Extended types for chat functionality**:
```typescript
// @spec: specs/003-ai-chatbot/ui/chatkit.md
// Extended from Phase II types.ts

export interface Conversation {
  id: string;
  user_id: string;
  title: string | null;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  user_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  tool_calls?: ToolCall[];
  created_at: string;
}

export interface ToolCall {
  tool_name: "add_task" | "list_tasks" | "update_task" | "delete_task" | "complete_task";
  tool_args: Record<string, any>;
  tool_result: {
    success: boolean;
    message_id: string;
  };
}
```

### Auth Integration

**Pass JWT token from Better Auth to ChatKit**:
```typescript
// @spec: specs/003-ai-chatbot/ui/chatkit.md
import { authClient } from "@/lib/auth";

export async function getAuthToken(): Promise<string> {
  const session = await authClient.getSession();

  if (!session) {
    throw new Error("User not authenticated");
  }

  return session.token;
}

// Usage in ChatWidget
const token = await getAuthToken();
```

## Responsive Design

### Breakpoints

| Screen Width | Layout | ChatWidget Width | Message Max Width |
|--------------|--------|-----------------|------------------|
| Mobile (320px+) | Full width (sidebar hidden) | 100% | 100% |
| Tablet (768px+) | Sidebar visible on toggle | 80% | 85% |
| Desktop (1024px+) | Fixed sidebar width | 70% | 70% |

### Mobile Optimization

**Touch-friendly components**:
- Minimum touch target: 44x44px for send button
- Adequate spacing: 16px padding for interactive elements
- Full-width input on mobile for easy typing
- Hideable sidebar for full screen chat on mobile

## Accessibility

### Keyboard Navigation

```tsx
// Focus management for keyboard users
export default function ChatInput({ onSend, isLoading }) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Auto-focus textarea on mount
    textareaRef.current?.focus();
  }, []);

  return (
    <textarea
      ref={textareaRef}
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      onKeyDown={(e) => {
        // Send on Enter without Shift
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          onSend(message);
        }
      }}
      aria-label="Type your message"
      // ...other props
    />
  );
}
```

### Screen Reader Support

**ARIA labels for all interactive elements**:
```tsx
<button
  aria-label="Send message"
  aria-pressed={isLoading}
>
  <Send aria-hidden="true" />
</button>

<div
  role="log"
  aria-live="polite"
  aria-label="Chat conversation"
>
  {messages.map(msg => (
    <div role="article" aria-label={`Message from ${msg.role}`}>
      {msg.content}
    </div>
  ))}
</div>
```

### Focus Management

- Focus stays in input after message sent
- Screen reader announces new messages via `aria-live`
- Modal dialogs trap focus until dismissed

## Performance Optimization

### Code Splitting

**Lazy load ChatKit components**:
```typescript
import dynamic from "next/dynamic";

const ChatWidget = dynamic(
  () => import("@openai/chatkit").then(mod => mod.ChatWidget),
  { ssr: false, loading: () => <ChatSkeleton /> }
);

export default function ChatPage() {
  return <ChatWidget />;
}
```

### Message Caching

**Cache conversation data in React state to avoid redundant API calls**:
```typescript
// Cache conversations locally
const [conversations, setConversations] = useState<Conversation[]>([]);
const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

// Only refetch when switching conversations
useEffect(() => {
  async function loadMessages() {
    if (activeConversationId) {
      const messages = await apiClient.getMessages(userId, activeConversationId);
      setMessages(messages);
    }
  }
  loadMessages();
}, [activeConversationId]);
```

## Error Handling

### Network Errors

```typescript
async function handleChatSend(userId: string, message: string) {
  try {
    const response = await apiClient.chat(userId, {
      message,
      conversation_id: activeConversationId || "latest"
    });

    addAiMessage(response.reply);

  } catch (error) {
    if (error instanceof NetworkError) {
      showErrorMessage("Connection failed. Please check your internet.");
    } else if (error instanceof ResponseError) {
      showErrorMessage("Server error. Please try again.");
    } else {
      showErrorMessage("Something went wrong. Please try again.");
    }
  }
}

function showErrorMessage(message: string) {
  // Display error toast or inline message
  setErrorMessage(message);
  // Auto-dismiss after 5 seconds
  setTimeout(() => setErrorMessage(""), 5000);
}
```

### Rate Limiting

**Handle 429 Too Many Requests**:
```typescript
async function handleChatWithRetry(userId: string, message: string) {
  try {
    const response = await apiClient.chat(userId, { message });

    if (!response.ok && response.status === 429) {
      const retryAfter = response.headers.get("Retry-After");
      showRateLimitMessage(retryAfter);
      return;
    }

    // Process successful response
    addAiMessage(response.reply);

  } catch (error) {
    handleChatError(error);
  }
}

function showRateLimitMessage(retryAfter: string | null) {
  const message = retryAfter
    ? `You've reached the rate limit. Please wait ${retryAfter} before trying again.`
    : "You've reached the rate limit. Please try again later.";

  setErrorMessage(message);
}
```

## Loading States

### Initial Load State

```tsx
// Skeleton loader while fetching conversation history
export default function ChatSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {[1, 2, 3].map(i => (
        <div
          key={i}
          className="animate-pulse bg-gray-100 h-16 rounded-lg"
        />
      ))}
    </div>
  );
}
```

### Message Send State

```tsx
// Disable input and show spinner while sending
export default function ChatInput({ onSend, isSending }) {
  return (
    <div className="p-4 border-t">
      <textarea
        disabled={isSending}
        placeholder="Type a message..."
        className="w-full p-3 rounded-lg border disabled:bg-gray-100"
      />
      <button
        disabled={isSending}
        className="p-3 bg-blue-500 text-white rounded-lg disabled:opacity-50"
      >
        {isSending ? <LoadingSpinner /> : <Send />}
      </button>
    </div>
  );
}
```

---

*End of UI Specification: ChatKit Integration*
