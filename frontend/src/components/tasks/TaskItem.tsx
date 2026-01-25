// @spec: specs/002-fullstack-web-app/spec.md
// @spec: specs/002-fullstack-web-app/plan.md
// Task item component

"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { Task } from "@/types";

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export default function TaskItem({ task, onToggle, onEdit, onDelete }: TaskItemProps) {
  const [isToggling, setIsToggling] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Animation variants
  const checkboxVariants = {
    unchecked: {
      scale: 1,
      borderColor: task.priority === "high" ? ["#ef4444", "#6366f1"] : "#cbd5e1",
      borderWidth: "2px",
    },
    checked: {
      scale: 1.1,
      borderColor: "#6366f1",
      backgroundColor: "#6366f1",
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.1 },
    },
  };

  const textVariants = {
    unchecked: {
      opacity: 1,
      scale: 1,
    },
    checked: {
      opacity: 0.5,
      scale: 0.98,
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
    exit: {
      opacity: 0,
      x: -100,
      transition: {
        duration: 0.2,
      },
    },
  };

  const handleToggle = async () => {
    if (isToggling) return;
    setIsToggling(true);
    try {
      await onToggle(task.id);
    } finally {
      setIsToggling(false);
    }
  };

  const getCheckboxClassName = () => {
    const base = "mt-1 flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50";
    if (task.completed) {
      return `${base} border-indigo-500 bg-indigo-500`;
    }
    if (task.priority === "high") {
      return `${base} border-red-500 bg-transparent hover:border-indigo-500`;
    }
    return `${base} border-slate-300 dark:border-slate-600 bg-transparent hover:border-indigo-500 dark:hover:border-indigo-500`;
  };

  return (
    <AnimatePresence>
      <motion.div
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-slate-600 transition-colors duration-300 group"
        variants={prefersReducedMotion ? {} : cardVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        whileHover={!prefersReducedMotion ? { y: -2, boxShadow: "0 8px 25px -5px rgba(0, 0, 0, 0.1)" } : {}}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-start gap-4">
          {/* Animated Checkbox */}
          <motion.button
            onClick={handleToggle}
            disabled={isToggling}
            className={getCheckboxClassName()}
            variants={checkboxVariants}
            initial={task.completed ? "checked" : "unchecked"}
            animate={task.completed ? "checked" : "unchecked"}
            whileHover={!prefersReducedMotion && !task.completed ? "hover" : undefined}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <AnimatePresence mode="wait">
              {task.completed && (
                <motion.svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 01-1.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </motion.svg>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Task content */}
          <motion.div
            className="flex-1 min-w-0"
            variants={textVariants}
            animate={task.completed ? "checked" : "unchecked"}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col gap-1">
              <motion.h3
                className={`text-lg font-bold ${task.completed ? "text-monza-400 dark:text-monza-500 line-through" : "text-monza-900 dark:text-slate-100"
                  }`}
                layout
              >
                {task.title}
              </motion.h3>

              <div className="flex flex-wrap items-center gap-2 mt-1">
                {/* Priority indicator */}
                <motion.span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${task.priority === "high"
                      ? "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50"
                      : task.priority === "medium"
                        ? "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/50"
                        : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50"
                    }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                >
                  {task.priority}
                </motion.span>

                <AnimatePresence>
                  {task.tags && task.tags.length > 0 && (
                    <>
                      {task.tags.map((tag, index) => (
                        <motion.span
                          key={tag.id}
                          className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border border-slate-200 dark:border-slate-600"
                          style={{
                            backgroundColor: tag.color ? `${tag.color}20` : "#f1f5f9",
                            color: tag.color || "#475569",
                            borderColor: tag.color ? `${tag.color}40` : "#e2e8f0",
                          }}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ delay: index * 0.05, duration: 0.2 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {tag.name}
                        </motion.span>
                      ))}
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {task.description && (
              <motion.p
                className={`mt-3 text-sm leading-relaxed ${task.completed ? "text-monza-400 dark:text-monza-500" : "text-monza-700 dark:text-slate-300"
                  }`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
              >
                {task.description}
              </motion.p>
            )}
          </motion.div>

          {/* Actions */}
          <motion.div
            className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
          >
            <motion.button
              onClick={() => onEdit(task)}
              className="text-monza-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
              title="Edit task"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 0L15 7m-3 3l-3 3"
                />
              </svg>
            </motion.button>
            <motion.button
              onClick={() => onDelete(task.id)}
              className="text-monza-400 hover:text-red-500 p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
              title="Delete task"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h4a1 1 0 001 1v3M4 7h16"
                />
              </svg>
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
