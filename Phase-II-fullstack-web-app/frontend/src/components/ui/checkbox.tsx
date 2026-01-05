"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
    MotionProps {
  checkedAnimation?: boolean
  label?: string
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({
  className,
  checked: checkedProp,
  disabled,
  label,
  checkedAnimation = true,
  children,
  ...props
}, ref) => {
  const [checked, setChecked] = React.useState(checkedProp)

  React.useEffect(() => {
    setChecked(checkedProp)
  }, [checkedProp])

  const handleCheckedChange = (checked: boolean) => {
    setChecked(checked)
    props.onCheckedChange?.(checked)
  }

  const boxVariants = {
    checked: {
      backgroundColor: "hsl(var(--primary))",
      borderColor: "hsl(var(--primary))"
    },
    unchecked: {
      backgroundColor: "hsl(var(--background))",
      borderColor: "hsl(var(--input))"
    }
  }

  const checkmarkVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { delay: 0.1, duration: 0.2 }
    }
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <motion.div
        animate={checked ? "checked" : "unchecked"}
        variants={boxVariants}
        transition={{ duration: 0.2 }}
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-primary shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=unchecked]:bg-background data-[state=unchecked]:text-foreground"
        )}
      >
        <CheckboxPrimitive.Root
          checked={checked}
          onCheckedChange={handleCheckedChange}
          disabled={disabled}
          ref={ref}
          {...props}
        >
          {checked && (
            <motion.div
              variants={checkmarkVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <Check className="h-3 w-3" />
            </motion.div>
          )}
        </CheckboxPrimitive.Root>
      </motion.div>
      {label && (
        <motion.label
          className={cn(
            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            disabled && "text-muted-foreground"
          )}
          whileHover={!disabled ? { color: "hsl(var(--primary))" } : undefined}
          transition={{ duration: 0.2 }}
        >
          {label}
        </motion.label>
      )}
      {children}
    </div>
  )
})

Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }