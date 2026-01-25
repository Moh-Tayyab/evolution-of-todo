// @spec: specs/003-ai-chatbot/spec.md
// @spec: specs/003-ai-chatbot/ui/chatkit.md
// Professional chat input component with auto-expanding textarea

"use client"

import { memo, useState, useRef, useEffect, KeyboardEvent } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { ChatInputProps } from "@/types/chat"

/**
 * ChatInput - Auto-expanding textarea with send button
 *
 * Features:
 * - Auto-expanding textarea (grows with content up to max height)
 * - Keyboard shortcuts (Enter to send, Shift+Enter for new line)
 * - Character counter (optional)
 * - Disabled state during sending
 * - Focus management
 * - ARIA labels for accessibility
 *
 * @spec FR-010: Frontend MUST support message input with multi-line text capability
 */
export const ChatInput = memo(function ChatInput({
  value,
  onChange,
  onSend,
  isLoading,
  disabled = false,
  placeholder = "Type your message..."
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [textareaHeight, setTextareaHeight] = useState<number>(44) // Initial height (h-11)

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    // Reset height to auto to get correct scrollHeight
    textarea.style.height = "auto"

    // Calculate new height (min: 44px, max: 200px)
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 44), 200)
    setTextareaHeight(newHeight)
    textarea.style.height = `${newHeight}px`
  }, [value])

  // Focus textarea on mount if not disabled
  useEffect(() => {
    if (!disabled && !isLoading) {
      textareaRef.current?.focus()
    }
  }, [disabled, isLoading])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSend = () => {
    if (!value.trim() || isLoading || disabled) return
    onSend()

    // Reset height after send
    setTextareaHeight(44)
  }

  const canSend = value.trim().length > 0 && !isLoading && !disabled
  const isNearLimit = value.length > 2000 // Warning threshold

  return (
    <div className="border-t border-border bg-background px-4 py-4">
      <div className="max-w-3xl mx-auto space-y-2">
        {/* Input container */}
        <div className="flex items-end gap-3">
          {/* Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isLoading || disabled}
              rows={1}
              className={cn(
                "w-full resize-none overflow-hidden",
                "border border-input rounded-lg px-4 py-3",
                "bg-background text-foreground",
                "placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-all duration-200"
              )}
              style={{ height: `${textareaHeight}px` }}
              aria-label="Message input"
              aria-describedby="chat-input-hint"
              maxLength={4000}
            />

            {/* Character counter warning */}
            {isNearLimit && (
              <span
                className={cn(
                  "absolute bottom-2 right-2 text-xs",
                  value.length > 3500
                    ? "text-destructive"
                    : "text-muted-foreground"
                )}
                aria-live="polite"
              >
                {value.length}/4000
              </span>
            )}
          </div>

          {/* Send button */}
          <Button
            onClick={handleSend}
            disabled={!canSend}
            size="icon"
            className={cn(
              "h-11 w-11 shrink-0 rounded-full",
              "transition-all duration-200",
              canSend && "shadow-md"
            )}
            aria-label="Send message"
          >
            {isLoading ? (
              <SendingIcon />
            ) : (
              <SendIcon className={cn(canSend ? "translate-x-0" : "translate-x-1", "transition-transform")} />
            )}
          </Button>
        </div>

        {/* Helper hint */}
        <p
          id="chat-input-hint"
          className="text-xs text-muted-foreground text-center"
        >
          Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">Enter</kbd> to send,{" "}
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">Shift + Enter</kbd> for new line
        </p>
      </div>
    </div>
  )
})

/**
 * SendIcon - Send paper plane icon
 */
function SendIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  )
}

/**
 * SendingIcon - Loading spinner for send button
 */
function SendingIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="animate-spin"
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}
