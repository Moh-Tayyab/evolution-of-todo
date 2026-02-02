// @spec: specs/002-fullstack-web-app/plan.md
// Premium Sidebar Component - Luxury Glass Design with Advanced Animations
// User data fetched from real API - NO MOCK DATA

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
  LogOut,
  Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { getCurrentUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

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
  selectedTagIds?: string[];
  filterCounts?: {
    all?: number;
    today?: number;
    upcoming?: number;
    important?: number;
    completed?: number;
  };
  onNavigate?: (view: string) => void;
  onFilterChange?: (filter: string) => void;
  onProjectChange?: (projectId: string) => void;
  onTagClick?: (tagName: string) => void;
  className?: string;
}

// Navigation items with premium gradient colors
const navItems = [
  { id: "dashboard", label: "Dashboard", icon: Home, gradient: "from-violet-500 to-purple-500" },
  { id: "tasks", label: "My Tasks", icon: CheckSquare, gradient: "from-blue-500 to-cyan-500" },
  { id: "calendar", label: "Calendar", icon: Calendar, gradient: "from-purple-500 to-fuchsia-500" },
  { id: "analytics", label: "Analytics", icon: BarChart3, gradient: "from-emerald-500 to-teal-500" },
  { id: "templates", label: "Templates", icon: Sparkles, gradient: "from-amber-500 to-orange-500" },
  { id: "ai", label: "AI Center", icon: Brain, gradient: "from-fuchsia-500 to-pink-500" },
  { id: "settings", label: "Settings", icon: Settings, gradient: "from-slate-400 to-slate-500" },
];

