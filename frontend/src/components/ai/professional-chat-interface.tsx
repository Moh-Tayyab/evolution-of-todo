// @spec: specs/003-ai-chatbot/spec.md
// Professional Chat Interface with Tool Execution Visualization

"use client"

import { motion, AnimatePresence } from "framer-motion"
import {
  MessageSquare,
  Send,
  User,
  Bot,
  Zap,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { cn } from "@/lib/utils"
import React, { useState, useRef, useEffect } from "react"

/**
 * Message Role
 */
type MessageRole = "user" | "assistant" | "system"

/**
 * Tool Call - Represents a tool execution
 */
interface ToolCall {
  id: string
  name: string
  status: "running" | "success" | "error"
  result?: string
  duration?: number
  timestamp: Date
}

/**
 * Chat Message
 */
interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  toolCalls?: ToolCall[]
  timestamp: Date
}

/**
 * ProfessionalChatInterface - Enhanced chat with tool execution visualization
 *
 * Features:
 * - Message bubbles with typing indicators
 * - Tool execution timeline within messages
 * - Professional animations
 * - Collapsible tool details
 */
export function ProfessionalChatInterface({ className }: { className?: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI Task Assistant. I can help you add, view, update, and complete tasks using my professional toolset. What would you like to do?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsThinking(true)
    setIsTyping(true)

    // Simulate AI thinking and tool execution
    await new Promise(resolve => setTimeout(resolve, 1500))

    const toolCall: ToolCall = {
      id: Date.now().toString(),
      name: "list_tasks",
      status: "running",
      timestamp: new Date(),
    }

    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
      toolCalls: [toolCall],
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, assistantMessage])
    setIsThinking(false)

    // Simulate tool execution
    await new Promise(resolve => setTimeout(resolve, 1000))

    setMessages(prev =>
      prev.map(msg =>
        msg.id === assistantMessage.id
          ? {
              ...msg,
              toolCalls: msg.toolCalls?.map(tc => ({
                ...tc,
                status: "success",
                result: "Found 3 tasks",
                duration: 843,
              })),
              content: "Here are your current tasks:\n\n1. Complete project documentation (High Priority)\n2. Review pull requests (Medium Priority)\n3. Update dependencies (Low Priority)",
            }
          : msg
      )
    )
    setIsTyping(false)
  }

  return (
    <div className={cn("flex flex-col h-full bg-gradient-to-br from-background to-muted/20", className)}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 px-6 py-4 border-b border-border/50 backdrop-blur-xl bg-background/60 sticky top-0 z-10"
      >
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary-foreground" />
          </div>
          <motion.div
            className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-background"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">AI Task Assistant</h3>
          <p className="text-xs text-muted-foreground">Powered by OpenAI & MCP</p>
        </div>
        {isThinking && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20"
          >
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
            <span className="text-xs font-medium text-primary">Thinking...</span>
          </motion.div>
        )}
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
        <AnimatePresence mode="popLayout">
          {messages.map((message, index) => (
            <MessageBubble key={message.id} message={message} index={index} />
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-start gap-3 max-w-2xl"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-muted/50 border border-border/50">
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-muted-foreground/50"
                      animate={{ y: [0, -8, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.1,
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 border-t border-border/50 backdrop-blur-xl bg-background/60"
      >
        <div className="flex items-end gap-3 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="Ask me to manage your tasks..."
              rows={1}
              className="w-full px-4 py-3 pr-12 rounded-xl bg-background border border-border/50 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all max-h-32"
              style={{ minHeight: "48px" }}
            />
            <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
              Press Enter to send
            </div>
          </div>
          <motion.button
            onClick={handleSend}
            disabled={!input.trim() || isThinking}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-3 rounded-xl bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}

/**
 * MessageBubble - Individual message with tool execution visualization
 */
function MessageBubble({ message, index }: { message: ChatMessage; index: number }) {
  const [expandedTools, setExpandedTools] = useState(false)
  const isUser = message.role === "user"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn("flex items-start gap-3 max-w-2xl", isUser && "ml-auto flex-row-reverse")}
    >
      {/* Avatar */}
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
        isUser
          ? "bg-gradient-to-br from-primary to-primary/70"
          : "bg-gradient-to-br from-muted to-muted/70"
      )}>
        {isUser ? (
          <User className="w-4 h-4 text-primary-foreground" />
        ) : (
          <Bot className="w-4 h-4 text-foreground" />
        )}
      </div>

      {/* Content */}
      <div className={cn(
        "px-4 py-3 rounded-2xl",
        isUser
          ? "rounded-tr-sm bg-primary text-primary-foreground"
          : "rounded-tl-sm bg-muted/50 border border-border/50"
      )}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

        {/* Tool Calls */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mt-3 space-y-2">
            <button
              onClick={() => setExpandedTools(!expandedTools)}
              className="flex items-center gap-2 text-xs font-medium opacity-70 hover:opacity-100 transition-opacity"
            >
              <Zap className="w-3.5 h-3.5" />
              {message.toolCalls.length} tool call{message.toolCalls.length > 1 ? "s" : ""}
              {expandedTools ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            <AnimatePresence>
              {expandedTools && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  {message.toolCalls.map((toolCall) => (
                    <ToolCallCard key={toolCall.id} toolCall={toolCall} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Timestamp */}
        <div className={cn(
          "flex items-center gap-1 mt-2 text-xs opacity-60",
          isUser ? "text-primary-foreground" : "text-foreground"
        )}>
          <Clock className="w-3 h-3" />
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </motion.div>
  )
}

/**
 * ToolCallCard - Visual representation of a tool execution
 */
function ToolCallCard({ toolCall }: { toolCall: ToolCall }) {
  const statusConfig = {
    running: { icon: Loader2, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
    success: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    error: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
  }

  const { icon: Icon, color, bg, border } = statusConfig[toolCall.status]

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "p-3 rounded-xl border",
        bg, border
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={cn("w-4 h-4", color, toolCall.status === "running" && "animate-spin")} />
          <span className="text-sm font-medium text-foreground">{toolCall.name}</span>
        </div>
        {toolCall.duration && (
          <span className="text-xs text-muted-foreground">{toolCall.duration}ms</span>
        )}
      </div>

      {toolCall.result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-muted-foreground mt-2 p-2 rounded-lg bg-background/50"
        >
          {toolCall.result}
        </motion.div>
      )}
    </motion.div>
  )
}
