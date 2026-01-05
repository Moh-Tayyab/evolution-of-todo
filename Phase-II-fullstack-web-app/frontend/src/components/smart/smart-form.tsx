"use client";

import { useState, useCallback, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { z } from "zod";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

/**
 * @spec: Smart Form Component with Embedded Intelligence
 * @description: Reusable form with validation, error handling, and submission management
 */

export interface SmartFormProps<T extends Record<string, any>> {
  schema: z.ZodSchema<T>;
  onSubmit: (data: T) => Promise<void>;
  defaultValues?: Partial<T>;
  children: React.ReactNode;
  submitLabel?: string;
  submitVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  submitClassName?: string;
  className?: string;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  resetOnSuccess?: boolean;
  showSuccessMessage?: boolean;
}

interface SmartFormContextValue<T extends Record<string, any>> {
  isSubmitting: boolean;
  serverError: string | null;
  clearServerError: () => void;
}

const SmartFormContext = createContext<SmartFormContextValue<any> | null>(null);

export function useSmartForm() {
  const context = useContext(SmartFormContext);
  if (!context) {
    throw new Error("useSmartForm must be used within SmartForm");
  }
  return context;
}

/**
 * SmartForm - Intelligent form component with embedded validation and submission handling
 *
 * Embedded Intelligence:
 * - Built-in validation with Zod
 * - Real-time error messages
 * - Loading states during submission
 * - Server error handling
 * - Success feedback
 * - Auto-reset on success
 * - Toast notifications
 */
export function SmartForm<T extends Record<string, any>>({
  schema,
  onSubmit,
  defaultValues = {},
  children,
  submitLabel = "Submit",
  submitVariant = "default",
  submitClassName,
  className,
  onSuccess,
  onError,
  resetOnSuccess = false,
  showSuccessMessage = true,
}: SmartFormProps<T>) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();

  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as T,
  });

  // Clear server error when user types
  const clearServerError = useCallback(() => {
    setServerError(null);
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(
    async (data: T) => {
      setIsSubmitting(true);
      setServerError(null);

      try {
        await onSubmit(data);

        // Success handling
        if (showSuccessMessage) {
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
        }

        toast({
          title: "Success!",
          description: "Your changes have been saved.",
          variant: "default",
        });

        onSuccess?.(data);

        if (resetOnSuccess) {
          form.reset();
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again.";

        setServerError(errorMessage);

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });

        onError?.(error instanceof Error ? error : new Error(errorMessage));
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit, onSuccess, onError, resetOnSuccess, form, showSuccessMessage, toast]
  );

  return (
    <SmartFormContext.Provider
      value={{ isSubmitting, serverError, clearServerError }}
    >
      <FormProvider {...form}>
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={form.handleSubmit(handleSubmit)}
          className={cn("space-y-6", className)}
        >
          {/* Server Error */}
          <AnimatePresence mode="wait">
            {serverError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-red-800">Error</h4>
                  <p className="text-sm text-red-700 mt-1">{serverError}</p>
                </div>
                <button
                  onClick={clearServerError}
                  className="text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Message */}
          <AnimatePresence mode="wait">
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-green-800">Success!</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Your changes have been saved successfully.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Fields */}
          {children}

          {/* Submit Button */}
          <Button
            type="submit"
            variant={submitVariant}
            className={cn(
              "w-full",
              isSubmitting && "opacity-80 cursor-not-allowed",
              submitClassName
            )}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </motion.form>
      </FormProvider>
    </SmartFormContext.Provider>
  );
}

/**
 * SmartFormField - Form field with automatic error display
 */
export interface SmartFormFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  type?: string;
  description?: string;
  required?: boolean;
  className?: string;
}

export function SmartFormField({
  name,
  label,
  placeholder,
  type = "text",
  description,
  required = false,
  className,
}: SmartFormFieldProps) {
  const { isSubmitting, serverError, clearServerError } = useSmartForm();
  const form = useForm();
  const {
    register,
    formState: { errors },
  } = form;

  const error = errors[name]?.message as string | undefined;

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        disabled={isSubmitting}
        {...register(name)}
        onChange={(e) => {
          register(name).onChange(e);
          clearServerError();
        }}
        className={cn(
          "w-full px-3 py-2 border rounded-md transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent",
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300",
          isSubmitting && "opacity-50 cursor-not-allowed"
        )}
      />
      {description && !error && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-600"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

/**
 * SmartFormActions - Container for form action buttons
 */
export function SmartFormActions({ children }: { children: React.ReactNode }) {
  const { isSubmitting } = useSmartForm();

  return (
    <div className="flex gap-3">
      {children}
      <Button
        type="button"
        variant="outline"
        disabled={isSubmitting}
        onClick={() => window.history.back()}
      >
        Cancel
      </Button>
    </div>
  );
}
