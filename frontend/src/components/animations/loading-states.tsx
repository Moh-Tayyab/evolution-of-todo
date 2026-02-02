'use client';

// @spec: specs/002-fullstack-web-app/spec.md
// @spec: specs/002-fullstack-web-app/plan.md
// Loading state components using CSS animations

import React from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * Props for LoadingSpinner component
 */
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'accent' | 'muted';
  className?: string;
}

/**
 * @spec: LoadingSpinner - Classic spinning loader
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
}) => {
  const prefersReducedMotion = useReducedMotion();

  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-[5px]',
  };

  const colorClasses = {
    primary: 'border-primary border-t-transparent',
    secondary: 'border-secondary border-t-transparent',
    accent: 'border-accent border-t-transparent',
    muted: 'border-muted-foreground border-t-transparent',
  };

  return (
    <div
      className={`
        rounded-full animate-spin
        ${sizeClasses[size]}
        ${colorClasses[color]}
        ${prefersReducedMotion ? 'animate-none' : ''}
        ${className}
      `}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

/**
 * Props for PulseLoader component
 */
interface PulseLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'accent' | 'muted';
  className?: string;
}

/**
 * @spec: PulseLoader - Pulsing dot loader
 */
export const PulseLoader: React.FC<PulseLoaderProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
}) => {
  const prefersReducedMotion = useReducedMotion();

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const colorClasses = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    accent: 'bg-accent',
    muted: 'bg-muted-foreground',
  };

  return (
    <div className={`flex items-center gap-2 ${className}`} role="status" aria-label="Loading">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`
            rounded-full
            ${sizeClasses[size]}
            ${colorClasses[color]}
            ${prefersReducedMotion ? '' : 'animate-pulse'}
          `}
          style={
            prefersReducedMotion
              ? {}
              : { animationDelay: `${i * 0.15}s`, animationDuration: '1.4s' }
          }
        />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
};

/**
 * Props for Skeleton component
 */
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

/**
 * @spec: Skeleton - Content placeholder loader
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}) => {
  const prefersReducedMotion = useReducedMotion();

  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  };

  const animationClass = prefersReducedMotion
    ? ''
    : animation === 'pulse'
    ? 'animate-pulse'
    : 'animate-shimmer';

  return (
    <div
      className={`
        bg-muted
        ${variantClasses[variant]}
        ${animationClass}
        ${className}
      `}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
};

/**
 * Props for SkeletonList component
 */
interface SkeletonListProps {
  count?: number;
  className?: string;
}

/**
 * @spec: SkeletonList - List of skeleton loaders
 */
export const SkeletonList: React.FC<SkeletonListProps> = ({
  count = 5,
  className = '',
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-[60%]" />
          <Skeleton className="h-3 w-[40%]" />
        </div>
      ))}
    </div>
  );
};

/**
 * Props for BarLoader component
 */
interface BarLoaderProps {
  width?: string | number;
  height?: string | number;
  color?: 'primary' | 'secondary' | 'accent' | 'muted';
  className?: string;
}

/**
 * @spec: BarLoader - Horizontal progress bar loader
 */
export const BarLoader: React.FC<BarLoaderProps> = ({
  width = '100%',
  height = '4px',
  color = 'primary',
  className = '',
}) => {
  const prefersReducedMotion = useReducedMotion();

  const colorClasses = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    accent: 'bg-accent',
    muted: 'bg-muted-foreground',
  };

  return (
    <div
      className={`overflow-hidden rounded-full bg-muted ${className}`}
      style={{ width, height }}
      role="status"
      aria-label="Loading"
    >
      <div
        className={`
          h-full rounded-full
          ${colorClasses[color]}
          ${prefersReducedMotion ? '' : 'animate-progress'}
        `}
        style={{
          width: '40%',
          transformOrigin: 'left',
        }}
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
};

/**
 * Props for WaveLoader component
 */
interface WaveLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'accent' | 'muted';
  className?: string;
}

/**
 * @spec: WaveLoader - Wave animation loader
 */
