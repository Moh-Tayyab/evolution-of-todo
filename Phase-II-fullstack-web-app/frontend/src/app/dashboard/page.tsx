// @spec: specs/002-fullstack-web-app/spec.md
// @spec: specs/002-fullstack-web-app/plan.md
// Premium Dashboard with Sidebar + Main Layout - Teacher Dashboard Inspired Todo App

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
  Target,
  LogOut,
} from "lucide-react";

// Layout - Premium Sidebar
import { PremiumSidebar, type Project, type SidebarTag } from "@/components/layout/premium-sidebar";

// Tasks
import { TaskList, type Task as ComponentTask } from "@/components/tasks";
import { TaskForm, TaskModal } from "@/components/tasks/task-form";
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
import { AnalyticsDashboard } from "@/components/dashboard/analytics-dashboard";
import { TaskTemplates } from "@/components/dashboard/task-templates";
import { ProfessionalDashboard } from "@/components/dashboard/professional-dashboard";

// Hooks & Utils
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// API & Auth
import { apiClient } from "@/lib/api";
import { getCurrentUserId, signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";

type ViewMode = "dashboard" | "tasks" | "list" | "board" | "luxury" | "calendar" | "analytics" | "templates" | "settings";

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
  // Auth & Data State
  const [userId, setUserId] = React.useState<string | null>(null);
  const [userName, setUserName] = React.useState<string>("User");
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // View State
  const [currentView, setCurrentView] = React.useState<ViewMode>("dashboard");
  const [taskViewMode, setTaskViewMode] = React.useState<"list" | "board" | "luxury" | "calendar">("luxury");
  const [currentFilter, setCurrentFilter] = React.useState<string>("all");
  const [currentProject, setCurrentProject] = React.useState<string>("");

  // Task Form State
  const [showTaskForm, setShowTaskForm] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | undefined>(undefined);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filters, setFilters] = React.useState<FilterState>({
    search: "",
    status: "all",
    priority: "all",
    sortBy: "created_at",
    sortDirection: "desc",
    tags: [],
  });

  // Dialog State
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  // Refs
  const headerRef = React.useRef<HTMLDivElement>(null);

  const { toast } = useToast();
  const router = useRouter();

  // Mock projects and tags for sidebar
  const projects: Project[] = React.useMemo(() => [
    { id: "1", name: "Work Projects", color: "#d6675d", taskCount: tasks.filter(t => !t.completed && (t.tags?.some(tag => tag.name === "Work") ?? false)).length },
    { id: "2", name: "Personal", color: "#6B9BD1", taskCount: tasks.filter(t => !t.completed && (t.tags?.some(tag => tag.name === "Personal") ?? false)).length },
    { id: "3", name: "Learning", color: "#a855f7", taskCount: tasks.filter(t => !t.completed && (t.tags?.some(tag => tag.name === "Learning") ?? false)).length },
    { id: "4", name: "Health & Fitness", color: "#22c55e", taskCount: tasks.filter(t => !t.completed && (t.tags?.some(tag => tag.name === "Health") ?? false)).length },
  ], [tasks]);

  const availableTags: SidebarTag[] = React.useMemo(() => {
    const tagMap = new Map<string, number>();
    tasks.forEach(task => {
      task.tags?.forEach(tag => {
        tagMap.set(tag.name, (tagMap.get(tag.name) || 0) + 1);
      });
    });
    return Array.from(tagMap.entries()).map(([name, count], index) => ({
      id: `tag-${index}`,
      name,
      color: name === "Urgent" ? "#ef4444" : name === "Work" ? "#d6675d" : name === "Personal" ? "#6B9BD1" : "#a855f7",
      count,
    }));
  }, [tasks]);

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

      // Try to get user name from the first task's user data or set default
      if (fetchedTasks.length > 0) {
        // We'll use the user's name if available, otherwise use "User"
        setUserName("User");
      }
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

  // Load user data
  const loadUserData = React.useCallback(async () => {
    if (!userId) return;

    try {
      // For now, use a default name. In production, you'd fetch from API
      setUserName("User");
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
  }, [userId]);

  React.useEffect(() => {
    if (userId) {
      loadTasks();
      loadUserData();
    }
  }, [userId]);

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

  // Render content based on current view
  const renderContent = () => {
    if (isLoading && currentView !== "analytics" && currentView !== "templates") {
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

    switch (currentView) {
      case "dashboard":
      case "tasks":
        // Show professional dashboard overview
        return (
          <ProfessionalDashboard
            tasks={tasks}
            userName={userName}
            onCreateTask={handleNewTask}
            onViewAllTasks={() => {
              // Switch to list view
              setTaskViewMode("list");
            }}
            onTaskClick={handleEdit}
          />
        );

      case "analytics":
        return <AnalyticsDashboard />;

      case "templates":
        return (
          <TaskTemplates
            onUseTemplate={handleUseTemplate}
            onQuickAction={handleQuickAction}
          />
        );

      case "list":
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

      case "settings":
        return (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="p-6 rounded-full bg-indigo-500/10 mb-6">
              <SettingsIcon className="w-12 h-12 text-indigo-500" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Settings
            </h3>
            <p className="text-muted-foreground">
              Settings panel coming soon...
            </p>
          </div>
        );

      default:
        return renderTaskView(componentTasks);
    }
  };

  // Render task view based on taskViewMode
  const renderTaskView = (componentTasks: ComponentTask[]) => {
    // View Mode Toggle
    const viewModes = [
      { id: "luxury" as const, label: "Grid", icon: Layers },
      { id: "list" as const, label: "List", icon: List },
      { id: "board" as const, label: "Board", icon: Kanban },
      { id: "calendar" as const, label: "Calendar", icon: Calendar },
    ];

    return (
      <div className="space-y-6">
        {/* View Mode Toggle & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex items-center gap-2 p-1 rounded-xl bg-white/50 dark:bg-white/5 backdrop-blur-lg border border-slate-200 dark:border-slate-800">
            {viewModes.map((mode) => (
              <Button
                key={mode.id}
                variant="ghost"
                size="sm"
                onClick={() => setTaskViewMode(mode.id)}
                className={cn(
                  "gap-2 rounded-lg transition-all duration-300",
                  taskViewMode === mode.id
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
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
            availableTags={availableTags.map(tag => ({ id: tag.id, name: tag.name, color: tag.color }))}
            onFiltersChange={setFilters}
            variant="inline"
          />
        </motion.div>

        {/* Task Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <AnimatePresence mode="wait">
            {componentTasks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <div className="p-6 rounded-full bg-indigo-500/10 mb-6">
                  <CheckSquare className="w-12 h-12 text-indigo-500" />
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
              <motion.div
                key={taskViewMode}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {taskViewMode === "luxury" && (
                  <LuxuryView
                    tasks={componentTasks}
                    onToggle={handleToggle}
                    onDelete={confirmDelete}
                    onPin={handlePin}
                  />
                )}
                {taskViewMode === "list" && (
                  <TaskList
                    tasks={componentTasks}
                    onToggle={handleToggle}
                    onDelete={confirmDelete}
                    onPin={handlePin}
                    onArchive={handleArchive}
                    onEdit={handleEdit}
                  />
                )}
                {taskViewMode === "board" && (
                  <BoardView
                    tasks={componentTasks}
                    onToggle={handleToggle}
                    onEdit={handleEdit}
                  />
                )}
                {taskViewMode === "calendar" && (
                  <CalendarView tasks={componentTasks} onTaskClick={handleEdit} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  };

  // Template handlers
  const handleUseTemplate = async (template: { tasks: Array<{ title: string; description?: string; priority: "high" | "medium" | "low" }> }) => {
    if (!userId) return;

    try {
      for (const task of template.tasks) {
        await apiClient.createTask(userId, {
          title: task.title,
          description: task.description,
          priority: task.priority,
        });
      }
      await loadTasks();
      toast({
        title: "Template applied",
        description: `${template.tasks.length} tasks have been created.`,
      });
    } catch (error) {
      console.error("Failed to use template:", error);
      toast({
        title: "Error",
        description: "Failed to create tasks from template.",
        variant: "destructive",
      });
    }
  };

  const handleQuickAction = (category: string) => {
    setEditingTask(undefined);
    setShowTaskForm(true);
    // Could pre-populate with category tag
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/signin");
    } catch (error) {
      console.error("Logout failed:", error);
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Premium Sidebar */}
      <PremiumSidebar
        projects={projects}
        tags={availableTags}
        currentView={currentView}
        currentFilter={currentFilter}
        currentProject={currentProject}
        onNavigate={setCurrentView}
        onFilterChange={setCurrentFilter}
        onProjectChange={setCurrentProject}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-72">
        {/* Top Bar */}
        <motion.header
          ref={headerRef}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-2">
              {/* Page Title */}
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {currentView === "analytics" && <BarChart3 className="w-6 h-6 text-indigo-500" />}
                  {currentView === "templates" && <Sparkles className="w-6 h-6 text-blue-500" />}
                  {currentView === "settings" && <SettingsIcon className="w-6 h-6 text-slate-500" />}
                  {(!currentView || currentView === "dashboard" || currentView === "tasks") && <Target className="w-6 h-6 text-indigo-500" />}
                  {currentView === "dashboard" || currentView === "tasks" || !currentView
                    ? "Dashboard"
                    : currentView.charAt(0).toUpperCase() + currentView.slice(1)}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 hidden md:block">
                  {currentView === "analytics" && "Track your productivity and insights"}
                  {currentView === "templates" && "Quick-start with pre-made templates"}
                  {currentView === "settings" && "Customize your experience"}
                  {(!currentView || currentView === "dashboard" || currentView === "tasks") && "Manage your tasks efficiently"}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {/* Search */}
                {currentView !== "analytics" && currentView !== "templates" && (
                  <div className="relative hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search tasks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 w-48 sm:w-64 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    />
                  </div>
                )}

                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 h-9 w-9 sm:h-10 sm:w-10"
                >
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                    3
                  </span>
                </Button>

                {/* Logout Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 h-9 w-9 sm:h-10 sm:w-10"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>

                {/* New Task Button - only show on task views */}
                {(currentView === "dashboard" || currentView === "tasks" || !currentView || currentView === "list" || currentView === "luxury" || currentView === "board" || currentView === "calendar") && (
                  <Button
                    onClick={handleNewTask}
                    className="btn-premium gap-2 h-9 px-3 sm:h-10 sm:px-4"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">New Task</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Task Form Modal */}
      <AnimatePresence>
        {showTaskForm && (
          <TaskModal
            mode={editingTask ? "edit" : "create"}
            initialData={editingTask ? toComponentTask(editingTask) : undefined}
            availableTags={availableTags.map(tag => ({ id: tag.id, name: tag.name, color: tag.color }))}
            onSubmit={handleTaskSubmit}
            onCancel={() => {
              setShowTaskForm(false);
              setEditingTask(undefined);
            }}
            isOpen={showTaskForm}
            onClose={() => {
              setShowTaskForm(false);
              setEditingTask(undefined);
            }}
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

// Additional icon components
function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function BarChart3({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  );
}

function Sparkles({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
