// @spec: specs/002-fullstack-web-app/spec.md
// @spec: specs/002-fullstack-web-app/plan.md
// Professional Dashboard with Premium UI - Next.js 16 / React 19 Compatible

"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import {
  List,
  CheckSquare,
  Clock,
  Layers,
  Kanban,
  Calendar,
  AlertCircle,
  Plus,
  Search,
  Bell,
} from "lucide-react";

// Layout
import { DashboardShell, Header, Sidebar } from "@/components/layout";

// Tasks
import { TaskList, type Task as ComponentTask } from "@/components/tasks";
import { TaskForm } from "@/components/tasks/task-form";
import { type Task } from "@/types";

// Search & Filters
import { FilterPanel, type FilterState } from "@/components/search";

// Premium UI Components
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { StatCard } from "@/components/ui/stat-card";

// Views
import { LuxuryView } from "@/components/dashboard/luxury-view";
import { CalendarView } from "@/components/dashboard/calendar-view";
import { BoardView } from "@/components/dashboard/board-view";

// Hooks & Utils
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// API & Auth
import { apiClient } from "@/lib/api";
import { getCurrentUserId } from "@/lib/auth";

type ViewMode = "list" | "board" | "luxury" | "calendar";

// Convert API Task type to Component Task type
function toComponentTask(task: Task): ComponentTask {
  return {
    id: task.id,
    title: task.title,
    description: task.description || undefined,
    completed: task.completed,
    priority: task.priority,
    tags: task.tags?.map(tag => ({
      id: tag.id,
      name: tag.name,
      color: tag.color || "#000000",
    })),
    due_date: undefined,
    created_at: task.created_at,
    updated_at: task.updated_at,
    is_pinned: false,
  };
}

interface ViewModeConfig {
  id: ViewMode;
  label: string;
  icon: typeof List;
}

const viewModes: ViewModeConfig[] = [
  { id: "list", label: "List", icon: List },
  { id: "board", label: "Board", icon: Kanban },
  { id: "luxury", label: "Grid", icon: Layers },
  { id: "calendar", label: "Calendar", icon: Calendar },
];

interface Tag {
  id: string;
  name: string;
  color: string;
  count?: number;
}

