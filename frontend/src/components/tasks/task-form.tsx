"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "./index";

export interface TaskFormProps {
  onSubmit: (task: Omit<Task, "id" | "created_at" | "updated_at">) => void;
  onCancel?: () => void;
  mode?: "create" | "edit";
  initialData?: Task;
  availableTags?: Array<{ id: string; name: string; color: string; count?: number }>;
  isOpen?: boolean;
  onClose?: () => void;
}

export function TaskModal({
  onSubmit,
  onCancel,
  mode = "create",
  initialData,
  isOpen = false,
  onClose
}: TaskFormProps) {
  const [title, setTitle] = React.useState(initialData?.title || "");
  const [description, setDescription] = React.useState(initialData?.description || "");
  const [priority, setPriority] = React.useState<"high" | "medium" | "low">(
    initialData?.priority || "medium"
  );

  React.useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || "");
      setDescription(initialData?.description || "");
      setPriority(initialData?.priority || "medium");
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      completed: false,
      priority,
      tags: [],
      due_date: undefined,
      is_pinned: false,
    });

    // Reset form
    setTitle("");
    setDescription("");
    setPriority("medium");
    onClose?.();
  };

  const handleCancel = () => {
    setTitle("");
    setDescription("");
    setPriority("medium");
    onCancel?.();
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in"
        onClick={handleCancel}
      />

      {/* Modal */}
      <div className="relative z-50 w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-card rounded-xl shadow-lg border border-border">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">
              {mode === "edit" ? "Edit Task" : "Create New Task"}
            </h2>
            <button
              onClick={handleCancel}
              className="rounded-md p-1 hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                placeholder="What needs to be done?"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1.5">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all resize-none"
                placeholder="Add more details..."
              />
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-foreground mb-1.5">
                Priority
              </label>
              <div className="flex gap-2">
                {([
                  { value: "low", label: "Low", color: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" },
                  { value: "medium", label: "Medium", color: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
                  { value: "high", label: "High", color: "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800" },
                ] as const).map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value)}
                    className={cn(
                      "flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-all",
                      priority === p.value
                        ? p.color + " border-current"
                        : "bg-background text-muted-foreground border-border hover:border-muted-foreground/50"
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                {mode === "edit" ? "Save Changes" : "Create Task"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Keep the old TaskForm for backward compatibility
export function TaskForm({ onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [priority, setPriority] = React.useState<"high" | "medium" | "low">("medium");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      completed: false,
      priority,
      tags: [],
      due_date: undefined,
      is_pinned: false,
    });
    setTitle("");
    setDescription("");
    setPriority("medium");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-card border border-border rounded-lg">
      <h3 className="text-lg font-semibold">Create New Task</h3>
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Title *
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-3 py-2 border border-input rounded-md bg-background"
          placeholder="Enter task title..."
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-input rounded-md bg-background"
          placeholder="Enter task description..."
        />
      </div>
      <div>
        <label htmlFor="priority" className="block text-sm font-medium mb-1">
          Priority
        </label>
        <select
          id="priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as "high" | "medium" | "low")}
          className="w-full px-3 py-2 border border-input rounded-md bg-background"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Create Task
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
