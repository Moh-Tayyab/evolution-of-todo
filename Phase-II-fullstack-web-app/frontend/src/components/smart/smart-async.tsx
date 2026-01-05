"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * @spec: Smart Async Component with Embedded State Management
 * @description: Component wrapper with built-in loading/error/empty states
 */

export interface SmartAsyncProps<T> {
  query: () => Promise<T>;
  children: (data: T) => React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: (error: Error, retry: () => void) => React.ReactNode;
  emptyComponent?: React.ReactNode;
  isEmpty?: (data: T) => boolean;
  className?: string;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  retryOnMount?: boolean;
  refreshInterval?: number;
}

type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
};

/**
 * SmartAsync - Intelligent async component with built-in state management
 *
 * Embedded Intelligence:
 * - Automatic loading state
 * - Error handling with retry
 * - Empty state detection
 * - Auto-refresh with interval
 * - Abort controller for cleanup
 * - Framer Motion transitions
 */
export function SmartAsync<T>({
  query,
  children,
  loadingComponent,
  errorComponent,
  emptyComponent,
  isEmpty,
  className,
  onSuccess,
  onError,
  retryOnMount = false,
  refreshInterval,
}: SmartAsyncProps<T>) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const retryCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Execute query
  const executeQuery = useCallback(async () => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const result = await query();

      // Check if request was aborted
      if (abortControllerRef.current.signal.aborted) {
        return;
      }

      setState({ data: result, loading: false, error: null });
      onSuccess?.(result);
      retryCountRef.current = 0;
    } catch (error) {
      // Don't update state if request was aborted
      if (abortControllerRef.current.signal.aborted) {
        return;
      }

      const err =
        error instanceof Error
          ? error
          : new Error("An unexpected error occurred");

      setState((prev) => ({ ...prev, loading: false, error: err }));
      onError?.(err);
    }
  }, [query, onSuccess, onError]);

  // Retry function
  const retry = useCallback(() => {
    retryCountRef.current++;
    executeQuery();
  }, [executeQuery]);

  // Initial fetch and refresh interval
  useEffect(() => {
    executeQuery();

    // Set up refresh interval
    if (refreshInterval && refreshInterval > 0) {
      intervalRef.current = setInterval(executeQuery, refreshInterval);
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [executeQuery, refreshInterval]);

  // Determine if data is empty
  const isDataEmpty = state.data && isEmpty ? isEmpty(state.data) : false;

  return (
    <div className={cn("relative", className)}>
      <AnimatePresence mode="wait">
        {/* Loading State */}
        {state.loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-12"
          >
            {loadingComponent || (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-coral-600" />
                <p className="text-sm text-gray-600">Loading...</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Error State */}
        {!state.loading && state.error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="py-12"
          >
            {errorComponent ? (
              errorComponent(state.error, retry)
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Something went wrong
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {state.error.message || "An unexpected error occurred"}
                </p>
                <Button
                  onClick={retry}
                  variant="outline"
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try again
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* Empty State */}
        {!state.loading && !state.error && isDataEmpty && (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="py-12"
          >
            {emptyComponent || (
              <div className="text-center text-gray-500">
                <p>No data available</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Success State */}
        {!state.loading && !state.error && !isDataEmpty && state.data && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {children(state.data)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * SmartAsyncList - Async component for list data with built-in empty state
 */
export interface SmartAsyncListProps<T> {
  query: () => Promise<T[]>;
  children: (items: T[]) => React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: (error: Error, retry: () => void) => React.ReactNode;
  emptyComponent?: React.ReactNode;
  className?: string;
}

export function SmartAsyncList<T>({
  query,
  children,
  loadingComponent,
  errorComponent,
  emptyComponent,
  className,
}: SmartAsyncListProps<T>) {
  return (
    <SmartAsync
      query={query}
      isEmpty={(data) => data.length === 0}
      emptyComponent={
        emptyComponent || (
          <div className="text-center py-12">
            <p className="text-gray-500">No items found</p>
          </div>
        )
      }
      className={className}
    >
      {children}
    </SmartAsync>
  );
}

/**
 * useAsync - Hook for async state management
 */
export function useAsync<T>(
  query: () => Promise<T>,
  dependencies: any[] = []
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const executeQuery = useCallback(async () => {
    setState({ data: null, loading: true, error: null });

    try {
      const result = await query();
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (error) {
      const err =
        error instanceof Error
          ? error
          : new Error("An unexpected error occurred");
      setState((prev) => ({ ...prev, loading: false, error: err }));
      throw err;
    }
  }, [query]);

  useEffect(() => {
    executeQuery();
  }, dependencies);

  return {
    ...state,
    retry: executeQuery,
  };
}