export const WaveLoader: React.FC<WaveLoaderProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
}) => {
  const prefersReducedMotion = useReducedMotion();

  const sizeClasses = {
    sm: 'w-1.5 h-6',
    md: 'w-2 h-8',
    lg: 'w-2.5 h-10',
  };

  const colorClasses = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    accent: 'bg-accent',
    muted: 'bg-muted-foreground',
  };

  return (
    <div className={`flex items-end gap-1 ${className}`} role="status" aria-label="Loading">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`
            rounded-sm
            ${sizeClasses[size]}
            ${colorClasses[color]}
            ${prefersReducedMotion ? '' : 'animate-wave'}
          `}
          style={
            prefersReducedMotion
              ? {}
              : {
                  animationDelay: `${i * 0.1}s`,
                }
          }
        />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
};

/**
 * Props for DotsLoader component
 */
interface DotsLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'accent' | 'muted';
  className?: string;
}

/**
 * @spec: DotsLoader - Bouncing dots loader
 */
export const DotsLoader: React.FC<DotsLoaderProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
}) => {
  const prefersReducedMotion = useReducedMotion();

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const colorClasses = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    accent: 'bg-accent',
    muted: 'bg-muted-foreground',
  };

  return (
    <div className={`flex items-center gap-2 ${className}`} role="status" aria-label="Loading">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`
            rounded-full
            ${sizeClasses[size]}
            ${colorClasses[color]}
            ${prefersReducedMotion ? '' : 'animate-bounce'}
          `}
          style={
            prefersReducedMotion
              ? {}
              : {
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: '0.6s',
                }
          }
        />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
};

/**
 * Props for SpinnerWithText component
 */
interface SpinnerWithTextProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'accent' | 'muted';
  className?: string;
}

/**
 * @spec: SpinnerWithText - Spinner with accompanying text
 */
export const SpinnerWithText: React.FC<SpinnerWithTextProps> = ({
  text = 'Loading...',
  size = 'md',
  color = 'primary',
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <LoadingSpinner size={size} color={color} />
      <span className="text-sm text-muted-foreground">{text}</span>
    </div>
  );
};

/**
 * Props for FullPageLoader component
 */
interface FullPageLoaderProps {
  text?: string;
  spinner?: boolean;
  className?: string;
}

/**
 * @spec: FullPageLoader - Full-screen loading overlay
 */
export const FullPageLoader: React.FC<FullPageLoaderProps> = ({
  text = 'Loading...',
  spinner = true,
  className = '',
}) => {
  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center
        bg-background/80 backdrop-blur-sm
        ${className}
      `}
      role="status"
      aria-label="Loading"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4">
        {spinner && <LoadingSpinner size="lg" />}
        {text && <p className="text-sm text-muted-foreground">{text}</p>}
      </div>
    </div>
  );
};

/**
 * Props for InlineLoader component
 */
interface InlineLoaderProps {
  text?: string;
  className?: string;
}

/**
 * @spec: InlineLoader - Compact inline loading indicator
 */
export const InlineLoader: React.FC<InlineLoaderProps> = ({
  text = 'Loading',
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LoadingSpinner size="sm" />
      <span className="text-xs text-muted-foreground">{text}</span>
    </div>
  );
};

/**
 * Props for CardSkeleton component
 */
interface CardSkeletonProps {
  className?: string;
  showAvatar?: boolean;
  lines?: number;
}

/**
 * @spec: CardSkeleton - Card-shaped skeleton loader
 */
export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  className = '',
  showAvatar = true,
  lines = 3,
}) => {
  return (
    <div className={`p-4 rounded-lg border bg-card ${className}`}>
      {showAvatar && (
        <div className="flex items-center gap-3 mb-4">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex-1">
            <Skeleton className="h-4 w-[60%] mb-2" />
            <Skeleton className="h-3 w-[40%]" />
          </div>
        </div>
      )}
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-4"
            width={i === lines - 1 ? '70%' : '100%'}
          />
        ))}
      </div>
    </div>
  );
};
