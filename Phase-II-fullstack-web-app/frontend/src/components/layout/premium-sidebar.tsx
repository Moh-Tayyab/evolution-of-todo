// @spec: specs/002-fullstack-web-app/plan.md
// Premium Sidebar Component - Collapsible with Categories, Tags, Filters, Analytics

"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  CheckSquare,
  Calendar,
  BarChart3,
  Layers,
  Tag,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  Clock,
  Star,
  Archive,
  Sparkles,
  Folder,
  Target,
  TrendingUp,
  X,
  Plus,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export interface Project {
  id: string;
  name: string;
  icon?: string;
  color: string;
  taskCount: number;
}

export interface SidebarTag {
  id: string;
  name: string;
  color: string;
  count: number;
}

export interface PremiumSidebarProps {
  projects?: Project[];
  tags?: SidebarTag[];
  currentView?: string;
  currentFilter?: string;
  currentProject?: string;
  onNavigate?: (view: string) => void;
  onFilterChange?: (filter: string) => void;
  onProjectChange?: (projectId: string) => void;
  className?: string;
}

// Navigation items
const navItems = [
  { id: "dashboard", label: "Dashboard", icon: Home, color: "text-indigo-500" },
  { id: "tasks", label: "My Tasks", icon: CheckSquare, color: "text-blue-500" },
  { id: "calendar", label: "Calendar", icon: Calendar, color: "text-purple-500" },
  { id: "analytics", label: "Analytics", icon: BarChart3, color: "text-emerald-500" },
  { id: "templates", label: "Templates", icon: Sparkles, color: "text-blue-500" },
  { id: "settings", label: "Settings", icon: Settings, color: "text-slate-500" },
];

// Quick filters
const quickFilters = [
  { id: "all", label: "All Tasks", icon: Layers, count: 24 },
  { id: "today", label: "Today", icon: Clock, count: 5 },
  { id: "upcoming", label: "Upcoming", icon: Calendar, count: 8 },
  { id: "important", label: "Important", icon: Star, count: 3 },
  { id: "completed", label: "Completed", icon: CheckSquare, count: 18 },
];

export function PremiumSidebar({
  projects = [
    { id: "1", name: "Work Projects", color: "#d6675d", taskCount: 8 },
    { id: "2", name: "Personal", color: "#6B9BD1", taskCount: 5 },
    { id: "3", name: "Learning", color: "#a855f7", taskCount: 4 },
    { id: "4", name: "Health & Fitness", color: "#22c55e", taskCount: 3 },
  ],
  tags = [
    { id: "1", name: "Urgent", color: "#ef4444", count: 2 },
    { id: "2", name: "Design", color: "#8b5cf6", count: 5 },
    { id: "3", name: "Development", color: "#3b82f6", count: 7 },
    { id: "4", name: "Meeting", color: "#f59e0b", count: 3 },
    { id: "5", name: "Research", color: "#10b981", count: 4 },
  ],
  currentView = "dashboard",
  currentFilter = "all",
  currentProject = "",
  onNavigate,
  onFilterChange,
  onProjectChange,
  className,
}: PremiumSidebarProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  const sidebarWidth = isCollapsed ? "w-20" : "w-72";

  const handleNavClick = (itemId: string) => {
    onNavigate?.(itemId);
    setIsMobileOpen(false);
  };

  const handleFilterClick = (filterId: string) => {
    onFilterChange?.(filterId);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 z-50 h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out",
          sidebarWidth,
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className
        )}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo / Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200/50 dark:border-slate-800/50">
            <AnimatePresence mode="wait">
              {!isCollapsed ? (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex items-center gap-3 overflow-hidden"
                >
                  <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/25">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div className="overflow-hidden">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      TaskFlow Pro
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Premium Edition
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full flex justify-center"
                >
                  <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/25">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Collapse Toggle - Desktop */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "hidden lg:flex shrink-0 h-8 w-8 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50",
                isCollapsed && "rotate-180"
              )}
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {/* Mobile Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden shrink-0 h-8 w-8"
              onClick={() => setIsMobileOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-6">
            {/* Main Navigation */}
            <div className="space-y-1">
              {!isCollapsed && (
                <p className="px-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Menu
                </p>
              )}
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden",
                      isActive
                        ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                        : "hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300"
                    )}
                  >
                    <div className={cn(
                      "shrink-0",
                      isActive ? "text-white" : item.color
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <AnimatePresence mode="wait">
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.15 }}
                          className="font-medium text-sm"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {isActive && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Filters */}
            {!isCollapsed && (
              <div className="space-y-2">
                <p className="px-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Quick Filters
                </p>
                {quickFilters.map((filter) => {
                  const Icon = filter.icon;
                  const isActive = currentFilter === filter.id;

                  return (
                    <button
                      key={filter.id}
                      onClick={() => handleFilterClick(filter.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 group",
                        isActive
                          ? "bg-slate-200 dark:bg-slate-800"
                          : "hover:bg-slate-200/50 dark:hover:bg-slate-800/30"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={cn(
                          "w-4 h-4",
                          isActive ? "text-indigo-500" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                        )} />
                        <span className={cn(
                          "text-sm font-medium",
                          isActive ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"
                        )}>
                          {filter.label}
                        </span>
                      </div>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs",
                          isActive
                            ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                        )}
                      >
                        {filter.count}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Projects / Categories */}
            {!isCollapsed && projects.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-2">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Projects
                  </p>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => onProjectChange?.(project.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 group",
                      currentProject === project.id
                        ? "bg-slate-200 dark:bg-slate-800"
                        : "hover:bg-slate-200/50 dark:hover:bg-slate-800/30"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full ring-2 ring-white dark:ring-slate-900"
                        style={{ backgroundColor: project.color }}
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {project.name}
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs"
                    >
                      {project.taskCount}
                    </Badge>
                  </button>
                ))}
              </div>
            )}

            {/* Tags */}
            {!isCollapsed && tags.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-2">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Tags
                  </p>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 px-2">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200",
                        "hover:scale-105 active:scale-95"
                      )}
                      style={{
                        backgroundColor: `${tag.color}20`,
                        color: tag.color,
                        border: `1px solid ${tag.color}40`,
                      }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
                      {tag.name}
                      <span className="opacity-60">({tag.count})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Analytics Promo (when collapsed) */}
            {isCollapsed && (
              <div className="space-y-2">
                <button
                  onClick={() => handleNavClick("analytics")}
                  className="w-full flex flex-col items-center gap-1 p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-[10px] font-medium">Stats</span>
                </button>
              </div>
            )}
          </div>

          {/* User Profile Section */}
          <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50">
            {!isCollapsed ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-slate-100 to-slate-200/50 dark:from-slate-800 dark:to-slate-800/50">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-md">
                  JD
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    John Doe
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    Premium User
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <ThemeToggle />
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-md">
                  JD
                </div>
                <ThemeToggle />
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Toggle Button */}
      <Button
        variant="default"
        size="icon"
        className="lg:hidden fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu className="w-6 h-6 text-white" />
      </Button>
    </>
  );
}
