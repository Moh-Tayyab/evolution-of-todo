"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  AlertCircle,
  MoreVertical,
  Pin,
  Archive,
  Trash2,
  Edit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { GSAPScrollReveal } from "@/components/ui/gsap-scroll-reveal";

/**
 * @spec: Task Card Component with Embedded Intelligence
 * @description: Individual task display with optimistic updates and animations
 * @feature: FR-003 - View tasks
 * @feature: FR-005 - Mark tasks as complete
 * @feature: FR-006 - Toggle task completion status
 * @feature: FR-008 - Update task information
 */

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  priority: "high" | "medium" | "low";
  completed: boolean;
  tags?: Array<{ id: string; name: string; color?: string }>;
  due_date?: string | null;
  created_at: string;
  is_pinned?: boolean;
}

export interface TaskCardProps {
  task: Task;
  onToggle?: (taskId: string) => Promise<void>;
  onDelete?: (taskId: string) => Promise<void>;
  onPin?: (taskId: string) => Promise<void>;
  onArchive?: (taskId: string) => Promise<void>;
  onEdit?: (task: Task) => void;
  className?: string;
  variant?: "default" | "compact" | "detailed";
}

/**
 * Priority configuration
 */
const priorityConfig = {
  high: {
    label: "High",
    color: "bg-red-100 text-red-700 border-red-200",
    icon: AlertCircle,
  },
  medium: {
    label: "Medium",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    icon: null,
  },
  low: {
    label: "Low",
    color: "bg-gray-100 text-gray-700 border-gray-200",
    icon: null,
  },
};

/**
 * TaskCard - Intelligent task card component
 *
 * Embedded Intelligence:
 * - Optimistic updates for completion toggle
 * - Local state management for UI interactions
 * - Automatic rollback on error
 * - Expand/collapse for details
 * - Framer Motion + GSAP animations
 * - Responsive design
 */
export function TaskCard({
  task,
  onToggle,
  onDelete,
  onPin,
  onArchive,
  onEdit,
  className,
  variant = "default",
}: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCompleted, setIsCompleted] = useState(task.completed);
  const [isPending, setIsPending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Optimistic toggle with rollback
  const handleToggle = useCallback(async () => {
    if (!onToggle || isPending) return;

    const previousState = isCompleted;
    setIsCompleted(!previousState);
    setIsPending(true);

    try {
      await onToggle(task.id);
    } catch (error) {
      // Rollback on error
      setIsCompleted(previousState);
      console.error("Failed to toggle task:", error);
    } finally {
      setIsPending(false);
    }
  }, [isCompleted, isPending, onToggle, task.id]);

  // Delete with animation
  const handleDelete = useCallback(async () => {
    if (!onDelete || isDeleting) return;

    setIsDeleting(true);
    try {
      await onDelete(task.id);
    } catch (error) {
      setIsDeleting(false);
      console.error("Failed to delete task:", error);
    }
  }, [onDelete, isDeleting, task.id]);

  // Pin task
  const handlePin = useCallback(async () => {
    if (!onPin) return;
    try {
      await onPin(task.id);
    } catch (error) {
      console.error("Failed to pin task:", error);
    }
  }, [onPin, task.id]);

  // Archive task
  const handleArchive = useCallback(async () => {
    if (!onArchive) return;
    try {
      await onArchive(task.id);
    } catch (error) {
      console.error("Failed to archive task:", error);
    }
  }, [onArchive, task.id]);

  // Edit task
  const handleEdit = useCallback(() => {
    onEdit?.(task);
  }, [task, onEdit]);

  const priority = priorityConfig[task.priority];
  const hasDetails = task.description || (task.tags && task.tags.length > 0);

  return (
    <AnimatePresence mode="wait">
      {!isDeleting && (
        <GSAPScrollReveal direction="up" className={className}>
          <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card
              className={cn(
                "transition-all duration-300",
                isCompleted && "opacity-75",
                task.is_pinned && "ring-2 ring-coral-500",
                "hover:shadow-lg"
              )}
            >
              <CardHeader className={cn(
                "p-4",
                variant === "compact" && "pb-2"
              )}>
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Checkbox
                      checked={isCompleted}
                      onCheckedChange={handleToggle}
                      disabled={isPending}
                      className="mt-1"
                    />
                  </motion.div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle
                        className={cn(
                          "text-base font-semibold transition-all",
                          isCompleted && "line-through text-gray-400"
                        )}
                      >
                        {task.title}
                        {task.is_pinned && (
                          <Pin className="inline-block w-4 h-4 ml-2 text-coral-500" />
                        )}
                      </CardTitle>

                      {/* Actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={handleEdit}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={handlePin}>
                            <Pin className="w-4 h-4 mr-2" />
                            {task.is_pinned ? "Unpin" : "Pin"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={handleArchive}>
                            <Archive className="w-4 h-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={handleDelete}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {variant !== "compact" && (
                      <CardDescription className="mt-1 flex items-center gap-2 text-sm">
                        {/* Priority Badge */}
                        <Badge
                          variant="outline"
                          className={cn("text-xs", priority.color)}
                        >
                          {priority.label}
                          {priority.icon && (
                            <priority.icon className="w-3 h-3 ml-1" />
                          )}
                        </Badge>

                        {/* Due Date */}
                        {task.due_date && (
                          <span className="flex items-center gap-1 text-gray-500">
                            <Clock className="w-3 h-3" />
                            {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>

              {/* Expandable Details */}
              {variant === "detailed" && hasDetails && (
                <CardContent className="px-4 pb-4">
                  <motion.div
                    initial={false}
                    animate={{
                      height: isExpanded ? "auto" : 0,
                      opacity: isExpanded ? 1 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    {task.description && (
                      <p className="text-sm text-gray-600 mb-3">
                        {task.description}
                      </p>
                    )}
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {task.tags.map((tag) => (
                          <Badge
                            key={tag.id}
                            variant="secondary"
                            className="text-xs"
                            style={{
                              backgroundColor: tag.color || "#D6675D",
                              color: "white",
                            }}
                          >
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </motion.div>

                  {/* Expand Button */}
                  {hasDetails && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="w-full mt-2 text-gray-500"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-4 h-4 mr-1" />
                          Show less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 mr-1" />
                          Show more
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              )}
            </Card>
          </motion.div>
        </GSAPScrollReveal>
      )}
    </AnimatePresence>
  );
}

/**
 * TaskCardCompact - Compact variant for mobile
 */
export function TaskCardCompact(props: TaskCardProps) {
  return <TaskCard {...props} variant="compact" />;
}

/**
 * TaskCardDetailed - Detailed variant with full info
 */
export function TaskCardDetailed(props: TaskCardProps) {
  return <TaskCard {...props} variant="detailed" />;
}
