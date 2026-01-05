"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/**
 * @spec: Search Input Component with Embedded Debouncing
 * @description: Search input with debounced callback and loading state
 * @feature: FR-015 - Search tasks by keyword
 */

export interface SearchInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void | Promise<void>;
  placeholder?: string;
  debounceMs?: number;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  showClearButton?: boolean;
  autoFocus?: boolean;
}

/**
 * SearchInput - Intelligent search input with debouncing
 *
 * Embedded Intelligence:
 * - Configurable debounce delay (default 300ms)
 * - Automatic search execution on debounce
 * - Clear button with animation
 * - Loading state indicator
 * - Keyboard shortcuts (Esc to clear, Enter to search immediately)
 * - Focus management
 */
export function SearchInput({
  value: controlledValue,
  onChange,
  onSearch,
  placeholder = "Search...",
  debounceMs = 300,
  isLoading = false,
  disabled = false,
  className,
  size = "md",
  showClearButton = true,
  autoFocus = false,
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Support both controlled and uncontrolled modes
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  // Ref for timeout to prevent stale closures
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Debounced search handler
  const debouncedSearch = useCallback(
    (searchValue: string) => {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        onSearch?.(searchValue);
      }, debounceMs);
    },
    [onSearch, debounceMs]
  );

  // Immediate search handler (bypasses debounce)
  const handleImmediateSearch = useCallback(
    (searchValue: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      onSearch?.(searchValue);
    },
    [onSearch]
  );

  // Input change handler
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;

      // Update value
      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);

      // Trigger debounced search
      debouncedSearch(newValue);
    },
    [controlledValue, onChange, debouncedSearch]
  );

  // Clear search
  const handleClear = useCallback(() => {
    if (controlledValue === undefined) {
      setInternalValue("");
    }
    onChange?.("");
    handleImmediateSearch("");
    inputRef.current?.focus();
  }, [controlledValue, onChange, handleImmediateSearch]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        handleClear();
      } else if (e.key === "Enter") {
        handleImmediateSearch(value);
      }
    },
    [value, handleClear, handleImmediateSearch]
  );

  const sizeStyles = {
    sm: "h-8 text-sm",
    md: "h-10 text-base",
    lg: "h-12 text-lg",
  };

  const iconSize = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div
      className={cn(
        "relative flex items-center",
        size === "lg" && "gap-3",
        className
      )}
    >
      {/* Search Icon */}
      <Search
        className={cn(
          "absolute left-3 text-gray-400 pointer-events-none",
          iconSize[size]
        )}
      />

      {/* Input */}
      <Input
        ref={inputRef}
        type="search"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        disabled={disabled || isLoading}
        className={cn(
          "pl-10 pr-20",
          sizeStyles[size],
          isFocused && "ring-2 ring-coral-500 border-coral-500"
        )}
      />

      {/* Right Side Actions */}
      <div className="absolute right-2 flex items-center gap-1">
        {/* Loading Indicator */}
        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center justify-center w-6 h-6"
            >
              <Loader2 className={cn("animate-spin text-gray-400", iconSize[size])} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Clear Button */}
        <AnimatePresence mode="wait">
          {showClearButton && value && !isLoading && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleClear}
              className={cn(
                "flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors",
                size === "sm" ? "w-6 h-6" : "w-8 h-8"
              )}
              aria-label="Clear search"
            >
              <X className={iconSize[size]} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * SearchInputWithButton - Search input with explicit search button
 */
export function SearchInputWithButton({
  onSearch,
  ...props
}: SearchInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleSearch = useCallback(() => {
    onSearch?.(inputValue);
  }, [inputValue, onSearch]);

  return (
    <div className="flex gap-2">
      <SearchInput
        {...props}
        value={inputValue}
        onChange={setInputValue}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch();
          }
        }}
        className="flex-1"
      />
      <Button
        onClick={handleSearch}
        className="bg-gradient-to-r from-coral-500 to-coral-600"
      >
        Search
      </Button>
    </div>
  );
}
