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
  Brain,
} from "lucide-react";

// Layout - Premium Sidebar
import { PremiumSidebar, type Project, type SidebarTag } from "@/components/layout/premium-sidebar";

// Tasks
import TaskList from "@/components/tasks/TaskList";
import { type Task as ComponentTask } from "@/components/tasks";
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

// Chatbot
import { FloatingChatButton } from "@/components/chat/floating-chat-button";
import { AIDashboardSection } from "@/components/ai/ai-dashboard-section";

// Hooks & Utils
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useTaskSync } from "@/components/tasks/task-sync-context";

// API & Auth
import { apiClient } from "@/lib/api";
import { getCurrentUserId, signOut, getToken, getCurrentUser } from "@/lib/auth";
import { useRouter } from "next/navigation";

type ViewMode = "dashboard" | "tasks" | "list" | "board" | "luxury" | "calendar" | "analytics" | "templates" | "ai" | "settings";

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
  const headerRef = React.useRef<HTMLDivElement>(null);

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
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState("");
  const [filters, setFilters] = React.useState<FilterState>({
    search: "",
    status: "all",
    priority: "all",
    sortBy: "created_at",
    sortDirection: "desc",
    tags: [],
  });

  // Debounce search input to avoid excessive API calls
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update filters.search when debounced search changes
  React.useEffect(() => {
    setFilters(prev => ({ ...prev, search: debouncedSearchQuery }));
  }, [debouncedSearchQuery]);

  // Dialog State
  const [deleteId, setDeleteId] = React.useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const { toast } = useToast();
  const router = useRouter();

  // Task Sync - Track all operations for chatbot awareness
  const {
    trackOperation,
    updateTasks,
    updateViewState,
  } = useTaskSync();

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

  // Load user ID on mount and verify JWT token exists
  React.useEffect(() => {
    const loadUserId = async () => {
      const currentUserId = await getCurrentUserId();
      const token = await getToken();

      console.log("[Dashboard] Auth check - userId:", currentUserId, "token:", token ? "exists" : "missing");

      if (currentUserId && token) {
        // Both user ID and JWT token exist
        console.log("[Dashboard] Both userId and token exist, setting userId");
        setUserId(currentUserId);

        // Fetch user data
        try {
          const userData = await getCurrentUser();
          if (userData?.name) {
            setUserName(userData.name);
          } else if (userData?.email) {
            // Use email username part as fallback
            setUserName(userData.email.split("@")[0]);
          }
        } catch (error) {
          console.error("Failed to fetch user name:", error);
        }
      } else if (currentUserId && !token) {
        // User ID exists but JWT token is missing - need to re-authenticate
        console.error("[Dashboard] userId exists but token is missing, redirecting to signin");
        toast({
          title: "Session Expired",
          description: "Please sign in again to continue.",
          variant: "destructive",
        });
        router.push("/signin");
      } else {
        // No authentication at all
        console.error("[Dashboard] No authentication at all, redirecting to signin");
        toast({
          title: "Authentication Required",
          description: "Please sign in to view your tasks.",
          variant: "destructive",
        });
        router.push("/signin");
      }
    };
    loadUserId();
  }, [toast, router]);

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
      // Sync tasks to chatbot context
      updateTasks(fetchedTasks);
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
  }, [userId]);

  // Calculate filter counts for sidebar
  const filterCounts = React.useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return {
      all: tasks.length,
      today: tasks.filter(task => {
        const taskDate = new Date(task.created_at);
        return taskDate >= today && taskDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
      }).length,
      upcoming: tasks.filter(task => {
        // Tasks with due_date in the future (if task has due_date)
        // For now, count incomplete tasks as "upcoming"
        return !task.completed && task.id; // Placeholder: all incomplete tasks
      }).length,
      important: tasks.filter(task => task.priority === "high").length,
      completed: tasks.filter(task => task.completed).length,
    };
  }, [tasks]);

  // GSAP animation for header
  React.useEffect(() => {
    if (headerRef.current) {
      gsap.from(headerRef.current, {
        y: -100,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.2,
      });
    }
  }, [currentView]);

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
  const handleToggle = async (taskId: number) => {
    if (!userId) return;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      )
    );

    try {
      await apiClient.toggleTaskComplete(userId, taskId);

      // Track operation for chatbot awareness
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        trackOperation({
          type: "toggle",
          details: {
            taskId,
            taskTitle: task.title,
            previousState: { completed: task.completed },
            newState: { completed: !task.completed },
          },
        });
      }

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

  const confirmDelete = (taskId: number) => {
    setDeleteId(taskId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmedDelete = async () => {
    if (deleteId && userId) {
      try {
        // Get task before deleting for tracking
        const taskToDelete = tasks.find(t => t.id === deleteId);

        await apiClient.deleteTask(userId, deleteId);
        setTasks((prev) => prev.filter((t) => t.id !== deleteId));

        // Track operation for chatbot awareness
        if (taskToDelete) {
          trackOperation({
            type: "delete",
            details: {
              taskId: deleteId,
              taskTitle: taskToDelete.title,
            },
          });
        }

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

  const handlePin = (taskId: number) => {
    // Pin functionality is not implemented in the backend API
    // This is a UI-only placeholder for future implementation
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t } : t))
    );
  };

  const handleArchive = (taskId: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleMoveToColumn = async (taskId: number, column: "todo" | "in-progress" | "done") => {
    if (!userId) return;

    // Get the current task state
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Determine new state based on target column
    let newCompleted = task.completed;
    let newPriority = task.priority;

    switch (column) {
      case "done":
        newCompleted = true;
        break;
      case "in-progress":
        newCompleted = false;
        newPriority = "high";
        break;
      case "todo":
        newCompleted = false;
        newPriority = task.priority === "high" ? "medium" : task.priority;
        break;
    }

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, completed: newCompleted, priority: newPriority } : t
      )
    );

    try {
      // Update via API - use updateTask endpoint
      await apiClient.updateTask(userId, taskId, {
        completed: newCompleted,
        priority: newPriority,
      });
      toast({
        title: "Task moved",
        description: `Task moved to ${column === "done" ? "Done" : column === "in-progress" ? "In Progress" : "To Do"}`,
      });
    } catch (error) {
      console.error("Failed to move task:", error);
      // Rollback on error
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, completed: task.completed, priority: task.priority } : t
        )
      );
      toast({
        title: "Error",
        description: "Failed to move task. Please try again.",
        variant: "destructive",
      });
    }
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

  // Handler for Task type (from @/types) - converts to ComponentTask for handleEdit
  const handleTaskFromTypes = (task: Task) => {
    handleEdit(toComponentTask(task));
  };

  // Wrapper handlers for sidebar callbacks - use useCallback for stable references
  const handleSidebarNavigate = React.useCallback((view: string) => {
    setCurrentView(view as ViewMode);
    // Track view change for chatbot awareness
    updateViewState(view, currentFilter);
  }, [currentFilter, updateViewState]);

  const handleSidebarFilterChange = React.useCallback((filter: string) => {
    setCurrentFilter(filter);
    // Track filter change for chatbot awareness
    trackOperation({
      type: "filter",
      details: { filter },
    });

    // Map sidebar quick filters to actual filter state
    setFilters((prevFilters) => {
      switch (filter) {
        case "all":
          // Reset filters to show all tasks
          return {
            search: prevFilters.search,
            status: "all",
            priority: "all",
            tags: [],
            sortBy: "created_at",
            sortDirection: "desc",
          };
        case "today":
          // Show today's tasks (created today)
          return {
            ...prevFilters,
            status: "all",
          };
        case "upcoming":
          // Show incomplete tasks
          return {
            ...prevFilters,
            status: "active",
          };
        case "important":
          // Show high priority tasks
          return {
            ...prevFilters,
            priority: "high",
            status: "all",
          };
        case "completed":
          // Show completed tasks
          return {
            ...prevFilters,
            status: "completed",
          };
        default:
          return prevFilters;
      }
    });
  }, []);

  const handleTagFilter = React.useCallback((tagName: string) => {
    setFilters((prevFilters) => {
      // Find the tag ID from available tags - need to access current state
      // For now, use a simpler approach
      return prevFilters; // Placeholder
    });
    // TODO: Implement proper tag filtering with stable state access
  }, []);

  const handleProjectFilter = React.useCallback((projectId: string) => {
    // Projects map to specific tag names
    const projectTagMap: Record<string, string> = {
      "1": "Work",
      "2": "Personal",
      "3": "Learning",
      "4": "Health",
    };

    const tagName = projectTagMap[projectId];
    if (tagName) {
      handleTagFilter(tagName);
      setCurrentProject(projectId);
    }
  }, [handleTagFilter]);

  const handleNewTask = React.useCallback(() => {
    setEditingTask(undefined);
    setShowTaskForm(true);
  }, []);

  const handleTaskSubmit = async (data: Record<string, unknown>) => {
    if (!userId) {
      toast({
        title: "Authentication Error",
        description: "You must be signed in to create tasks.",
        variant: "destructive",
      });
      return;
    }

    // Verify JWT token exists before attempting API call
    const token = await getToken();
    if (!token) {
      toast({
        title: "Session Expired",
        description: "Your session has expired. Please sign in again.",
        variant: "destructive",
      });
      router.push("/signin");
      return;
    }

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

        // Track operation for chatbot awareness
        trackOperation({
          type: "update",
          details: {
            taskId: editingTask.id,
            taskTitle: data.title as string,
            previousState: editingTask,
            newState: updatedTask,
          },
        });

        toast({ title: "Task updated", description: "The task has been updated." });
      } else {
        // Create new task
        const newTask = await apiClient.createTask(userId, {
          title: data.title as string,
          description: data.description as string | undefined,
          priority: data.priority as "high" | "medium" | "low",
        });
        setTasks((prev) => [newTask, ...prev]);

        // Track operation for chatbot awareness
        trackOperation({
          type: "create",
          details: {
            taskId: newTask.id,
            taskTitle: newTask.title,
            description: newTask.description || undefined,
          },
        });

        toast({ title: "Task created", description: "New task has been created." });
      }

      setShowTaskForm(false);
      setEditingTask(undefined);
    } catch (error) {
      console.error("Failed to save task:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Error",
        description: `Failed to save task: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  // Render content based on current view
  const renderContent = () => {
    if (isLoading && currentView !== "analytics" && currentView !== "templates") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
              setCurrentView("list");
            }}
            onTaskClick={handleTaskFromTypes}
          />
        );

      case "analytics":
        return <AnalyticsDashboard tasks={tasks} />;

      case "templates":
        return (
          <TaskTemplates
            onUseTemplate={handleUseTemplate}
            onQuickAction={handleQuickAction}
          />
        );

      case "ai":
        return <AIDashboardSection />;

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
            onMoveToColumn={handleMoveToColumn}
          />
        );

      case "settings":
        return (
          <div className="max-w-2xl mx-auto py-8">
            <div className="space-y-6">
              {/* User Profile Section */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-foreground dark:text-white mb-4">
                  Profile
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground dark:text-muted-foreground">
                      Name
                    </label>
                    <p className="text-foreground dark:text-white mt-1">{userName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground dark:text-muted-foreground">
                      User ID
                    </label>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1 font-mono">
                      {userId}
                    </p>
                  </div>
                </div>
              </div>

              {/* App Preferences */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-foreground dark:text-white mb-4">
                  Preferences
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground dark:text-white">Dark Mode</p>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                        Toggle between light and dark themes
                      </p>
                    </div>
                    <ThemeToggle />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground dark:text-white">Default View</p>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                        Your preferred task view mode
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground dark:text-muted-foreground">
                      {taskViewMode}
                    </span>
                  </div>
                </div>
              </div>

              {/* Data Management */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-foreground dark:text-white mb-4">
                  Data
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-foreground dark:text-white mb-1">
                      Total Tasks
                    </p>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                      {tasks.length} tasks loaded
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground dark:text-white mb-1">
                      Completed Tasks
                    </p>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                      {tasks.filter(t => t.completed).length} completed
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      loadTasks();
                      toast({
                        title: "Refreshed",
                        description: "Task data has been refreshed.",
                      });
                    }}
                  >
                    Refresh Data
                  </Button>
                </div>
              </div>

              {/* Account Actions */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-foreground dark:text-white mb-4">
                  Account
                </h3>
                <Button
                  variant="destructive"
                  onClick={handleLogout}
                >
                  Sign Out
                </Button>
              </div>
            </div>
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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-premium">
            {viewModes.map((mode) => (
              <motion.div
                key={mode.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTaskViewMode(mode.id)}
                  className={cn(
                    "gap-2 rounded-xl transition-all duration-300",
                    taskViewMode === mode.id
                      ? "bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white shadow-lg"
                      : "hover:bg-white/50 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <mode.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{mode.label}</span>
                </Button>
              </motion.div>
            ))}
          </div>

          <FilterPanel
            filters={filters}
            availableTags={availableTags.map(tag => ({ id: tag.id, name: tag.name, color: tag.color }))}
            onFiltersChange={setFilters}
            variant="inline"
          />
        </div>

        {/* Task Content */}
        <div>
          {componentTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
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
              </div>
            ) : (
              <div>
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
                    onMoveToColumn={handleMoveToColumn}
                  />
                )}
                {taskViewMode === "calendar" && (
                  <CalendarView tasks={componentTasks} onTaskClick={handleEdit} />
                )}
              </div>
            )}
        </div>
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
    <div className="flex min-h-screen bg-mesh-gradient bg-grid-premium relative overflow-hidden">
      {/* Premium Floating Orbs */}
      <div className="orb-container">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* Premium Sidebar */}
      <PremiumSidebar
        projects={projects}
        tags={availableTags}
        currentView={currentView}
        currentFilter={currentFilter}
        currentProject={currentProject}
        selectedTagIds={filters.tags}
        filterCounts={filterCounts}
        onNavigate={handleSidebarNavigate}
        onFilterChange={handleSidebarFilterChange}
        onProjectChange={handleProjectFilter}
        onTagClick={handleTagFilter}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header
          ref={headerRef}
          className="sticky top-0 z-40 backdrop-blur-2xl bg-white/50 dark:bg-black/20 border-b border-white/20 dark:border-white/10"
        >
          <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-2">
              {/* Page Title */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  {currentView === "analytics" && <BarChart3 className="w-6 h-6 bg-gradient-to-br from-violet-500 to-fuchsia-500 bg-clip-text text-transparent" />}
                  {currentView === "templates" && <Sparkles className="w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-500 bg-clip-text text-transparent" />}
                  {currentView === "ai" && <Brain className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 bg-clip-text text-transparent" />}
                  {currentView === "settings" && <SettingsIcon className="w-6 h-6 text-muted-foreground" />}
                  {(!currentView || currentView === "dashboard" || currentView === "tasks") && <Target className="w-6 h-6 bg-gradient-to-br from-violet-500 to-purple-500 bg-clip-text text-transparent" />}
                  <span className="gradient-text">
                    {currentView === "dashboard" || currentView === "tasks" || !currentView
                      ? "Dashboard"
                      : currentView === "ai"
                      ? "AI Command Center"
                      : currentView.charAt(0).toUpperCase() + currentView.slice(1)}
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground dark:text-muted-foreground hidden md:block">
                  {currentView === "analytics" && "Track your productivity and insights"}
                  {currentView === "templates" && "Quick-start with pre-made templates"}
                  {currentView === "ai" && "Professional AI agent with GPT-4o & MCP integration"}
                  {currentView === "settings" && "Customize your experience"}
                  {(!currentView || currentView === "dashboard" || currentView === "tasks") && "Manage your tasks efficiently"}
                </p>
              </motion.div>

              {/* Actions */}
              <motion.div
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Search */}
                {currentView !== "analytics" && currentView !== "templates" && (
                  <motion.div
                    className="relative hidden sm:block"
                    whileFocus={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search tasks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input-premium pl-10 pr-4 py-2 w-48 sm:w-64 text-sm"
                    />
                  </motion.div>
                )}

                {/* Notifications */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-xl hover:bg-white/50 dark:hover:bg-white/10 h-9 w-9 sm:h-10 sm:w-10"
                  >
                    <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                    <motion.span
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] flex items-center justify-center shadow-lg"
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      3
                    </motion.span>
                  </Button>
                </motion.div>

                {/* Logout Button */}
                <motion.div whileHover={{ scale: 1.05, rotate: 5 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="rounded-xl hover:bg-white/50 dark:hover:bg-white/10 h-9 w-9 sm:h-10 sm:w-10"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </motion.div>

                {/* New Task Button - only show on task views */}
                <AnimatePresence>
                  {(currentView === "dashboard" || currentView === "tasks" || !currentView || currentView === "list" || currentView === "luxury" || currentView === "board" || currentView === "calendar") && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={handleNewTask}
                        className="btn-premium gap-2 h-9 px-3 sm:h-10 sm:px-4"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">New Task</span>
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10 2xl:p-12 overflow-auto">
          <motion.div
            className="w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </main>
      </div>

      {/* Task Form Modal */}
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
      
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={handleConfirmedDelete}
        variant="destructive"
      />

      {/* Floating AI Chatbot Button */}
      <FloatingChatButton />
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
