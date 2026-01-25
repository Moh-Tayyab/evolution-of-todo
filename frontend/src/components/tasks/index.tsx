"use client";

import React from "react";

export interface Task {
  id: number;  // Changed from string to number for integer task IDs
  title: string;
  description?: string;
  completed: boolean;
  priority?: "high" | "medium" | "low";
  tags?: Array<{ id: string; name: string; color: string }>;
  due_date?: string;
  created_at: string;
  updated_at: string;
  is_pinned?: boolean;
}

export interface TaskListProps {
  tasks: Task[];
  onTaskDelete?: (id: number) => void;
  onTaskToggle?: (id: number) => void;
  onToggle?: (id: number) => Promise<void>;
  onDelete?: (id: number) => void;
  onPin?: (id: number) => void;
  onArchive?: (id: number) => void;
  onEdit?: (task: Task) => void;
}

export function TaskList({ tasks, onTaskDelete, onTaskToggle }: TaskListProps) {
  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="p-4 bg-card border border-border rounded-lg hover:shadow-md transition-shadow"
        >
          <h4 className="font-semibold">{task.title}</h4>
          {task.description && (
            <p className="text-muted-foreground text-sm mt-1">{task.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs px-2 py-1 rounded ${task.completed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {task.completed ? 'Completed' : 'Active'}
            </span>
            {task.priority && (
              <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                {task.priority}
              </span>
            )}
          </div>
        </div>
      ))}
      {tasks.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No tasks found. Create your first task to get started!
        </div>
      )}
    </div>
  );
}
