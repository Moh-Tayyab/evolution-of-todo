// @spec: specs/002-fullstack-web-app/plan.md
// Luxury View - Professional Grid Layout matching sidebar quality

"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type Task } from "@/components/tasks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Clock,
	Calendar as CalendarIcon,
	Repeat,
	Plus,
	Zap,
	Briefcase,
	Heart,
	BookOpen,
	Dumbbell,
	ShoppingBag,
	Code,
	Music,
	Coffee,
	Plane,
	Gift,
	Star,
	ChevronRight,
	Check,
	X,
	Pin,
	List,
	AlertCircle,
	Edit,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LuxuryViewProps {
  tasks: Task[];
  onToggle: (id: number) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: number) => void;
  onPin?: (id: number) => void;
}

interface Tag {
	id: string;
	name: string;
	color: string;
}

// Professional, subtle priority styling - matching sidebar quality
const priorityStyles: Record<string, { badge: string; text: string }> = {
  high: { badge: "bg-red-100 text-red-700", text: "text-red-700" },
  medium: { badge: "bg-blue-100 text-blue-700", text: "text-blue-700" },
  low: { badge: "bg-green-100 text-green-700", text: "text-green-700" },
};

export function LuxuryView({ tasks, onToggle, onEdit, onDelete, onPin }: LuxuryViewProps) {
  const priorityGroups = {
    high: tasks.filter(t => t.priority === "high"),
    medium: tasks.filter(t => t.priority === "medium"),
    low: tasks.filter(t => t.priority === "low"),
  };

  const getTaskCount = (priority: string) => {
    return priorityGroups[priority]?.length || 0;
  };

  const getCompletedCount = (priority: string) => {
    return priorityGroups[priority]?.filter(t => t.completed).length || 0;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayTasks = tasks.filter(t => {
    const taskDate = new Date(t.created_at);
    return taskDate >= today && !t.completed;
  });

  const completedToday = tasks.filter(t => {
    const taskDate = new Date(t.updated_at);
    return taskDate >= today && t.completed;
  });

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Tasks"
          value={tasks.length}
          icon={List}
          color="blue"
          trend={tasks.length > 0 ? "up" : "neutral"}
        />
        <StatCard
          title="Today's Tasks"
          value={todayTasks.length}
          icon={Clock}
          color="green"
          trend={todayTasks.length > 0 ? "up" : "neutral"}
        />
        <StatCard
          title="Completed Today"
          value={completedToday.length}
          icon={Check}
          color="emerald"
          trend={completedToday.length > 0 ? "up" : "neutral"}
        />
        <StatCard
          title="Overdue Tasks"
          value={tasks.filter(t => !t.completed && new Date(t.created_at) < new Date(Date.now() - 86400000)).length}
          icon={AlertCircle}
          color="red"
          trend="neutral"
        />
      </div>

      {/* Priority Groups */}
      <div className="space-y-6">
        {["high", "medium", "low"].map((priority) => {
          const groupTasks = priorityGroups[priority];
          if (!groupTasks || groupTasks.length === 0) return null;

          const completed = getCompletedCount(priority);

          return (
            <motion.div
              key={priority}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${priorityStyles[priority].badge}`}>
                    <span className="text-xs font-medium">{priority.toUpperCase()}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-monza-900 dark:text-white">{priority.toUpperCase()} TASKS</h3>
                </div>
                <Badge
                  variant="secondary"
                  className={`${priorityStyles[priority].text}`}
                >
                  {getCompletedCount(priority)}/{getTaskCount(priority)} completed
                </Badge>
              </div>

              <div className="space-y-3">
                {groupTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.02 }}
                    className="group relative p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 to-slate-800 transition-all hover:shadow-md hover:border-slate-300"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                          <span className="text-sm font-medium text-monza-600 dark:text-monza-400">#{task.id}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm font-medium ${task.completed ? "line-through text-monza-400" : "text-monza-900 dark:text-white"} truncate`}>
                            {task.title}
                          </h4>
                          <p className="text-xs text-monza-500 dark:text-monza-400">
                            {task.description?.slice(0, 50)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {task.priority && (
                          <Badge variant="outline" size="sm" className={`${priorityStyles[task.priority].badge} text-xs`}>
                            {task.priority}
                          </Badge>
                        )}
                        <span className="text-xs text-monza-400">
                          {new Date(task.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-monza-400 hover:text-monza-600"
                        onClick={() => onToggle(task.id)}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-monza-400 hover:text-monza-600"
                        onClick={() => onEdit(task)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-monza-400 hover:text-red-600"
                        onClick={() => onDelete(task.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-monza-400 hover:text-blue-600"
                        onClick={() => onPin(task.id)}
                      >
                        <Pin className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: "blue" | "green" | "emerald" | "red";
  trend: "up" | "neutral" | "down";
}

function StatCard({ title, value, icon: Icon, color, trend }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${color === "blue" ? "bg-blue-100 text-blue-600" : color === "green" ? "bg-green-100 text-green-600" : color === "emerald" ? "bg-emerald-100 text-emerald-600" : color === "red" ? "bg-red-100 text-red-600" : "bg-slate-100 text-monza-600"} `}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-2xl font-bold text-monza-900 dark:text-white">{value}</h4>
            <p className="text-xs text-monza-500 dark:text-monza-400">{title}</p>
          </div>
        </div>
        {trend !== "neutral" && (
          <div className={`text-xs font-medium ${trend === "up" ? "text-emerald-600" : "text-red-600"}`}>
            {trend === "up" ? "↑ 12%" : "↓ 8%"}
          </div>
        )}
      </div>
    </div>
  );
}
