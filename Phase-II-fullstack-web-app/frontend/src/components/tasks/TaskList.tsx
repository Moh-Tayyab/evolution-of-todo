// @spec: specs/003-modern-ui-ux/spec.md
// @spec: specs/003-modern-ui-ux/plan.md
// Task list component with reordering and entrance animations

"use client";

import { motion, AnimatePresence, Reorder } from "framer-motion";
import TaskItem from "./TaskItem";
import type { Task } from "@/types";
import { staggerContainer } from "@/lib/animations";

interface TaskListProps {
  tasks: Task[];
  onToggle: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onReorder?: (newTasks: Task[]) => void;
}

export default function TaskList({ tasks, onToggle, onEdit, onDelete, onReorder }: TaskListProps) {
  if (onReorder) {
    return (
      <Reorder.Group
        axis="y"
        values={tasks}
        onReorder={onReorder}
        className="space-y-4"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {tasks.map((task) => (
            <Reorder.Item
              key={task.id}
              value={task}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.2 }}
            >
              <TaskItem
                task={task}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-1"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
