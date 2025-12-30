// @spec: specs/002-fullstack-web-app/spec.md
// @spec: specs/002-fullstack-web-app/plan.md
// Task item component

"use client";

import { useState } from "react";
import type { Task } from "@/types";

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export default function TaskItem({ task, onToggle, onEdit, onDelete }: TaskItemProps) {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    if (isToggling) return;
    setIsToggling(true);
    try {
      await onToggle(task.id);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="bg-white/50 border border-primary-100 rounded-2xl p-5 hover:shadow-lg hover:shadow-primary-500/10 hover:border-primary-200 transition-all duration-300 group">
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          disabled={isToggling}
          className={`mt-1 flex-shrink-0 w-6 h-6 rounded-lg border-2 transition-all duration-300 flex items-center justify-center ${task.completed
              ? "bg-primary-500 border-primary-500"
              : "border-primary-300 hover:border-primary-500"
            } focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50`}
        >
          {task.completed && (
            <svg
              className="w-4 h-4 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 01-1.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>

        {/* Task content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-1">
            <h3
              className={`text-lg font-bold transition-all duration-300 ${task.completed ? "text-primary-300 line-through decoration-2" : "text-primary-900"
                }`}
            >
              {task.title}
            </h3>

            <div className="flex flex-wrap items-center gap-2 mt-1">
              {/* Priority indicator */}
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${task.priority === "high"
                    ? "bg-red-50 text-red-700 border-red-200"
                    : task.priority === "medium"
                      ? "bg-orange-50 text-orange-700 border-orange-200"
                      : "bg-blue-50 text-blue-700 border-blue-200"
                  }`}
              >
                {task.priority}
              </span>

              {task.tags && task.tags.length > 0 && (
                <>
                  {task.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border border-gray-200"
                      style={{
                        backgroundColor: tag.color ? `${tag.color}20` : "#f3f4f6",
                        color: tag.color || "#374151",
                        borderColor: tag.color ? `${tag.color}40` : "#e5e7eb",
                      }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </>
              )}
            </div>
          </div>

          {task.description && (
            <p
              className={`mt-3 text-sm leading-relaxed ${task.completed ? "text-primary-300" : "text-primary-700"
                }`}
            >
              {task.description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onEdit(task)}
            className="text-primary-400 hover:text-primary-600 p-1.5 hover:bg-primary-50 rounded-lg transition-colors"
            title="Edit task"
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
          </button>
          <button
            onClick={() => onDelete(task)}
            className="text-primary-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete task"
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
          </button>
        </div>
      </div>
    </div>
  );
}