// Quick filters (counts will be passed as prop)
const quickFilters = [
  { id: "all", label: "All Tasks", icon: Layers, count: 0 },
  { id: "today", label: "Today", icon: Clock, count: 0 },
  { id: "upcoming", label: "Upcoming", icon: Calendar, count: 0 },
  { id: "important", label: "Important", icon: Star, count: 0 },
  { id: "completed", label: "Completed", icon: CheckSquare, count: 0 },
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
    { id: "4", name: "Meeting", color: "#06b6d4", count: 3 },
    { id: "5", name: "Research", color: "#10b981", count: 4 },
  ],
  currentView = "dashboard",
  currentFilter = "all",
  currentProject = "",
  selectedTagIds = [],
  filterCounts = {},
  onNavigate,
  onFilterChange,
  onProjectChange,
  onTagClick,
  className,
}: PremiumSidebarProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [user, setUser] = React.useState<{ name?: string; email?: string } | null>(null);

  const router = useRouter();
  const { toast } = useToast();

  // Fetch current user data on mount
  React.useEffect(() => {
    getCurrentUser().then(userData => {
      if (userData) {
        setUser(userData);
      }
    }).catch(err => {
      console.error("Failed to fetch user:", err);
    });
  }, []);

  const sidebarWidth = isCollapsed ? "w-20" : "w-72";

  // Update quickFilters with actual counts from props
  const dynamicQuickFilters = React.useMemo(() => {
    return quickFilters.map(filter => ({
      ...filter,
      count: (filterCounts as Record<string, number>)?.[filter.id] ?? 0
    }));
  }, [filterCounts]);

  // Generate initials from user name or email
  const getInitials = () => {
    if (user?.name) {
      const parts = user.name.split(" ").filter(Boolean);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return (parts[0][0] + (parts[0][1] || "")).toUpperCase();
    }
    if (user?.email) {
      return (user.email[0] + user.email[1]).toUpperCase();
    }
    return "JD"; // Fallback
  };

  // Get display name
  const getDisplayName = () => {
    return user?.name || user?.email?.split("@")[0] || "User";
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      // Sign out using better-auth
      await fetch("/api/auth/signout", { method: "POST" });
      // Clear localStorage
      localStorage.removeItem("fastapi_jwt_token");
      localStorage.removeItem("fastapi_user_id");
      // Redirect to sign in
      router.push("/signin");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  // Stable handlers using useCallback to prevent unnecessary re-renders
  const handleNavClick = React.useCallback((itemId: string) => {
    onNavigate?.(itemId);
    setIsMobileOpen(false);
  }, [onNavigate]);

  const handleFilterClick = React.useCallback((filterId: string) => {
    onFilterChange?.(filterId);
    setIsMobileOpen(false);
  }, [onFilterChange]);

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
          "fixed lg:sticky top-0 z-50 h-screen backdrop-blur-2xl bg-white/70 dark:bg-black/20 border-r border-white/20 dark:border-white/10 transition-all duration-300 ease-in-out",
          sidebarWidth,
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className
        )}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo / Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 dark:border-white/5">
            <AnimatePresence mode="wait">
              {!isCollapsed ? (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex items-center gap-3 overflow-hidden"
                >
                  <motion.div
                    className="p-2.5 rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 shadow-premium"
                    animate={{
                      boxShadow: [
                        "0 4px 20px rgba(139, 92, 246, 0.15)",
                        "0 4px 30px rgba(139, 92, 246, 0.3)",
                        "0 4px 20px rgba(139, 92, 246, 0.15)",
                      ],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Target className="w-5 h-5 text-white" />
                  </motion.div>
                  <div className="overflow-hidden">
                    <h2 className="text-lg font-bold gradient-text">
                      TaskFlow Pro
                    </h2>
                    <p className="text-xs text-muted-foreground dark:text-muted-foreground">
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
                  <motion.div
                    className="p-2.5 rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 shadow-premium"
                    animate={{
                      boxShadow: [
                        "0 4px 20px rgba(139, 92, 246, 0.15)",
                        "0 4px 30px rgba(139, 92, 246, 0.3)",
                        "0 4px 20px rgba(139, 92, 246, 0.15)",
                      ],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Target className="w-5 h-5 text-white" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Collapse Toggle - Desktop */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "hidden lg:flex shrink-0 h-8 w-8 rounded-lg hover:bg-white/50 dark:hover:bg-white/10",
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
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-6 min-h-0">
            {/* Main Navigation */}
            <div className="space-y-1">
              {!isCollapsed && (
                <p className="px-2 text-xs font-semibold text-muted-foreground dark:text-muted-foreground uppercase tracking-wider mb-2">
                  Menu
                </p>
              )}
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;

                return (
                  <motion.button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    data-testid={`nav-${item.id}`}
                    aria-current={isActive ? "page" : undefined}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden",
                      isActive
                        ? `bg-gradient-to-r ${item.gradient} text-white shadow-premium`
                        : "hover:bg-white/50 dark:hover:bg-white/10 text-foreground dark:text-slate-300"
                    )}
                  >
                    {/* Animated glow effect for active state */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                        animate={{
                          x: ["-100%", "100%"],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                    )}
                    <div className={cn(
                      "shrink-0 relative z-10",
                      isActive ? "text-white" : ""
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
                          className="font-medium text-sm relative z-10"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {isActive && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white shadow-premium z-10"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Quick Filters */}
            {!isCollapsed && (
              <div className="space-y-2">
                <p className="px-2 text-xs font-semibold text-muted-foreground dark:text-muted-foreground uppercase tracking-wider">
                  Quick Filters
                </p>
                {dynamicQuickFilters.map((filter) => {
                  const Icon = filter.icon;
                  const isActive = currentFilter === filter.id;

                  return (
                    <motion.button
                      key={filter.id}
                      onClick={() => handleFilterClick(filter.id)}
                      data-testid={`quick-filter-${filter.id}`}
                      aria-pressed={isActive}
                      layout="position"
                      whileHover={{ scale: 1.02, x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 group relative",
                        isActive
                          ? "bg-slate-200 dark:bg-slate-800"
                          : "hover:bg-slate-200/50 dark:hover:bg-slate-800/30"
                      )}
                    >
                      <div className="flex items-center gap-3 relative z-10">
                        <Icon className={cn(
                          "w-4 h-4",
                          isActive ? "text-indigo-500" : "text-muted-foreground group-hover:text-foreground dark:group-hover:text-slate-300"
                        )} />
                        <span className={cn(
                          "text-sm font-medium",
                          isActive ? "text-foreground dark:text-white" : "text-foreground dark:text-muted-foreground"
                        )}>
                          {filter.label}
                        </span>
                      </div>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs relative z-10",
                          isActive
                            ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300"
                            : "bg-slate-100 dark:bg-slate-800 text-muted-foreground"
                        )}
                      >
                        {filter.count}
                      </Badge>
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* Projects / Categories */}
            {!isCollapsed && projects.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-2">
                  <p data-testid="projects-heading" className="text-xs font-semibold text-muted-foreground dark:text-muted-foreground uppercase tracking-wider">
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
                    data-testid={`project-${project.id}`}
                    aria-pressed={currentProject === project.id}
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
                      <span className="text-sm font-medium text-foreground dark:text-slate-300">
                        {project.name}
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-slate-100 dark:bg-slate-800 text-muted-foreground text-xs"
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
                  <p data-testid="tags-heading" className="text-xs font-semibold text-muted-foreground dark:text-muted-foreground uppercase tracking-wider">
                    Tags
                  </p>
                  <Button variant="ghost" size="icon" className="h-6 w-6" title="Create new tag">
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 px-2">
                  {tags.map((tag) => {
                    const isSelected = selectedTagIds?.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => onTagClick?.(tag.name)}
                        data-testid={`tag-${tag.id}`}
                        aria-pressed={isSelected}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200",
                          "hover:scale-105 active:scale-95",
                          isSelected && "ring-2 ring-offset-1"
                        )}
                        style={{
                          backgroundColor: isSelected ? `${tag.color}40` : `${tag.color}20`,
                          color: tag.color,
                          border: `1px solid ${tag.color}40`,
                        }}
                        title={`Click to filter by ${tag.name}`}
                      >
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
                        {tag.name}
                        <span className="opacity-60">({tag.count})</span>
                      </button>
                    );
                  })}
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
                  {getInitials()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground dark:text-white truncate">
                    {getDisplayName()}
                  </p>
                  <p className="text-xs text-muted-foreground dark:text-muted-foreground truncate">
                    {user?.email || "Guest"}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <ThemeToggle />
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-md">
                  {getInitials()}
                </div>
                <ThemeToggle />
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Toggle Button */}
      <motion.div
        className="lg:hidden fixed bottom-6 right-6 z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button
          variant="default"
          size="icon"
          className="h-14 w-14 rounded-full shadow-premium-xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-500 hover:via-purple-500 hover:to-fuchsia-500"
          onClick={() => setIsMobileOpen(true)}
        >
          <Menu className="w-6 h-6 text-white" />
        </Button>
      </motion.div>
    </>
  );
}
