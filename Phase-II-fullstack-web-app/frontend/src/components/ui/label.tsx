import * as React from "react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement>,
    MotionProps {
  required?: boolean
  disabled?: boolean
  htmlFor?: string
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({
    className,
    required = false,
    disabled = false,
    htmlFor,
    children,
    whileHover,
    whileTap,
    ...props
  }, ref) => {
    const defaultWhileHover = {
      color: "hsl(var(--primary))"
    }

    return (
      <motion.label
        ref={ref}
        className={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          disabled && "text-muted-foreground",
          className
        )}
        htmlFor={htmlFor}
        whileHover={whileHover || defaultWhileHover}
        whileTap={whileTap}
        transition={whileHover ? { duration: 0.2 } : undefined}
        {...props}
      >
        {children}
        {required && <span className="text-red-500 ml-1">*</span>}
      </motion.label>
    )
  }
)

Label.displayName = "Label"

export { Label }