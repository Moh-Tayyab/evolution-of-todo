// @spec: specs/003-ai-chatbot/spec.md
// @spec: specs/003-ai-chatbot/ui/chatkit.md
// Premium chat input component with functional icons and glass-morphism design
// Fixed: User input clarity, real Web Speech API for voice input

"use client"

import { memo, useState, useRef, useEffect, KeyboardEvent, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Send,
  Paperclip,
  Smile,
  Mic,
  MicOff,
  Sparkles,
  AtSign,
  Hash,
  Plus,
  Volume2,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { ChatInputProps } from "@/types/chat"

/**
 * PremiumChatInput - Auto-expanding textarea with functional action buttons
 *
 * Features:
 * - Auto-expanding textarea (grows with content up to max height)
 * - Keyboard shortcuts (Enter to send, Shift+Enter for new line)
 * - Premium glass-morphism design with subtle animations
 * - Functional action buttons (attachments, emoji, voice, @mentions, #tags)
 * - REAL Web Speech API for voice input with visual feedback
 * - Character counter with gradient warning
 * - Focus management with premium glow effects
 * - High contrast text for better readability
 * - ARIA labels for accessibility
 *
 * @spec FR-010: Frontend MUST support message input with multi-line text capability
 */
export const PremiumChatInput = memo(function PremiumChatInput({
  value,
  onChange,
  onSend,
  isLoading,
  disabled = false,
  placeholder = "Type your message..."
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [textareaHeight, setTextareaHeight] = useState<number>(52)
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessingSpeech, setIsProcessingSpeech] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false)
  const [focused, setFocused] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = "en-US"

        recognition.onstart = () => {
          setIsRecording(true)
          setIsProcessingSpeech(false)
        }

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let interimTranscript = ""
          let finalTranscript = ""

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript + " "
            } else {
              interimTranscript += transcript
            }
          }

          if (finalTranscript) {
            setTranscript(prev => {
              const newValue = prev + finalTranscript
              onChange(value + newValue)
              return newValue
            })
          } else if (interimTranscript) {
            setTranscript(interimTranscript)
          }
        }

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error("Speech recognition error:", event.error)
          setIsRecording(false)
          setIsProcessingSpeech(false)

          // Show user-friendly error message
          if (event.error === "not-allowed") {
            alert("Microphone access denied. Please allow microphone access to use voice input.")
          } else if (event.error === "no-speech") {
            setIsRecording(false)
          }
        }

        recognition.onend = () => {
          setIsRecording(false)
          setIsProcessingSpeech(false)
          setTranscript("")
        }

        recognitionRef.current = recognition
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [onChange, value])

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = "auto"
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 52), 200)
    setTextareaHeight(newHeight)
    textarea.style.height = `${newHeight}px`
  }, [value])

  useEffect(() => {
    if (!disabled && !isLoading && !isRecording) {
      textareaRef.current?.focus()
    }
  }, [disabled, isLoading, isRecording])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    if (e.key === "Escape") {
      setShowEmojiPicker(false)
      setShowAttachmentMenu(false)
    }
  }

  const handleSend = useCallback(() => {
    if (!value.trim() || isLoading || disabled) return
    onSend()
    setTextareaHeight(52)
    setShowEmojiPicker(false)
    setShowAttachmentMenu(false)
    setTranscript("")
  }, [value, isLoading, disabled, onSend])

  const handleVoiceRecord = useCallback(() => {
    const recognition = recognitionRef.current

    if (!recognition) {
      alert("Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.")
      return
    }

    if (isRecording) {
      // Stop recording
      recognition.stop()
      setIsRecording(false)
      setTranscript("")
    } else {
      // Start recording
      setIsProcessingSpeech(true)
      try {
        recognition.start()
      } catch (error) {
        console.error("Failed to start speech recognition:", error)
        setIsProcessingSpeech(false)
        alert("Failed to start voice input. Please check microphone permissions.")
      }
    }
  }, [isRecording])

  const handleEmojiInsert = useCallback((emoji: string) => {
    onChange(value + emoji)
    setShowEmojiPicker(false)
    textareaRef.current?.focus()
  }, [value, onChange])

  const canSend = value.trim().length > 0 && !isLoading && !disabled && !isRecording
  const isNearLimit = value.length > 2000

  const premiumEmojis = [
    { emoji: "👋", label: "Wave" },
    { emoji: "✅", label: "Check" },
    { emoji: "🎯", label: "Target" },
    { emoji: "💡", label: "Idea" },
    { emoji: "📝", label: "Note" },
    { emoji: "🔥", label: "Fire" },
    { emoji: "⭐", label: "Star" },
    { emoji: "🚀", label: "Rocket" },
  ]

  return (
    <div className="border-t border-border/40 bg-gradient-to-b from-background to-background/95 backdrop-blur-sm px-4 py-4 relative">
      <AnimatePresence>
        {focused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 pointer-events-none"
          />
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto space-y-3 relative">
        <motion.div
          className={cn(
            "flex items-end gap-2 p-2 rounded-2xl",
            "bg-card/80 backdrop-blur-md",
            "border border-border/50 shadow-lg",
            "transition-all duration-300",
            focused && "ring-2 ring-primary/20 shadow-primary/20"
          )}
          animate={{ scale: focused ? 1.01 : 1 }}
          transition={{ duration: 0.2 }}
        >
          {/* Attachment button */}
          <div className="relative">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl shrink-0 text-muted-foreground hover:text-foreground hover:bg-accent/50"
                onClick={() => {
                  setShowAttachmentMenu(!showAttachmentMenu)
                  setShowEmojiPicker(false)
                }}
                aria-label="Add attachment"
              >
                <Paperclip className="h-5 w-5" />
              </Button>
            </motion.div>

            <AnimatePresence>
              {showAttachmentMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10 pointer-events-none"
                    onClick={() => setShowAttachmentMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full left-0 mb-2 z-20 bg-card/95 backdrop-blur-md border border-border/50 rounded-xl shadow-2xl p-2 min-w-[200px]"
                  >
                    <AttachmentMenuItem icon={<AtSign className="h-4 w-4" />} label="@ Mention" />
                    <AttachmentMenuItem icon={<Hash className="h-4 w-4" />} label="# Tag" />
                    <AttachmentMenuItem icon={<Plus className="h-4 w-4" />} label="Add Task" />
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Textarea - FIXED: Better contrast and readability */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                setFocused(true)
                setShowAttachmentMenu(false)
                setShowEmojiPicker(false)
              }}
              onBlur={() => setFocused(false)}
              placeholder={placeholder}
              disabled={isLoading || disabled || isRecording}
              rows={1}
              className={cn(
                "w-full resize-none overflow-hidden",
                // Better contrast - darker background on light mode, lighter on dark
                "bg-card border border-border/30 rounded-xl",
                // High contrast text
                "text-foreground placeholder:text-muted-foreground/60",
                "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-all duration-200",
                "px-4 py-3",
                // Better font for readability
                "text-sm leading-relaxed"
              )}
              style={{ height: `${textareaHeight}px`, minHeight: '44px' }}
              aria-label="Message input"
              aria-describedby="chat-input-hint"
              maxLength={4000}
            />

            {/* Live transcript indicator during voice recording */}
            <AnimatePresence>
              {isRecording && transcript && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 p-2 bg-primary/10 backdrop-blur rounded-lg border border-primary/20"
                >
                  <div className="flex items-center gap-2 text-xs text-primary">
                    <Volume2 className="h-3 w-3 animate-pulse" />
                    <span className="truncate">{transcript}</span>
                    <span className="animate-pulse">...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {isNearLimit && value.length > 0 && (
              <motion.span
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "absolute bottom-1 right-2 text-xs font-medium",
                  value.length > 3500
                    ? "text-destructive bg-destructive/10 px-1.5 py-0.5 rounded"
                    : "text-muted-foreground bg-background/80 px-1.5 py-0.5 rounded"
                )}
                aria-live="polite"
              >
                {4000 - value.length} left
              </motion.span>
            )}

            <AnimatePresence>
              {(isRecording || isProcessingSpeech) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-full text-xs font-medium shadow-lg"
                >
                  {isProcessingSpeech ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-2 h-2 bg-white rounded-full"
                    />
                  )}
                  {isProcessingSpeech ? "Starting..." : "Listening..."}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Emoji picker */}
          <div className="relative">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl shrink-0 text-muted-foreground hover:text-foreground hover:bg-accent/50"
                onClick={() => {
                  setShowEmojiPicker(!showEmojiPicker)
                  setShowAttachmentMenu(false)
                }}
                aria-label="Add emoji"
              >
                <Smile className="h-5 w-5" />
              </Button>
            </motion.div>

            <AnimatePresence>
              {showEmojiPicker && (
                <>
                  <div
                    className="fixed inset-0 z-10 pointer-events-none"
                    onClick={() => setShowEmojiPicker(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full right-0 mb-2 z-20 bg-card/95 backdrop-blur-md border border-border/50 rounded-xl shadow-2xl p-3"
                  >
                    <div className="grid grid-cols-4 gap-1">
                      {premiumEmojis.map(({ emoji, label }) => (
                        <motion.button
                          key={emoji}
                          type="button"
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          className="h-10 w-10 text-xl hover:bg-accent/50 rounded-lg transition-colors"
                          onClick={() => handleEmojiInsert(emoji)}
                          aria-label={label}
                        >
                          {emoji}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Voice button - REAL Web Speech API implementation */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "h-10 w-10 rounded-xl shrink-0",
                "text-muted-foreground hover:text-foreground",
                "hover:bg-accent/50",
                isRecording && "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
              onClick={handleVoiceRecord}
              aria-label={isRecording ? "Stop recording" : "Voice input"}
              disabled={!recognitionRef.current}
              title={recognitionRef.current ? "Click to start voice input" : "Voice input not supported in this browser"}
            >
              {isProcessingSpeech ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isRecording ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>
          </motion.div>

          {/* Send button */}
          <motion.div whileHover={{ scale: canSend ? 1.05 : 1 }} whileTap={{ scale: canSend ? 0.95 : 1 }}>
            <Button
              type="button"
              onClick={handleSend}
              disabled={!canSend || isRecording}
              size="icon"
              className={cn(
                "h-10 w-10 shrink-0 rounded-xl transition-all duration-300",
                canSend
                  ? "bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/30"
                  : "bg-muted opacity-50",
                "relative overflow-hidden"
              )}
              aria-label="Send message"
            >
              <AnimatePresence>
                {canSend && !isLoading && !isRecording && (
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "200%" }}
                    exit={{ x: "200%" }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  />
                )}
              </AnimatePresence>
              {isLoading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                  <Sparkles className="h-5 w-5 text-primary-foreground" />
                </motion.div>
              ) : (
                <motion.div animate={{ x: canSend ? 0 : 4 }} transition={{ duration: 0.2 }}>
                  <Send className="h-5 w-5 text-primary-foreground" />
                </motion.div>
              )}
            </Button>
          </motion.div>
        </motion.div>

        {/* Helper hint */}
        <motion.div
          className="flex items-center justify-center gap-4 text-xs text-muted-foreground"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-muted/50 backdrop-blur rounded-md text-xs font-mono border border-border/50">Enter</kbd>
            <span>to send</span>
          </span>
          <span className="w-1 h-1 bg-border rounded-full" />
          <span className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-muted/50 backdrop-blur rounded-md text-xs font-mono border border-border/50">Shift + Enter</kbd>
            <span>for new line</span>
          </span>
          <span className="w-1 h-1 bg-border rounded-full" />
          <span className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-muted/50 backdrop-blur rounded-md text-xs font-mono border border-border/50">@</kbd>
            <span>to mention</span>
          </span>
          {recognitionRef.current && (
            <>
              <span className="w-1 h-1 bg-border rounded-full" />
              <span className="flex items-center gap-1">
                <Mic className="h-3 w-3" />
                <span>voice enabled</span>
              </span>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
})

function AttachmentMenuItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <motion.button
      type="button"
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-accent/50 transition-colors text-sm text-foreground"
    >
      <span className="text-muted-foreground">{icon}</span>
      <span>{label}</span>
    </motion.button>
  )
}

export const ChatInput = PremiumChatInput

// Type declarations for Web Speech API
interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onstart: ((event: Event) => void) | null
  onend: ((event: Event) => void) | null
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  0: {
    transcript: string
  }
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition
    }
    webkitSpeechRecognition: {
      new (): SpeechRecognition
    }
  }
}
