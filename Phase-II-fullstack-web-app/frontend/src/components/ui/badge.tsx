import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, MotionProps } from "framer-motion"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants>,
    MotionProps {
  animateOnMount?: boolean
  whileHover?: MotionProps["whileHover"]
  whileTap?: MotionProps["whileTap"]
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({
    className,
    variant,
    animateOnMount = true,
    whileHover: customWhileHover,
    whileTap: customWhileTap,
    children,
    ...props
  }, ref) => {
    const defaultWhileHover = {
      scale: 1.05,
      transition: { duration: 0.2 }
    }

    const defaultWhileTap = {
      scale: 0.95,
      transition: { duration: 0.1 }
    }

    return (
      <motion.div
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        initial={animateOnMount ? { opacity: 0, scale: 0.8 } : undefined}
        animate={animateOnMount ? { opacity: 1, scale: 1 } : undefined}
        transition={animateOnMount ? { duration: 0.2, ease: "easeOut" } : undefined}
        whileHover={customWhileHover || defaultWhileHover}
        whileTap={customWhileTap || defaultWhileTap}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

Badge.displayName = "Badge"

export { Badge, badgeVariants }
