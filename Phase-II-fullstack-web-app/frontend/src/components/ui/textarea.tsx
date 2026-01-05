import * as React from "react"
import { motion } from "framer-motion"
import { useState } from "react"

import { cn } from "@/lib/utils"

interface AnimatedTextareaProps extends React.ComponentProps<"textarea"> {
  label?: string
  error?: string
  minRows?: number
  maxRows?: number
  resize?: "none" | "vertical" | "horizontal" | "both"
}

const Textarea = React.forwardRef<HTMLTextAreaElement, AnimatedTextareaProps>(
  ({
    className,
    label,
    error,
    minRows = 3,
    maxRows = 10,
    resize = "vertical",
    ...props
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const [charCount, setCharCount] = useState(0)

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true)
      props.onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false)
      props.onBlur?.(e)
    }

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value
      setCharCount(value.length)
      props.onChange?.(e)
    }

    const textareaVariants = {
      focused: {
        borderColor: "hsl(var(--ring))",
        boxShadow: "0 0 0 2px hsl(var(--ring) / 0.1)",
        transition: { duration: 0.2, ease: "easeOut" }
      },
      default: {
        borderColor: "hsl(var(--input))",
        boxShadow: "none",
        transition: { duration: 0.2, ease: "easeOut" }
      }
    }

    return (
      <motion.div className="relative">
        {label && (
          <motion.label
            className={cn(
              "absolute left-3 top-3 z-10 bg-background px-1 text-xs text-muted-foreground transition-colors peer-focus:text-foreground peer-disabled:opacity-50",
              isFocused && "-top-2 text-xs font-medium"
            )}
            animate={isFocused ? {
              y: -12,
              scale: 0.85
            } : {
              y: 0,
              scale: 1
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {label}
          </motion.label>
        )}

        <motion.div
          whileHover={{
            borderColor: "hsl(var(--ring))",
            transition: { duration: 0.2 }
          }}
          animate={isFocused ? "focused" : "default"}
          variants={textareaVariants}
          className={cn(
            "relative flex w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            resize === "none" && "resize-none",
            resize === "vertical" && "resize-y",
            resize === "horizontal" && "resize-x",
            resize === "both" && "resize",
            className
          )}
        >
          <textarea
            ref={ref}
            rows={minRows}
            className="w-full bg-transparent outline-none resize-none"
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
          />
        </motion.div>

        {props.maxLength && (
          <motion.p
            className="absolute bottom-1 right-3 text-xs text-muted-foreground"
            animate={{
              color: charCount > props.maxLength * 0.9 ? "hsl(var(--destructive))" : "hsl(var(--muted-foreground))"
            }}
            transition={{ duration: 0.2 }}
          >
            {charCount}/{props.maxLength}
          </motion.p>
        )}

        {error && (
          <motion.p
            className="mt-1 text-xs text-red-500"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
          >
            {error}
          </motion.p>
        )}
      </motion.div>
    )
  }
)

Textarea.displayName = "Textarea"

export { Textarea }