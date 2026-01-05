import * as React from "react"
import { motion } from "framer-motion"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const avatarVariants = cva(
  "relative inline-flex items-center justify-center rounded-full bg-muted text-muted-foreground font-semibold",
  {
    variants: {
      size: {
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-12 w-12 text-base",
        xl: "h-16 w-16 text-lg",
        "2xl": "h-20 w-20 text-xl"
      },
      shape: {
        circle: "rounded-full",
        square: "rounded-md"
      }
    },
    defaultVariants: {
      size: "md",
      shape: "circle"
    }
  }
)

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  src?: string
  alt?: string
  fallback?: string
  animation?: boolean
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({
    className,
    size,
    shape,
    src,
    alt,
    fallback,
    animation = true,
    children,
    ...props
  }, ref) => {
    const [imageLoaded, setImageLoaded] = React.useState(false)
    const [imageError, setImageError] = React.useState(false)

    const handleImageLoad = () => {
      setImageLoaded(true)
      setImageError(false)
    }

    const handleImageError = () => {
      setImageLoaded(false)
      setImageError(true)
    }

    const avatarAnimation = {
      hover: {
        scale: 1.05,
        transition: { duration: 0.2 }
      }
    }

    const contentAnimation = {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.8 },
      transition: { duration: 0.2 }
    }

    const getInitials = (name: string = '') => {
      return name
        .split(' ')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }

    return (
      <motion.div
        ref={ref}
        className={cn(avatarVariants({ size, shape }), className)}
        animate={animation ? avatarAnimation : undefined}
        whileHover={animation ? avatarAnimation.hover : undefined}
        {...props}
      >
        {src && !imageError && (
          <motion.img
            src={src}
            alt={alt}
            className={cn(
              "absolute inset-0 h-full w-full object-cover",
              shape === "circle" ? "rounded-full" : "rounded-md"
            )}
            onLoad={handleImageLoad}
            onError={handleImageError}
            initial={false}
            animate={imageLoaded ? "animate" : "initial"}
            variants={contentAnimation}
          />
        )}

        {(!src || imageError) && (
          <motion.div
            className={cn(
              "absolute inset-0 flex items-center justify-center",
              shape === "circle" ? "rounded-full" : "rounded-md"
            )}
            initial="initial"
            animate="animate"
            variants={contentAnimation}
          >
            {children || (
              <span className="font-semibold">
                {fallback || getInitials(alt)}
              </span>
            )}
          </motion.div>
        )}

        {src && !imageError && (
          <motion.div
            className={cn(
              "absolute inset-0 bg-gradient-to-br from-transparent to-black/20",
              shape === "circle" ? "rounded-full" : "rounded-md"
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: imageLoaded ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </motion.div>
    )
  }
)

Avatar.displayName = "Avatar"

interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

const AvatarFallback = React.forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted text-muted-foreground font-semibold text-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)

AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarFallback, avatarVariants }