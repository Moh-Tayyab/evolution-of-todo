// @spec: specs/003-modern-ui-ux/spec.md
// @spec: specs/003-modern-ui-ux/plan.md
// Animated Task Item component with modern interactions

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useHoverScale } from "@/lib/animations";
import { AnimatedCheckmark } from "@/components/ui/micro-interactions";
import { TagChip } from "./TagChip";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, Clock } from "lucide-react";
import type { Task } from "@/types";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export default function TaskItem({ task, onToggle, onEdit, onDelete }: TaskItemProps) {
  const [isToggling, setIsToggling] = useState(false);
  const hoverAnimation = useHoverScale(1.01);

  const handleToggle = async () => {
    if (isToggling) return;
    setIsToggling(true);
    try {
      await onToggle(task.id);
    } finally {
      setIsToggling(false);
    }
  };

  const priorityColors = {
    high: "bg-red-50 text-red-700 border-red-200",
    medium: "bg-orange-50 text-orange-700 border-orange-200",
    low: "bg-blue-50 text-blue-700 border-blue-200",
  };

  return (
    <motion.div
      {...hoverAnimation}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="bg-white/80 backdrop-blur-sm border border-zinc-100 rounded-2xl p-5 hover:shadow-xl hover:shadow-zinc-200/50 hover:border-zinc-200 transition-all duration-300 group mb-4"
    >
      <div className="flex items-start gap-4">
        {/* Checkbox with draw animation */}
        <button
          onClick={handleToggle}
          disabled={isToggling}
          className="mt-1 flex-shrink-0 focus:outline-none disabled:opacity-50"
        >
          <AnimatedCheckmark checked={task.completed} />
        </button>

        {/* Task content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-1">
            <h3
              className={cn(
                "text-lg font-bold transition-all duration-300",
                task.completed ? "text-zinc-400 line-through decoration-2" : "text-zinc-900"
              )}
            >
              {task.title}
            </h3>

            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Badge variant="outline" className={cn("text-[10px] uppercase font-bold", priorityColors[task.priority])}>
                {task.priority}
              </Badge>

              {task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 ml-1">
                  {task.tags.map((tag) => (
                    <TagChip key={tag.id} tag={tag} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {task.description && (
            <p
              className={cn(
                "mt-3 text-sm leading-relaxed",
                task.completed ? "text-zinc-400" : "text-zinc-600"
              )}
            >
              {task.description}
            </p>
          )}

          <div className="mt-4 pt-4 border-t border-zinc-50 flex items-center gap-1 text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
             <Clock className="h-3 w-3" />
             Created on {new Date(task.created_at).toLocaleDateString()}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
          <button
            onClick={() => onEdit(task)}
            className="text-zinc-400 hover:text-primary-500 p-2 hover:bg-zinc-100 rounded-xl transition-all active:scale-90"
            title="Edit task"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(task)}
            className="text-zinc-400 hover:text-red-500 p-2 hover:bg-zinc-100 rounded-xl transition-all active:scale-90"
            title="Delete task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
