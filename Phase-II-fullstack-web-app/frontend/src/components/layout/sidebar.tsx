"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CheckCircle,
  Clock,
  AlertCircle,
  Tag,
  Calendar,
  Archive,
  Settings,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * @spec: Dashboard Sidebar Component
 * @description: Navigation sidebar with filters and quick stats
 * @feature: FR-003 - Task viewing functionality
 * @feature: FR-012 - Filter tasks by various criteria
 */

export interface SidebarProps {
  taskCounts?: {
    total: number;
    completed: number;
    pending: number;
    highPriority: number;
  };
  tags?: Array<{ id: string; name: string; count: number; color?: string }>;
  currentFilter?: string;
  currentTag?: string;
  onFilterChange?: (filter: string) => void;
  onTagChange?: (tag: string) => void;
  className?: string;
}

/**
 * Navigation item configuration
 */
const navItems = [
  {
    id: "all",
    label: "All Tasks",
    icon: LayoutDashboard,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    id: "today",
    label: "Today",
    icon: Calendar,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    id: "completed",
    label: "Completed",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    id: "pending",
    label: "Pending",
    icon: Clock,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
  {
    id: "high-priority",
    label: "High Priority",
    icon: AlertCircle,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  {
    id: "archived",
    label: "Archived",
    icon: Archive,
    color: "text-gray-600",
    bgColor: "bg-gray-100",
  },
];

/**
 * Sidebar - Navigation sidebar with filters and stats
 *
 * Features:
 * - Navigation filters for task views
 * - Task count badges
 * - Tag filtering with color coding
 * - Collapsible sections
 * - Responsive design (collapses on mobile)
 * - Active state highlighting
 */
export function Sidebar({
  taskCounts = {
    total: 0,
    completed: 0,
    pending: 0,
    highPriority: 0,
  },
  tags = [],
  currentFilter = "all",
  currentTag,
  onFilterChange,
  onTagChange,
  className,
}: SidebarProps) {
  const [isTagsExpanded, setIsTagsExpanded] = useState(true);

  // Get count for each filter
  const getCount = (filterId: string) => {
    switch (filterId) {
      case "all":
        return taskCounts.total;
      case "completed":
        return taskCounts.completed;
      case "pending":
        return taskCounts.pending;
      case "high-priority":
        return taskCounts.highPriority;
      default:
        return 0;
    }
  };

  return (
    <aside
      className={cn(
        "bg-white border-r border-gray-200 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto",
        className
      )}
    >
      <nav className="p-4 space-y-6">
        {/* Main Navigation */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
            Filters
          </h3>
          <ul className="space-y-1">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const count = getCount(item.id);
              const isActive = currentFilter === item.id;

              return (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <button
                    onClick={() => onFilterChange?.(item.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 group",
                      isActive
                        ? "bg-coral-50 text-coral-700 shadow-sm"
                        : "hover:bg-gray-100 text-gray-700"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className={cn(
                          "p-1.5 rounded-md transition-colors",
                          isActive ? item.bgColor : "bg-gray-100 group-hover:bg-gray-200"
                        )}
                      >
                        <Icon className={cn("w-4 h-4", isActive ? item.color : "text-gray-600")} />
                      </motion.div>
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {count > 0 && (
                      <Badge
                        variant={isActive ? "default" : "secondary"}
                        className={cn(
                          "text-xs font-semibold",
                          isActive ? "bg-coral-500 text-white" : ""
                        )}
                      >
                        {count}
                      </Badge>
                    )}
                  </button>
                </motion.li>
              );
            })}
          </ul>
        </div>

        {/* Tags Section */}
        {tags.length > 0 && (
          <div>
            <button
              onClick={() => setIsTagsExpanded(!isTagsExpanded)}
              className="flex items-center justify-between w-full px-3 mb-3 group"
            >
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Tags
              </h3>
              <motion.div
                animate={{ rotate: isTagsExpanded ? 0 : -90 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              </motion.div>
            </button>

            <AnimatePresence>
              {isTagsExpanded && (
                <motion.ul
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-1 overflow-hidden"
                >
                  {tags.map((tag, index) => {
                    const isActive = currentTag === tag.id;

                    return (
                      <motion.li
                        key={tag.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <button
                          onClick={() => onTagChange?.(tag.id)}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 group",
                            isActive
                              ? "bg-coral-50 text-coral-700 shadow-sm"
                              : "hover:bg-gray-100 text-gray-700"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: tag.color || "#D6675D",
                              }}
                            />
                            <span className="font-medium">{tag.name}</span>
                          </div>
                          <Badge
                            variant={isActive ? "default" : "secondary"}
                            className={cn(
                              "text-xs font-semibold",
                              isActive ? "bg-coral-500 text-white" : ""
                            )}
                          >
                            {tag.count}
                          </Badge>
                        </button>
                      </motion.li>
                    );
                  })}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Settings Link */}
        <div className="pt-4 border-t border-gray-200">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link
              href="/settings"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors group"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: -5 }}
                className="p-1.5 rounded-md bg-gray-100 group-hover:bg-gray-200 transition-colors"
              >
                <Settings className="w-4 h-4 text-gray-600" />
              </motion.div>
              <span className="font-medium">Settings</span>
              <ChevronRight className="w-4 h-4 ml-auto text-gray-400 group-hover:text-gray-600" />
            </Link>
          </motion.div>
        </div>
      </nav>
    </aside>
  );
}

/**
 * Collapsible sidebar for mobile
 */
export function CollapsibleSidebar({
  isOpen,
  onClose,
  ...props
}: SidebarProps & { isOpen: boolean; onClose: () => void }) {
  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={cn(
          "fixed top-16 left-0 bottom-0 w-72 bg-white border-r border-gray-200 z-50 lg:hidden",
          !isOpen && "pointer-events-none"
        )}
      >
        <Sidebar {...props} />
      </motion.aside>
    </>
  );
}
