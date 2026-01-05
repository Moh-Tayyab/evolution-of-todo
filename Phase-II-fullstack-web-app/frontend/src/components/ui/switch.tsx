"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>,
    MotionProps {
  checkedAnimation?: boolean
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({
  className,
  checked: checkedProp,
  disabled,
  checkedAnimation = true,
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

  const switchVariants = {
    checked: {
      backgroundColor: "hsl(var(--primary))"
    },
    unchecked: {
      backgroundColor: "hsl(var(--input))"
    }
  }

  const thumbVariants = {
    checked: {
      x: 16,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    unchecked: {
      x: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    }
  }

  return (
    <motion.div
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.1 }}
    >
      <SwitchPrimitives.Root
        className={cn(
          "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
          className
        )}
        checked={checked}
        onCheckedChange={handleCheckedChange}
        disabled={disabled}
        ref={ref}
        {...props}
      >
        <motion.span
          animate={checked ? "checked" : "unchecked"}
          variants={switchVariants}
          className={cn(
            "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform"
          )}
        />
        <motion.span
          className="pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg"
          animate={checked ? "checked" : "unchecked"}
          variants={thumbVariants}
        />
      </SwitchPrimitives.Root>
    </motion.div>
  )
})

Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }