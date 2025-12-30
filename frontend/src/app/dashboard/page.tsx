// @spec: specs/002-fullstack-web-app/spec.md
// @spec: specs/002-fullstack-web-app/plan.md
// Dashboard page (protected route)

"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Header from "@/components/layout/Header";
import TaskList from "@/components/tasks/TaskList";
import TaskForm from "@/components/tasks/TaskForm";
import { apiClient } from "@/lib/api";
import { getCurrentUserId } from "@/lib/auth";
import type { Task, TaskCreate, Priority } from "@/types";

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskFormMode, setTaskFormMode] = useState<"create" | "edit">("create");
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  useEffect(() => {
    async function loadUser() {
      const uid = await getCurrentUserId();
      if (!uid) {
        window.location.href = "/signin";
        return;
      }
      setUserId(uid);
      loadTasks(uid);
    }

    loadUser();
  }, []);

  async function loadTasks(uid: string) {
    setIsLoading(true);
    try {
      const taskData = await apiClient.getTasks(uid);
      setTasks(taskData);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleToggle = async (taskId: string) => {
    if (!userId) return;
    try {
      const task = await apiClient.patchTask(userId, taskId, { completed: !tasks.find((t) => t.id === taskId)?.completed });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
      );
    } catch (error) {
      console.error("Failed to toggle task:", error);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setTaskFormMode("edit");
    setShowTaskForm(true);
  };

  const handleDelete = async (task: Task) => {
    if (!userId) return;
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }
    try {
      await apiClient.deleteTask(userId, task.id);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const handleCreateTask = () => {
    setEditingTask(undefined);
    setTaskFormMode("create");
    setShowTaskForm(true);
  };

  const handleTaskSubmit = async (task: TaskCreate) => {
    if (!userId) return;

    if (taskFormMode === "create") {
      const newTask = await apiClient.createTask(userId, task);
      setTasks((prev) => [newTask, ...prev]);
    } else if (editingTask) {
      const updatedTask = await apiClient.updateTask(userId, editingTask.id, task);
      setTasks((prev) =>
        prev.map((t) => (t.id === editingTask.id ? updatedTask : t))
      );
    }
    setShowTaskForm(false);
  };

  const handleTaskFormCancel = () => {
    setShowTaskForm(false);
    setEditingTask(undefined);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-primary-50 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="mb-10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-primary-900">
                My Tasks
              </h1>
              <p className="mt-2 text-primary-700">
                Stay organized and keep track of your goals.
              </p>
            </div>
            <button
              onClick={handleCreateTask}
              className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl shadow-lg hover:shadow-primary-500/30 hover:scale-105 transition-all duration-300 font-bold flex items-center gap-2 group"
            >
              <span className="text-xl group-hover:rotate-90 transition-transform duration-300">+</span>
              Add New Task
            </button>
          </div>
          <div className="glass-card rounded-3xl p-6 sm:p-8 min-h-[60vh]">
            <TaskList
              tasks={tasks}
              onToggle={handleToggle}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </main>

        {/* Task Form Modal */}
        {showTaskForm && userId && (
          <div className="fixed inset-0 bg-primary-950/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
            <div className="max-w-2xl w-full">
              <TaskForm
                mode={taskFormMode}
                task={editingTask}
                userId={userId}
                onSubmit={handleTaskSubmit}
                onCancel={handleTaskFormCancel}
              />
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
