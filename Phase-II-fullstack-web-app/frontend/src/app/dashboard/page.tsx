// @spec: specs/003-modern-ui-ux/spec.md
// @spec: specs/003-modern-ui-ux/plan.md
// Dashboard page (protected route) with modern animations

"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Header from "@/components/layout/Header";
import TaskList from "@/components/tasks/TaskList";
import TaskForm from "@/components/tasks/TaskForm";
import { SearchInput } from "@/components/search/SearchInput";
import { FilterPanel, TaskStatus } from "@/components/search/FilterPanel";
import { ActiveFilters } from "@/components/search/ActiveFilters";
import { SortSelector, SortField, SortOrder } from "@/components/search/SortSelector";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { LoadingSpinner, TaskCardSkeleton, EmptyState } from "@/components/ui/loading-empty-states";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import { apiClient } from "@/lib/api";
import { getCurrentUserId } from "@/lib/auth";
import type { Task, TaskCreate, Priority, TagWithCount, TaskListParams } from "@/types";

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tags, setTags] = useState<TagWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskFormMode, setTaskFormMode] = useState<"create" | "edit">("create");
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);


  // Search, filter, and sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState<TaskStatus>("all");
  const [priority, setPriority] = useState<Priority | undefined>(undefined);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [sort, setSort] = useState<SortField>("created_at");
  const [order, setOrder] = useState<SortOrder>("desc");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (userId) {
        loadTasks(userId);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, status, priority, selectedTagIds, sort, order, userId]);

  useEffect(() => {
    async function loadUser() {
      const uid = await getCurrentUserId();
      if (!uid) {
        window.location.href = "/signin";
        return;
      }
      setUserId(uid);
      loadTags(uid);
    }

    loadUser();
  }, []);

  async function loadTasks(uid: string) {
    setIsLoading(true);
    try {
      const params: TaskListParams = {
        search: searchQuery || undefined,
        status: status !== "all" ? status : undefined,
        priority,
        tags: selectedTagIds.length > 0 ? selectedTagIds : undefined,
        sort,
        order,
      };
      const taskData = await apiClient.getTasks(uid, params);
      setTasks(taskData);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadTags(uid: string) {
    try {
      const tagData = await apiClient.getTags(uid);
      setTags(tagData);
    } catch (error) {
      console.error("Failed to load tags:", error);
    }
  }

  const handleSortChange = useCallback((newSort: SortField, newOrder: SortOrder) => {
    setSort(newSort);
    setOrder(newOrder);
  }, []);

  const handleTagToggle = useCallback((tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  }, []);

  const handleRemoveFilter = useCallback(
    (type: "status" | "priority" | "tag", value: string) => {
      if (type === "status") {
        setStatus("all");
      } else if (type === "priority") {
        setPriority(undefined);
      } else {
        setSelectedTagIds((prev) => prev.filter((id) => id !== value));
      }
    },
    []
  );

  const handleClearAllFilters = useCallback(() => {
    setSearchQuery("");
    setStatus("all");
    setPriority(undefined);
    setSelectedTagIds([]);
    setSort("created_at");
    setOrder("desc");
  }, []);

  const handleToggle = async (taskId: string) => {
    if (!userId) return;
    try {
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        await apiClient.patchTask(userId, taskId, { completed: !task.completed });
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
          )
        );
      }
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
      // Refresh tags to include any new ones
      loadTags(userId);
    } else if (editingTask) {
      const updatedTask = await apiClient.updateTask(userId, editingTask.id, task);
      setTasks((prev) =>
        prev.map((t) => (t.id === editingTask.id ? updatedTask : t))
      );
      // Refresh tags
      loadTags(userId);
    }
    setShowTaskForm(false);
  };

  const handleTaskFormCancel = () => {
    setShowTaskForm(false);
    setEditingTask(undefined);
  };

  if (isLoading && tasks.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const selectedTags = tags.filter((t) => selectedTagIds.includes(t.id));

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-primary-50 relative overflow-hidden">
        {/* Animated Background Blob via Framer Motion */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            x: [0, -50, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 left-0 w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        />

        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="mb-10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-primary-900">
                My Tasks
              </h1>
              <p className="mt-2 text-primary-700">
                Stay organized and keep track of your goals.
              </p>
            </motion.div>
            <Button
              onClick={handleCreateTask}
              size="lg"
              className="px-6 py-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl shadow-xl shadow-primary-500/20 font-bold flex items-center gap-2 group"
            >
              <span className="text-2xl group-hover:rotate-90 transition-transform duration-300">+</span>
              Add New Task
            </Button>
          </div>


          {/* Search, Filter, and Sort Controls */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search tasks by title, description, or tags..."
                />
              </div>
              <FilterPanel
                status={status}
                priority={priority}
                selectedTagIds={selectedTagIds}
                availableTags={tags}
                onStatusChange={setStatus}
                onPriorityChange={setPriority}
                onTagToggle={handleTagToggle}
                onClearAll={handleClearAllFilters}
              />
              <SortSelector
                sort={sort}
                order={order}
                onChange={handleSortChange}
              />
            </div>

            {/* Active Filters Display */}
            <ActiveFilters
              status={status}
              priority={priority}
              selectedTags={selectedTags}
              onRemove={handleRemoveFilter}
              onClearAll={handleClearAllFilters}
            />
          </div>

          <div className="glass-card rounded-3xl p-6 sm:p-8 min-h-[60vh]">
            {isLoading ? (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                {[1, 2, 3].map((i) => (
                  <motion.div key={i} variants={fadeInUp}>
                    <TaskCardSkeleton />
                  </motion.div>
                ))}
              </motion.div>
            ) : tasks.length === 0 ? (
              <EmptyState
                onAction={handleCreateTask}
                title={searchQuery || status !== "all" || priority || selectedTagIds.length > 0 ? "No tasks found" : "No tasks yet"}
                description={searchQuery || status !== "all" || priority || selectedTagIds.length > 0 ? "Try adjusting your search or filters." : "Get started by creating your first task."}
              />
            ) : (
              <TaskList
                tasks={tasks}
                onToggle={handleToggle}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </div>
        </main>

        {/* Task Form Modal */}
        <Dialog open={showTaskForm} onOpenChange={setShowTaskForm}>
          <div className="max-w-2xl w-full">
            <TaskForm
              mode={taskFormMode}
              task={editingTask}
              userId={userId || ""}
              availableTags={tags}
              onSubmit={handleTaskSubmit}
              onCancel={handleTaskFormCancel}
            />
          </div>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
