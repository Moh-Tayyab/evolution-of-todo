// @spec: specs/002-fullstack-web-app/plan.md
// @spec: specs/002-fullstack-web-app/spec.md
// @spec: specs/003-ai-chatbot/spec.md
// API client with JWT authentication for backend communication

import { getToken } from "./auth";
import type { Task, TaskCreate, TaskUpdate, TagWithCount, TagCreate, TagUpdate } from "@/types";
import type {
  ChatMessage,
  ChatResponse,
  ChatRequest,
  Conversation,
  ConversationsListResponse,
} from "@/types/chat";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
// Backend URL for direct API calls (bypasses Next.js API routes)
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

/**
 * API client for communicating with the FastAPI backend.
 * All requests use JWT tokens for authentication.
 */
export const apiClient = {
  /**
   * Fetch tasks for a user with optional filtering and sorting.
   *
   * @param userId User ID
   * @param params Optional search, filter, and sort parameters
   * @returns Array of tasks
   */
  async getTasks(
    userId: string,
    params?: {
      search?: string;
      status?: "all" | "completed" | "incomplete";
      priority?: "high" | "medium" | "low";
      tags?: string[];
      sort?: "created_at" | "priority" | "title";
      order?: "asc" | "desc";
    }
  ): Promise<Task[]> {
    const token = await getToken();
    if (!token) {
      throw new Error("Not authenticated");
    }

    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append("search", params.search);
    if (params?.status && params.status !== "all") queryParams.append("status", params.status);
    if (params?.priority) queryParams.append("priority", params.priority);
    if (params?.tags) params.tags.forEach((tag) => queryParams.append("tag_ids", tag));
    if (params?.sort) queryParams.append("sort", params.sort);
    if (params?.order) queryParams.append("order", params.order);

    const response = await fetch(`${API_URL}/api/${userId}/tasks?${queryParams.toString()}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tasks: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Create a new task.
   *
   * @param userId User ID
   * @param task Task creation data
   * @returns Created task
   */
  async createTask(userId: string, task: TaskCreate): Promise<Task> {
    const token = await getToken();
    console.log("[API Client] createTask - Token:", token ? "exists" : "missing");
    console.log("[API Client] createTask - User ID:", userId);
    console.log("[API Client] createTask - Task Data:", task);

    if (!token) {
      console.error("[API Client] createTask - No JWT token in localStorage");
      throw new Error("Not authenticated - no JWT token in localStorage");
    }

    const response = await fetch(`${API_URL}/api/${userId}/tasks`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(task),
    });

    console.log("[API Client] createTask - Response Status:", response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error("[API Client] createTask - Error Response:", error);
      throw new Error(error.detail || "Failed to create task");
    }

    return response.json();
  },

  /**
   * Update an existing task (full update).
   *
   * @param userId User ID
   * @param taskId Task ID to update
   * @param task Task update data
   * @returns Updated task
   */
  async updateTask(userId: string, taskId: number, task: TaskUpdate): Promise<Task> {
    const token = await getToken();
    console.log("[API Client] updateTask - Token:", token ? "exists" : "missing");
    console.log("[API Client] updateTask - User ID:", userId, "Task ID:", taskId);
    console.log("[API Client] updateTask - Task Data:", task);

    if (!token) {
      console.error("[API Client] updateTask - No JWT token in localStorage");
      throw new Error("Not authenticated - no JWT token in localStorage");
    }

    const response = await fetch(`${API_URL}/api/${userId}/tasks/${taskId}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(task),
    });

    console.log("[API Client] updateTask - Response Status:", response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error("[API Client] updateTask - Error Response:", error);
      throw new Error(error.detail || "Failed to update task");
    }

    return response.json();
  },

  /**
   * Partially update a task (e.g., toggle completion).
   *
   * @param userId User ID
   * @param taskId Task ID to patch
   * @param task Partial task update data
   * @returns Updated task
   */
  async patchTask(userId: string, taskId: number, task: Partial<TaskUpdate>): Promise<Task> {
    const token = await getToken();
    if (!token) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`${API_URL}/api/${userId}/tasks/${taskId}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(task),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to patch task");
    }

    return response.json();
  },

  /**
   * Toggle task completion status (dedicated endpoint).
   *
   * @param userId User ID
   * @param taskId Task ID to toggle
   * @returns Updated task with toggled completion
   */
  async toggleTaskComplete(userId: string, taskId: number): Promise<Task> {
    const token = await getToken();
    console.log("[API Client] toggleTaskComplete - Token:", token ? "exists" : "missing");
    console.log("[API Client] toggleTaskComplete - User ID:", userId, "Task ID:", taskId);

    if (!token) {
      console.error("[API Client] toggleTaskComplete - No JWT token in localStorage");
      throw new Error("Not authenticated - no JWT token in localStorage");
    }

    const response = await fetch(`${API_URL}/api/${userId}/tasks/${taskId}/complete`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    console.log("[API Client] toggleTaskComplete - Response Status:", response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error("[API Client] toggleTaskComplete - Error Response:", error);
      throw new Error(error.detail || "Failed to toggle task completion");
    }

    return response.json();
  },

  /**
   * Delete a task.
   *
   * @param userId User ID
   * @param taskId Task ID to delete
   * @returns void
   */
  async deleteTask(userId: string, taskId: number): Promise<void> {
    const token = await getToken();
    console.log("[API Client] deleteTask - Token:", token ? "exists" : "missing");
    console.log("[API Client] deleteTask - User ID:", userId, "Task ID:", taskId);

    if (!token) {
      console.error("[API Client] deleteTask - No JWT token in localStorage");
      throw new Error("Not authenticated - no JWT token in localStorage");
    }

    const response = await fetch(`${API_URL}/api/${userId}/tasks/${taskId}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    console.log("[API Client] deleteTask - Response Status:", response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error("[API Client] deleteTask - Error Response:", error);
      throw new Error(error.detail || "Failed to delete task");
    }
  },

  /**
   * Fetch tags for a user with task counts.
   *
   * @param userId User ID
   * @returns Array of tags with task counts
   */
  async getTags(userId: string): Promise<TagWithCount[]> {
    const token = await getToken();
    if (!token) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`${API_URL}/api/${userId}/tags`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tags: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  },

  /**
   * Create a new tag.
   *
   * @param userId User ID
   * @param tag Tag creation data
   * @returns Created tag
   */
  async createTag(userId: string, tag: TagCreate): Promise<TagWithCount> {
    const token = await getToken();
    if (!token) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`${API_URL}/api/${userId}/tags`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(tag),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to create tag");
    }

    return response.json();
  },

  /**
   * Update a tag.
   *
   * @param userId User ID
   * @param tagId Tag ID to update
   * @param tag Tag update data
   * @returns Updated tag
   */
  async updateTag(userId: string, tagId: string, tag: TagUpdate): Promise<TagWithCount> {
    const token = await getToken();
    if (!token) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`${API_URL}/api/${userId}/tags/${tagId}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(tag),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to update tag");
    }

    return response.json();
  },

  /**
   * Delete a tag.
   *
   * @param userId User ID
   * @param tagId Tag ID to delete
   * @returns void
   */
  async deleteTag(userId: string, tagId: string): Promise<void> {
    const token = await getToken();
    if (!token) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`${API_URL}/api/${userId}/tags/${tagId}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to delete tag");
    }
  },

  // ==================== Chat API Methods ====================
  // @spec: specs/003-ai-chatbot/spec.md

  /**
   * Send a chat message to the AI assistant.
   *
   * @param userId User ID
   * @param request Chat request with message and optional conversation ID
   * @returns Chat response with AI message and conversation ID
   * @throws Error if not authenticated or request fails
   */
  async sendMessage(userId: string, request: ChatRequest): Promise<ChatResponse> {
    const token = await getToken();
    if (!token) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`${BACKEND_URL}/api/${userId}/chat`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please wait a moment.");
      }
      const error = await response.json();
      throw new Error(error.detail || "Failed to send message");
    }

    return response.json();
  },

  /**
   * Send a chat message with streaming response for real-time AI updates.
   *
   * @param userId User ID
   * @param request Chat request with message and optional conversation ID
   * @param onChunk Callback for each chunk of the response
   * @param onComplete Callback when streaming is complete
   * @returns AbortController to cancel the stream
   * @throws Error if not authenticated or request fails
   *
   * @spec FR-015: Frontend MUST support streaming responses for better UX
   */
  async sendMessageStream(
    userId: string,
    request: ChatRequest,
    onChunk: (chunk: string) => void,
    onComplete: (conversationId: string) => void,
    onError: (error: string) => void
  ): Promise<AbortController> {
    const token = await getToken();
    if (!token) {
      throw new Error("Not authenticated");
    }

    const abortController = new AbortController();

    fetch(`${BACKEND_URL}/api/${userId}/chat`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(request),
      signal: abortController.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          if (response.status === 429) {
            throw new Error("Rate limit exceeded. Please wait a moment.");
          }
          const error = await response.json();
          throw new Error(error.detail || "Failed to send message");
        }

        // Check content-type to determine if streaming
        const contentType = response.headers.get("content-type") || "";
        const isStreaming = contentType.includes("text/event-stream");

        // Handle streaming (SSE) response
        if (isStreaming && response.body) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          let conversationId = "";

          while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);

                // Handle SSE format
                if (data === "[DONE]") {
                  if (conversationId) {
                    onComplete(conversationId);
                  }
                  return;
                }

                try {
                  const parsed = JSON.parse(data);

                  // Handle different streaming formats
                  if (parsed.content) {
                    onChunk(parsed.content);
                  }
                  if (parsed.conversation_id) {
                    conversationId = parsed.conversation_id;
                  }
                } catch {
                  // If not JSON, treat as raw content
                  onChunk(data);
                }
              }
            }
          }

          // Final completion with conversation ID
          if (conversationId) {
            onComplete(conversationId);
          }
        } else {
          // Fallback to non-streaming response
          const data: ChatResponse = await response.json();
          onChunk(data.message.content);
          onComplete(data.conversation_id);
        }
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          onError(error instanceof Error ? error.message : "Failed to send message");
        }
      });

    return abortController;
  },

  /**
   * Get all conversations for a user.
   *
   * @param userId User ID
   * @returns List of conversations with metadata
   * @throws Error if not authenticated or request fails
   */
  async getConversations(userId: string): Promise<ConversationsListResponse> {
    const token = await getToken();
    if (!token) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`${API_URL}/api/${userId}/conversations`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch conversations: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Get a specific conversation with all messages.
   *
   * @param userId User ID
   * @param conversationId Conversation ID to load
   * @returns Conversation with messages array
   * @throws Error if not authenticated, not found, or request fails
   */
  async getConversation(userId: string, conversationId: string): Promise<Conversation & { messages: ChatMessage[] }> {
    const token = await getToken();
    if (!token) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`${API_URL}/api/${userId}/conversations/${conversationId}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Conversation not found");
      }
      throw new Error(`Failed to fetch conversation: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Create a new conversation (optional, usually done implicitly on first message).
   *
   * @param userId User ID
   * @param title Optional title for the conversation
   * @returns Created conversation
   * @throws Error if not authenticated or request fails
   */
  async createConversation(userId: string, title?: string): Promise<Conversation> {
    const token = await getToken();
    if (!token) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`${API_URL}/api/${userId}/conversations`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ title }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create conversation: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Delete a conversation.
   *
   * @param userId User ID
   * @param conversationId Conversation ID to delete
   * @returns void
   * @throws Error if not authenticated or request fails
   */
  async deleteConversation(userId: string, conversationId: string): Promise<void> {
    const token = await getToken();
    if (!token) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`${API_URL}/api/${userId}/conversations/${conversationId}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete conversation: ${response.statusText}`);
    }
  },
};
