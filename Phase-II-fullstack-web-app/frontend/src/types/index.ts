// @spec: specs/002-fullstack-web-app/data-model.md
// @spec: specs/003-ai-chatbot/spec.md
// TypeScript types for Todo application

export type Priority = "high" | "medium" | "low";

export interface Tag {
  id: string; // UUID
  user_id: string; // UUID
  name: string; // max 50 chars
  color: string | null; // hex color #RRGGBB
  created_at: string; // ISO 8601
}

export interface TagWithCount extends Tag {
  task_count: number;
}

export interface TagCreate {
  name: string;
  color?: string;
}

export interface TagUpdate {
  name?: string;
  color?: string | null;
}

export interface Task {
  id: number; // Integer ID
  user_id: string; // UUID
  title: string; // max 200 chars
  description: string | null; // max 2000 chars
  priority: Priority;
  completed: boolean;
  tags: Tag[];
  created_at: string; // ISO 8601
  updated_at: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
  priority?: Priority;
  tag_ids?: string[];
}

export interface TaskUpdate {
  title?: string;
  description?: string | null;
  priority?: Priority;
  completed?: boolean;
  tag_ids?: string[];
}

export interface TaskListResponse {
  tasks: Task[];
  count: number;
}

export interface TagListResponse {
  tags: TagWithCount[];
  count: number;
}

export interface TaskListParams {
  search?: string;
  status?: "all" | "completed" | "incomplete";
  priority?: Priority;
  tags?: string[]; // tag IDs
  sort?: "created_at" | "priority" | "title";
  order?: "asc" | "desc";
}

// Re-export chat types for convenience
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
} from "./chat";
