'use client';

// @spec: specs/002-fullstack-web-app/spec.md
// @spec: specs/002-fullstack-web-app/plan.md
// Reduced motion provider for accessibility

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

/**
 * Reduced motion context type
 */
interface ReducedMotionContextType {
  prefersReducedMotion: boolean;
  setReducedMotion: (reduced: boolean) => void;
}

const ReducedMotionContext = createContext<ReducedMotionContextType | undefined>(undefined);

/**
 * Props for ReducedMotionProvider
 */
interface ReducedMotionProviderProps {
  children: ReactNode;
  defaultReduced?: boolean;
}

/**
 * @spec: ReducedMotionProvider - Context provider for reduced motion preferences
 * Detects system preference and allows manual override
 */
export const ReducedMotionProvider: React.FC<ReducedMotionProviderProps> = ({
  children,
  defaultReduced = false,
}) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(defaultReduced);
  const [manualOverride, setManualOverride] = useState(false);

  useEffect(() => {
    // Check system preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const updateMotionPreference = (e: MediaQueryListEvent | MediaQueryList) => {
      if (!manualOverride) {
        setPrefersReducedMotion(e.matches);
      }
    };

    // Set initial value
    updateMotionPreference(mediaQuery);

    // Listen for changes
    mediaQuery.addEventListener('change', updateMotionPreference);

    return () => {
      mediaQuery.removeEventListener('change', updateMotionPreference);
    };
  }, [manualOverride]);

  const setReducedMotion = (reduced: boolean) => {
    setPrefersReducedMotion(reduced);
    setManualOverride(true);
  };

  // Apply reduced motion class to document
  useEffect(() => {
    if (prefersReducedMotion) {
      document.documentElement.classList.add('reduce-motion');
      document.documentElement.style.setProperty('--animation-duration', '0ms');
    } else {
      document.documentElement.classList.remove('reduce-motion');
      document.documentElement.style.removeProperty('--animation-duration');
    }
  }, [prefersReducedMotion]);

  const value: ReducedMotionContextType = {
    prefersReducedMotion,
    setReducedMotion,
  };

  return (
    <ReducedMotionContext.Provider value={value}>
      {children}
    </ReducedMotionContext.Provider>
  );
};

/**
 * @spec: Hook to use reduced motion context
 */
export const useReducedMotionContext = (): ReducedMotionContextType => {
  const context = useContext(ReducedMotionContext);

  if (context === undefined) {
    throw new Error('useReducedMotionContext must be used within ReducedMotionProvider');
  }

  return context;
};

/**
 * @spec: Hook to check if reduced motion is preferred
 * Convenience hook that returns only the boolean value
 */
export const usePrefersReducedMotion = (): boolean => {
  const { prefersReducedMotion } = useReducedMotionContext();
  return prefersReducedMotion;
};

/**
 * Props for ReducedMotionToggle component
 */
interface ReducedMotionToggleProps {
  className?: string;
  showLabel?: boolean;
}

/**
 * @spec: ReducedMotionToggle - Toggle button for reduced motion
 * UI component to let users manually toggle animations
 */
export const ReducedMotionToggle: React.FC<ReducedMotionToggleProps> = ({
  className = '',
  showLabel = true,
}) => {
  const { prefersReducedMotion, setReducedMotion } = useReducedMotionContext();

  return (
    <button
      onClick={() => setReducedMotion(!prefersReducedMotion)}
      className={`
        inline-flex items-center gap-2 px-3 py-2 rounded-lg
        bg-secondary/10 hover:bg-secondary/20
        text-secondary-foreground text-sm font-medium
        transition-colors duration-200
        ${className}
      `}
      aria-label={prefersReducedMotion ? 'Enable animations' : 'Disable animations'}
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        {prefersReducedMotion ? (
          // Motion off icon
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
          />
        ) : (
          // Motion on icon
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
          />
        )}
      </svg>
      {showLabel && (
        <span>
          {prefersReducedMotion ? 'Animations Off' : 'Animations On'}
        </span>
      )}
    </button>
  );
};

/**
 * Props for ReducedMotionWrapper component
 */
interface ReducedMotionWrapperProps {
  children: ReactNode;
  reduced: ReactNode;
  normal: ReactNode;
}

/**
 * @spec: ReducedMotionWrapper - Conditionally render based on motion preference
 */
export const ReducedMotionWrapper: React.FC<ReducedMotionWrapperProps> = ({
  reduced,
  normal,
}) => {
  const { prefersReducedMotion } = useReducedMotionContext();

  return <>{prefersReducedMotion ? reduced : normal}</>;
};

/**
 * Hook for conditional animation values
 */
export const useAnimationValue = <T,>(normalValue: T, reducedValue: T): T => {
  const { prefersReducedMotion } = useReducedMotionContext();
  return prefersReducedMotion ? reducedValue : normalValue;
};

/**
 * Hook for conditional animation classes
 */
export const useAnimationClass = (
  normalClass: string,
  reducedClass: string = ''
): string => {
  const { prefersReducedMotion } = useReducedMotionContext();
  return prefersReducedMotion ? reducedClass : normalClass;
};
