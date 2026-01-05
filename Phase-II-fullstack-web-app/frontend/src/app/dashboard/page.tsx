// @spec: specs/002-fullstack-web-app/spec.md
// @spec: specs/002-fullstack-web-app/plan.md
// Dashboard page with professional UI using all components

"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  List,
  LayoutGrid,
  CheckSquare,
  TrendingUp,
  Calendar,
  AlertCircle,
  Clock,
  Layers,
} from "lucide-react";
import { DashboardShell, Header, Sidebar } from "@/components/layout";
import { TaskList, type Task } from "@/components/tasks";
import { TaskForm } from "@/components/tasks/task-form";
// import { TaskBoard } from "@/components/tasks/task-board"; // Temporarily disabled - needs @hello-pangea/dng
import { SearchInput } from "@/components/search";
import { FilterPanel, type FilterState } from "@/components/search";
import { SmartAsync } from "@/components/smart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

/**
 * @spec: Dashboard Page Component
 * @description: Main dashboard with stats, view modes, and task management
 * @feature: FR-003 - Task viewing functionality
 */

type ViewMode = "list" | "board";

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    status: "all",
    priority: "all",
    sortBy: "created_at",
    sortDirection: "desc",
    tags: [],
  });

  const { toast } = useToast();

  // Mock user data (replace with actual auth)
  const userName = "User";
  const userAvatar = undefined;

  // Mock available tags
  const availableTags = [
    { id: "1", name: "Work", color: "#D6675D", count: 5 },
    { id: "2", name: "Personal", color: "#6B9BD1", count: 3 },
    { id: "3", name: "Urgent", color: "#E74C3C", count: 2 },
  ];

  // Task counts for sidebar
  const taskCounts = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
    pending: tasks.filter((t) => !t.completed).length,
    highPriority: tasks.filter((t) => t.priority === "high").length,
  }), [tasks]);

  // Load tasks (mock implementation, replace with actual API)
  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // const data = await apiClient.getTasks(userId, params);
      // Simulating API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock data
      const mockTasks: Task[] = [
        {
          id: "1",
          title: "Review project documentation",
          description: "Read and review the project specs and architecture docs",
          priority: "high",
          completed: false,
          tags: [{ id: "1", name: "Work", color: "#D6675D" }],
          due_date: new Date(Date.now() + 86400000).toISOString(),
          created_at: new Date().toISOString(),
          is_pinned: true,
        },
        {
          id: "2",
          title: "Update design system",
          description: "Add new components to the design library",
          priority: "medium",
          completed: false,
          tags: [{ id: "1", name: "Work", color: "#D6675D" }],
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "3",
          title: "Team standup meeting",
          description: "Daily sync with the development team",
          priority: "low",
          completed: true,
          tags: [],
          due_date: new Date().toISOString(),
          created_at: new Date(Date.now() - 172800000).toISOString(),
        },
      ];

      setTasks(mockTasks);
    } catch (error) {
      console.error("Failed to load tasks:", error);
      toast({
        title: "Error",
        description: "Failed to load tasks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filters.status !== "all") {
      result = result.filter((task) =>
        filters.status === "completed" ? task.completed : !task.completed
      );
    }

    // Apply priority filter
    if (filters.priority !== "all") {
      result = result.filter((task) => task.priority === filters.priority);
    }

    // Apply tag filter
    if (filters.tags.length > 0) {
      result = result.filter((task) =>
        task.tags?.some((tag) => filters.tags.includes(tag.id))
      );
    }

    return result;
  }, [tasks, searchQuery, filters]);

  // Task handlers
  const handleToggle = async (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      )
    );
  };

  const handleDelete = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    toast({
      title: "Task deleted",
      description: "The task has been deleted successfully.",
    });
  };

  const handlePin = async (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, is_pinned: !t.is_pinned } : t))
    );
  };

  const handleArchive = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleNewTask = () => {
    setEditingTask(undefined);
    setShowTaskForm(true);
  };

  const handleTaskSubmit = async (data: any) => {
    // TODO: Replace with actual API call
    const newTask: Task = {
      id: Date.now().toString(),
      title: data.title,
      description: data.description,
      priority: data.priority,
      completed: false,
      tags: availableTags.filter((tag) => data.tags?.includes(tag.id)),
      due_date: data.due_date,
      created_at: new Date().toISOString(),
    };

    if (editingTask) {
      setTasks((prev) =>
        prev.map((t) => (t.id === editingTask.id ? { ...newTask, id: t.id } : t))
      );
      toast({
        title: "Task updated",
        description: "The task has been updated successfully.",
      });
    } else {
      setTasks((prev) => [newTask, ...prev]);
      toast({
        title: "Task created",
        description: "The task has been created successfully.",
      });
    }

    setShowTaskForm(false);
    setEditingTask(undefined);
  };

  return (
    <DashboardShell
      header={
        <Header
          userName={userName}
          userAvatar={userAvatar}
          notificationCount={3}
          onSearch={setSearchQuery}
          onNewTask={handleNewTask}
        />
      }
      sidebar={
        <Sidebar
          taskCounts={taskCounts}
          tags={availableTags}
          onFilterChange={(filter) => setFilters({ ...filters, status: filter as any })}
          onTagChange={(tag) => setFilters({ ...filters, tags: [tag] })}
        />
      }
    >
      {/* Dashboard Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        {[
          {
            label: "Total Tasks",
            value: taskCounts.total,
            icon: Layers,
            color: "bg-blue-500",
            textColor: "text-blue-600",
          },
          {
            label: "Completed",
            value: taskCounts.completed,
            icon: CheckSquare,
            color: "bg-green-500",
            textColor: "text-green-600",
          },
          {
            label: "Pending",
            value: taskCounts.pending,
            icon: Clock,
            color: "bg-yellow-500",
            textColor: "text-yellow-600",
          },
          {
            label: "High Priority",
            value: taskCounts.highPriority,
            icon: AlertCircle,
            color: "bg-red-500",
            textColor: "text-red-600",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={cn("p-2 rounded-lg", stat.color)}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold">{stat.value}</span>
            </div>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* View Toggle & Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="gap-2"
          >
            <List className="w-4 h-4" />
            List
          </Button>
          <Button
            variant={viewMode === "board" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("board")}
            className="gap-2"
          >
            <LayoutGrid className="w-4 h-4" />
            Board
          </Button>
        </div>

        <FilterPanel
          availableTags={availableTags}
          onFilterChange={setFilters}
          variant="inline"
        />
      </div>

      {/* Task View */}
      <SmartAsync
        query={async () => {
          // Return filtered tasks
          return filteredTasks;
        }}
        emptyComponent={
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckSquare className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No tasks found
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || filters.status !== "all" || filters.priority !== "all"
                ? "Try adjusting your filters"
                : "Get started by creating your first task"}
            </p>
            <Button onClick={handleNewTask}>
              <CheckSquare className="w-4 h-4 mr-2" />
              Create Task
            </Button>
          </div>
        }
      >
        {(tasks) => (
          <AnimatePresence mode="wait">
            {viewMode === "list" ? (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <TaskList
                  tasks={tasks}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onPin={handlePin}
                  onArchive={handleArchive}
                  onEdit={handleEdit}
                />
              </motion.div>
            ) : (
              <motion.div
                key="board"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LayoutGrid className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Board View Coming Soon
                </h3>
                <p className="text-gray-500">
                  Kanban board view will be available after installing dependencies.
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Run: npm install @hello-pangea/dng
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </SmartAsync>

      {/* Task Form Modal */}
      <AnimatePresence>
        {showTaskForm && (
          <TaskForm
            mode={editingTask ? "edit" : "create"}
            initialData={editingTask}
            availableTags={availableTags}
            onSubmit={handleTaskSubmit}
            onCancel={() => {
              setShowTaskForm(false);
              setEditingTask(undefined);
            }}
            isOpen={showTaskForm}
          />
        )}
      </AnimatePresence>
    </DashboardShell>
  );
}
