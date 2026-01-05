import * as React from "react"
import { motion } from "framer-motion"
import { useState } from "react"

import { cn } from "@/lib/utils"

interface AnimatedInputProps extends React.ComponentProps<"input"> {
  focusAnimation?: boolean
  label?: string
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({
    className,
    type,
    focusAnimation = true,
    label,
    error,
    ...props
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false)

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      props.onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      props.onBlur?.(e)
    }

    const inputVariants = {
      focused: {
        y: -2,
        scale: 1.01,
        transition: { duration: 0.2, ease: "easeOut" }
      },
      default: {
        y: 0,
        scale: 1,
        transition: { duration: 0.2, ease: "easeOut" }
      }
    }

    return (
      <motion.div className="relative">
        {label && (
          <motion.label
            className={cn(
              "absolute left-3 top-1/2 z-10 -translate-y-1/2 bg-background px-1 text-xs text-muted-foreground transition-colors peer-focus:text-foreground peer-disabled:opacity-50",
              isFocused && "-top-2 text-xs font-medium"
            )}
            variants={inputVariants}
            animate={isFocused ? "focused" : "default"}
          >
            {label}
          </motion.label>
        )}
        <motion.div
          whileHover={{
            borderColor: "hsl(var(--ring))",
            transition: { duration: 0.2 }
          }}
          animate={isFocused ? {
            borderColor: "hsl(var(--ring))",
            boxShadow: "0 0 0 2px hsl(var(--ring) / 0.1)"
          } : {
            borderColor: "hsl(var(--input))",
            boxShadow: "none"
          }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={cn(
            "flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            className
          )}
        >
          <input
            type={type}
            className="w-full bg-transparent outline-none"
            ref={ref}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
        </motion.div>
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
Input.displayName = "Input"

export { Input }
