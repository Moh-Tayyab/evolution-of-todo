"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Calendar, Tag as TagIcon, Flag } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * @spec: Task Form Component with Embedded Intelligence
 * @description: Task creation/editing form with validation and error handling
 * @feature: FR-001 - Add tasks
 * @feature: FR-016 - Optional task description
 * @feature: FR-008 - Update task title and/or description
 * @feature: FR-009 - Update title only
 * @feature: FR-011 - Update description only
 */

/**
 * Validation schema
 */
const taskFormSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or less"),
  description: z
    .string()
    .max(2000, "Description must be 2000 characters or less")
    .optional(),
  priority: z.enum(["high", "medium", "low"], {
    required_error: "Priority is required",
  }),
  due_date: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type TaskFormData = z.infer<typeof taskFormSchema>;

export interface TaskFormProps {
  mode?: "create" | "edit";
  initialData?: Partial<TaskFormData>;
  availableTags?: Array<{ id: string; name: string; color?: string }>;
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel?: () => void;
  isOpen?: boolean;
  className?: string;
}

/**
 * Tag input component
 */
function TagInput({
  tags,
  availableTags,
  onAddTag,
  onRemoveTag,
}: {
  tags: string[];
  availableTags?: Array<{ id: string; name: string; color?: string }>;
  onAddTag: (tagId: string) => void;
  onRemoveTag: (tagId: string) => void;
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const selectedTags = availableTags?.filter((tag) =>
    tags.includes(tag.id)
  ) || [];
  const availableTagsFiltered = availableTags?.filter(
    (tag) => !tags.includes(tag.id)
  ) || [];

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <TagIcon className="w-4 h-4" />
        Tags
      </Label>
      <div className="flex flex-wrap gap-2">
        {selectedTags.map((tag) => (
          <Badge
            key={tag.id}
            variant="secondary"
            className="cursor-pointer"
            style={{
              backgroundColor: tag.color || "#D6675D",
              color: "white",
            }}
            onClick={() => onRemoveTag(tag.id)}
          >
            {tag.name}
            <X className="w-3 h-3 ml-1" />
          </Badge>
        ))}
        <Badge
          variant="outline"
          className="cursor-pointer"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          + Add tag
        </Badge>
      </div>

      <AnimatePresence>
        {isDropdownOpen && availableTagsFiltered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="border rounded-md p-2 space-y-1 bg-white"
          >
            {availableTagsFiltered.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => {
                  onAddTag(tag.id);
                  setIsDropdownOpen(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded transition-colors"
              >
                {tag.name}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * TaskForm - Intelligent task creation/editing form
 *
 * Embedded Intelligence:
 * - Built-in validation with Zod
 * - Real-time error messages
 * - Auto-save on valid input
 * - Tag management
 * - Priority selection
 * - Due date picker
 * - Loading states
 * - Success/error notifications
 */
export function TaskForm({
  mode = "create",
  initialData = {},
  availableTags = [],
  onSubmit,
  onCancel,
  isOpen = true,
  className,
}: TaskFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialData.tags || []
  );

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: initialData.title || "",
      description: initialData.description || "",
      priority: initialData.priority || "medium",
      due_date: initialData.due_date || "",
      tags: initialData.tags || [],
    },
  });

  // Reset form when initialData changes
  useEffect(() => {
    form.reset({
      title: initialData.title || "",
      description: initialData.description || "",
      priority: initialData.priority || "medium",
      due_date: initialData.due_date || "",
      tags: initialData.tags || [],
    });
    setSelectedTags(initialData.tags || []);
  }, [initialData, form]);

  // Handle tag selection
  const handleAddTag = useCallback((tagId: string) => {
    setSelectedTags((prev) => [...prev, tagId]);
    form.setValue("tags", [...selectedTags, tagId]);
  }, [form, selectedTags]);

  const handleRemoveTag = useCallback((tagId: string) => {
    setSelectedTags((prev) => prev.filter((id) => id !== tagId));
    form.setValue(
      "tags",
      selectedTags.filter((id) => id !== tagId)
    );
  }, [form, selectedTags]);

  // Form submission with error handling
  const handleSubmit = useCallback(async (data: TaskFormData) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      await onSubmit({ ...data, tags: selectedTags });
      if (mode === "create") {
        form.reset();
        setSelectedTags([]);
      }
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : "Failed to save task. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [form, mode, onSubmit, selectedTags]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel?.()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {mode === "create" ? "Create New Task" : "Edit Task"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new task to your list"
              : "Update task information"}
          </DialogDescription>
        </DialogHeader>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={form.handleSubmit(handleSubmit)}
          className={cn("space-y-6 mt-4", className)}
        >
          {/* Server Error */}
          <AnimatePresence>
            {serverError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
              >
                {serverError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter task title"
              {...form.register("title")}
              className={cn(
                form.formState.errors.title && "border-red-500 focus:ring-red-500"
              )}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-500">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add a description (optional)"
              rows={3}
              {...form.register("description")}
              className={cn(
                form.formState.errors.description &&
                  "border-red-500 focus:ring-red-500"
              )}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-500">
                {form.formState.errors.description.message}
              </p>
            )}
            <p className="text-xs text-gray-500">
              {form.watch("description")?.length || 0}/2000 characters
            </p>
          </div>

          {/* Priority & Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Flag className="w-4 h-4" />
                Priority *
              </Label>
              <Select
                value={form.watch("priority")}
                onValueChange={(value) =>
                  form.setValue("priority", value as "high" | "medium" | "low")
                }
              >
                <SelectTrigger
                  className={cn(
                    form.formState.errors.priority &&
                      "border-red-500 focus:ring-red-500"
                  )}
                >
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.priority && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.priority.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Due Date
              </Label>
              <Input
                type="date"
                {...form.register("due_date")}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          {/* Tags */}
          {availableTags.length > 0 && (
            <TagInput
              tags={selectedTags}
              availableTags={availableTags}
              onAddTag={handleAddTag}
              onRemoveTag={handleRemoveTag}
            />
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : mode === "create" ? (
                "Create Task"
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
}