export default function DashboardPage() {
  const [userId, setUserId] = React.useState<string | null>(null);
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [viewMode, setViewMode] = React.useState<ViewMode>("luxury");
  const [showTaskForm, setShowTaskForm] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | undefined>(undefined);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filters, setFilters] = React.useState<FilterState>({
    search: "",
    status: "all",
    priority: "all",
    sortBy: "created_at",
    sortDirection: "desc",
    tags: [],
  });

  // Confirm Dialog State
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  // Refs for GSAP animations
  const headerRef = React.useRef<HTMLDivElement>(null);

  const { toast } = useToast();

  // Mock available tags
  const availableTags: Tag[] = [
    { id: "1", name: "Work", color: "#d6675d", count: 5 },
    { id: "2", name: "Personal", color: "#6B9BD1", count: 3 },
    { id: "3", name: "Urgent", color: "#ef4444", count: 2 },
    { id: "4", name: "Ideas", color: "#a855f7", count: 4 },
  ];

  // Task counts
  const taskCounts = React.useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
    pending: tasks.filter((t) => !t.completed).length,
    highPriority: tasks.filter((t) => t.priority === "high").length,
  }), [tasks]);

  // GSAP Animations
  React.useEffect(() => {
    if (!isLoading && headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );
    }
  }, [isLoading]);

  // Load user ID on mount
  React.useEffect(() => {
    const loadUserId = async () => {
      const currentUserId = await getCurrentUserId();
      if (currentUserId) {
        setUserId(currentUserId);
      } else {
        toast({
          title: "Authentication Error",
          description: "Please sign in to view your tasks.",
          variant: "destructive",
        });
      }
    };
    loadUserId();
  }, [toast]);

  // Load tasks
  const loadTasks = React.useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const fetchedTasks = await apiClient.getTasks(userId, {
        search: filters.search || undefined,
        status: filters.status === "all" ? undefined : filters.status as "completed" | "incomplete",
        priority: filters.priority === "all" ? undefined : filters.priority as "high" | "medium" | "low",
        sort: filters.sortBy as "created_at" | "priority" | "title",
        order: filters.sortDirection as "asc" | "desc",
      });
      setTasks(fetchedTasks);
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
  }, [userId, filters, toast]);

  React.useEffect(() => {
    if (userId) {
      loadTasks();
    }
  }, [userId, loadTasks]);

  // Filter tasks
  const filteredTasks = React.useMemo(() => {
    let result = [...tasks];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query)
      );
    }

    if (filters.status !== "all") {
      result = result.filter((task) =>
        filters.status === "completed" ? task.completed : !task.completed
      );
    }

    if (filters.priority !== "all") {
      result = result.filter((task) => task.priority === filters.priority);
    }

    if (filters.tags.length > 0) {
      result = result.filter((task) =>
        task.tags?.some((tag) => filters.tags.includes(tag.id))
      );
    }

    return result;
  }, [tasks, searchQuery, filters]);

  // Task handlers
  const handleToggle = async (taskId: string) => {
    if (!userId) return;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      )
    );

    try {
      await apiClient.toggleTaskComplete(userId, taskId);
      toast({
        title: "Task updated",
        description: "Task status has been changed.",
      });
    } catch (error) {
      console.error("Failed to toggle task:", error);
      // Rollback on error
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, completed: !t.completed } : t
        )
      );
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const confirmDelete = (taskId: string) => {
    setDeleteId(taskId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmedDelete = async () => {
    if (deleteId && userId) {
      try {
        await apiClient.deleteTask(userId, deleteId);
        setTasks((prev) => prev.filter((t) => t.id !== deleteId));
        toast({
          title: "Task deleted",
          description: "The task has been deleted successfully.",
        });
        setDeleteId(null);
      } catch (error) {
        console.error("Failed to delete task:", error);
        toast({
          title: "Error",
          description: "Failed to delete task. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handlePin = (taskId: string) => {
    // Pin functionality is not implemented in the backend API
    // This is a UI-only placeholder for future implementation
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t } : t))
    );
  };

  const handleArchive = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleEdit = (task: ComponentTask) => {
    // Convert ComponentTask to Task for editing
    setEditingTask({
      id: task.id,
      title: task.title,
      description: task.description || null,
      priority: task.priority || "medium",
      completed: task.completed,
      tags: task.tags?.map(tag => ({
        id: tag.id,
        user_id: userId || "",
        name: tag.name,
        color: tag.color,
        created_at: "",
      })) || [],
      user_id: userId || "",
      created_at: task.created_at,
      updated_at: task.updated_at,
    });
    setShowTaskForm(true);
  };

  const handleNewTask = () => {
    setEditingTask(undefined);
    setShowTaskForm(true);
  };

  const handleTaskSubmit = async (data: Record<string, unknown>) => {
    if (!userId) return;

    try {
      if (editingTask) {
        // Update existing task
        const updatedTask = await apiClient.updateTask(userId, editingTask.id, {
          title: data.title as string,
          description: data.description as string | undefined,
          priority: data.priority as "high" | "medium" | "low",
        });
        setTasks((prev) =>
          prev.map((t) => (t.id === editingTask.id ? updatedTask : t))
        );
        toast({ title: "Task updated", description: "The task has been updated." });
      } else {
        // Create new task
        const newTask = await apiClient.createTask(userId, {
          title: data.title as string,
          description: data.description as string | undefined,
          priority: data.priority as "high" | "medium" | "low",
        });
        setTasks((prev) => [newTask, ...prev]);
        toast({ title: "Task created", description: "New task has been created." });
      }

      setShowTaskForm(false);
      setEditingTask(undefined);
    } catch (error) {
      console.error("Failed to save task:", error);
      toast({
        title: "Error",
        description: "Failed to save task. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Render content based on view mode
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton
              key={i}
              className="h-48 rounded-2xl bg-white/50 dark:bg-white/5"
            />
          ))}
        </div>
      );
    }

    // Convert Task[] to ComponentTask[] for view components
    const componentTasks = filteredTasks.map(toComponentTask);

    switch (viewMode) {
      case "luxury":
        return (
          <LuxuryView
            tasks={componentTasks}
            onToggle={handleToggle}
            onDelete={confirmDelete}
            onPin={handlePin}
          />
        );
      case "calendar":
        return <CalendarView tasks={componentTasks} onTaskClick={handleEdit} />;
      case "board":
        return (
          <BoardView
            tasks={componentTasks}
            onToggle={handleToggle}
            onEdit={handleEdit}
          />
        );
      case "list":
      default:
        return (
          <TaskList
            tasks={componentTasks}
            onToggle={handleToggle}
            onDelete={confirmDelete}
            onPin={handlePin}
            onArchive={handleArchive}
            onEdit={handleEdit}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div>
        {/* Floating Header */}
        <motion.header
          ref={headerRef}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-white/10"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-2">
              {/* Logo & Title */}
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-xl bg-primary shadow-sm flex-shrink-0">
                  <CheckSquare className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                    TaskFlow Pro
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground hidden md:block">Professional Task Management</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 sm:gap-3">
                {/* Search - hidden on mobile */}
                <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-48 sm:w-64 rounded-xl bg-white/50 dark:bg-white/5 border border-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                  />
                </div>

                {/* Mobile search trigger */}
                <button
                  className="md:hidden p-2 rounded-lg hover:bg-primary-500/10"
                  onClick={() => {/* Mobile search handler */}}
                >
                  <Search className="w-5 h-5" />
                </button>

                {/* Notifications - hide badge on very small screens */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative rounded-xl hover:bg-primary-500/10 h-9 w-9 sm:h-10 sm:w-10"
                >
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                    3
                  </span>
                </Button>

                <ThemeToggle />

                {/* New Task Button - compact on mobile */}
                <Button
                  onClick={handleNewTask}
                  className="btn-premium gap-2 h-9 px-3 sm:h-10 sm:px-4"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">New Task</span>
                </Button>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            <StatCard
              label="Total Tasks"
              value={isLoading ? 0 : taskCounts.total}
              icon={Layers}
              color="blue"
              delay={0}
            />
            <StatCard
              label="Completed"
              value={isLoading ? 0 : taskCounts.completed}
              icon={CheckSquare}
              color="green"
              trend={taskCounts.total > 0 ? Math.round((taskCounts.completed / taskCounts.total) * 100) : 0}
              delay={0.1}
            />
            <StatCard
              label="Pending"
              value={isLoading ? 0 : taskCounts.pending}
              icon={Clock}
              color="yellow"
              delay={0.2}
            />
            <StatCard
              label="High Priority"
              value={isLoading ? 0 : taskCounts.highPriority}
              icon={AlertCircle}
              color="red"
              delay={0.3}
            />
          </motion.div>

          {/* View Mode Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-between gap-4 mb-8"
          >
            <div className="flex items-center gap-2 p-1 rounded-xl bg-white/50 dark:bg-white/5 backdrop-blur-lg border border-white/20">
              {viewModes.map((mode) => (
                <Button
                  key={mode.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode(mode.id)}
                  className={cn(
                    "gap-2 rounded-lg transition-all duration-300",
                    viewMode === mode.id
                      ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30 hover:bg-primary-600"
                      : "hover:bg-white/50 dark:hover:bg-white/10"
                  )}
                >
                  <mode.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{mode.label}</span>
                </Button>
              ))}
            </div>

            <FilterPanel
              filters={filters}
              availableTags={availableTags}
              onFiltersChange={setFilters}
              variant="inline"
            />
          </motion.div>

          {/* Task Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={viewMode}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {filteredTasks.length === 0 && !isLoading ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-20"
                  >
                    <div className="p-6 rounded-full bg-primary-500/10 mb-6">
                      <CheckSquare className="w-12 h-12 text-primary-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {searchQuery ? "No matching tasks" : "All caught up!"}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {searchQuery
                        ? "Try adjusting your search or filters"
                        : "Create a new task to get started"}
                    </p>
                    <Button onClick={handleNewTask} className="btn-premium gap-2">
                      <Plus className="w-4 h-4" />
                      Create Task
                    </Button>
                  </motion.div>
                ) : (
                  renderContent()
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </main>
      </div>

      {/* Task Form Modal */}
      <AnimatePresence>
        {showTaskForm && (
          <TaskForm
            mode={editingTask ? "edit" : "create"}
            initialData={editingTask ? toComponentTask(editingTask) : undefined}
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

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={handleConfirmedDelete}
        variant="destructive"
      />
    </div>
  );
}
