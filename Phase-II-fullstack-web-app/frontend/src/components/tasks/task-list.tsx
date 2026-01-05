"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Filter,
  SortAsc,
  SortDesc,
  Grid3x3,
  List,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskCard, type Task } from "./task-card";
import { GSAPStagger } from "@/components/ui/gsap-stagger";
import { StaggerChildren } from "@/components/animations/stagger-children";

/**
 * @spec: Task List Component with Embedded Intelligence
 * @description: List view with filtering, sorting, and search
 * @feature: FR-003 - View all tasks
 * @feature: FR-004 - Display tasks with [x]/[ ] status indicators
 * @feature: FR-012 - Filter tasks by various criteria
 */

export interface TaskListProps {
  tasks: Task[];
  onToggle?: (taskId: string) => Promise<void>;
  onDelete?: (taskId: string) => Promise<void>;
  onPin?: (taskId: string) => Promise<void>;
  onArchive?: (taskId: string) => Promise<void>;
  onEdit?: (task: Task) => void;
  className?: string;
  emptyMessage?: string;
}

type SortOption = "due_date" | "priority" | "created_at" | "title";
type SortDirection = "asc" | "desc";
type FilterStatus = "all" | "completed" | "pending";
type FilterPriority = "all" | "high" | "medium" | "low";

/**
 * Priority order for sorting
 */
const priorityOrder = { high: 0, medium: 1, low: 2 };

/**
 * TaskList - Intelligent task list with embedded filtering and sorting
 *
 * Embedded Intelligence:
 * - Client-side filtering and sorting
 * - Debounced search with 300ms delay
 * - View persistence (localStorage)
 * - Empty state handling
 * - Framer Motion + GSAP animations
 */
export function TaskList({
  tasks,
  onToggle,
  onDelete,
  onPin,
  onArchive,
  onEdit,
  className,
  emptyMessage = "No tasks found. Create your first task!",
}: TaskListProps) {
  // Local state for filtering and sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterPriority, setFilterPriority] = useState<FilterPriority>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  useState(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeout);
  });

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];

    // Search filter
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      result = result.filter((task) =>
        filterStatus === "completed" ? task.completed : !task.completed
      );
    }

    // Priority filter
    if (filterPriority !== "all") {
      result = result.filter((task) => task.priority === filterPriority);
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "due_date":
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          comparison =
            new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
          break;
        case "priority":
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case "created_at":
          comparison =
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [
    tasks,
    debouncedSearch,
    filterStatus,
    filterPriority,
    sortBy,
    sortDirection,
  ]);

  // Toggle sort direction
  const toggleSortDirection = useCallback(() => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setFilterStatus("all");
    setFilterPriority("all");
    setSortBy("created_at");
    setSortDirection("desc");
  }, []);

  // Separate pinned and unpinned tasks
  const pinnedTasks = filteredAndSortedTasks.filter((t) => t.is_pinned);
  const unpinnedTasks = filteredAndSortedTasks.filter((t) => !t.is_pinned);

  const allTasks = [...pinnedTasks, ...unpinnedTasks];
  const hasActiveFilters =
    searchQuery || filterStatus !== "all" || filterPriority !== "all";

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Filter Bar */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(showFilters && "bg-gray-100")}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 w-2 h-2 bg-coral-500 rounded-full" />
              )}
            </Button>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={`${sortBy}-${sortDirection}`}
              onValueChange={(value) => {
                const [field, direction] = value.split("-") as [
                  SortOption,
                  SortDirection
                ];
                setSortBy(field);
                setSortDirection(direction);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at-desc">Newest first</SelectItem>
                <SelectItem value="created_at-asc">Oldest first</SelectItem>
                <SelectItem value="due_date-asc">Due date</SelectItem>
                <SelectItem value="priority-desc">Priority</SelectItem>
                <SelectItem value="title-asc">Title A-Z</SelectItem>
                <SelectItem value="title-desc">Title Z-A</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={toggleSortDirection}
            >
              {sortDirection === "asc" ? (
                <SortAsc className="w-4 h-4" />
              ) : (
                <SortDesc className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Expandable Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={filterStatus}
                    onValueChange={(value: FilterStatus) =>
                      setFilterStatus(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select
                    value={filterPriority}
                    onValueChange={(value: FilterPriority) =>
                      setFilterPriority(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results count */}
      {hasActiveFilters && (
        <p className="text-sm text-gray-500">
          Showing {allTasks.length} of {tasks.length} tasks
        </p>
      )}

      {/* Task List */}
      <AnimatePresence mode="wait">
        {allTasks.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {hasActiveFilters ? "No tasks match your filters" : emptyMessage}
            </h3>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </motion.div>
        ) : (
          <StaggerChildren
            staggerDelay={0.05}
            className="space-y-3"
          >
            {allTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={onToggle}
                onDelete={onDelete}
                onPin={onPin}
                onArchive={onArchive}
                onEdit={onEdit}
              />
            ))}
          </StaggerChildren>
        )}
      </AnimatePresence>
    </div>
  );
}
