"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Clock,
  TrendingUp,
  Target,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Plus,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Task } from "@/types";

interface ProfessionalDashboardProps {
  tasks: Task[];
  userName?: string;
  onCreateTask?: () => void;
  onViewAllTasks?: () => void;
  onTaskClick?: (task: Task) => void;
}

export function ProfessionalDashboard({
  tasks,
  userName = "User",
  onCreateTask,
  onViewAllTasks,
  onTaskClick,
}: ProfessionalDashboardProps) {
  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // Calculate stats
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

  const highPriorityTasks = tasks.filter(t => t.priority === "high" && !t.completed);

  const recentlyCreated = tasks.filter(t => {
    const taskDate = new Date(t.created_at);
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() - 7);
    return taskDate >= weekFromNow;
  });

  // Priority breakdown
  const highPriorityCount = tasks.filter(t => t.priority === "high" && !t.completed).length;
  const mediumPriorityCount = tasks.filter(t => t.priority === "medium" && !t.completed).length;
  const lowPriorityCount = tasks.filter(t => t.priority === "low" && !t.completed).length;

  // Completion rate
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Category breakdown (using tags)
  const categoryBreakdown = React.useMemo(() => {
    const categories = new Map<string, number>();
    tasks.forEach(task => {
      if (!task.completed) {
        task.tags?.forEach(tag => {
          categories.set(tag.name, (categories.get(tag.name) || 0) + 1);
        });
      }
    });
    return Array.from(categories.entries()).slice(0, 4);
  }, [tasks]);

  // Stats cards data
  const statsCards = [
    {
      title: "Completed Today",
      value: completedToday.length,
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
      trend: null,
    },
    {
      title: "Pending Tasks",
      value: todayTasks.length,
      icon: Clock,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      trend: null,
    },
    {
      title: "High Priority",
      value: highPriorityTasks.length,
      icon: AlertCircle,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-950/30",
      trend: highPriorityTasks.length > 0 ? "urgent" : null,
    },
    {
      title: "Completion Rate",
      value: `${completionRate}%`,
      icon: TrendingUp,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      trend: completionRate > 70 ? "good" : completionRate > 40 ? "average" : "low",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {getGreeting()}, {userName.split(" ")[0]} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your tasks today
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onViewAllTasks}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            View All
          </Button>
          <Button
            onClick={onCreateTask}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            New Task
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              "rounded-xl p-5 border border-border bg-card",
              "hover:shadow-md transition-shadow duration-200"
            )}
          >
            <div className="flex items-start justify-between">
              <div className={cn("p-2.5 rounded-lg", stat.bgColor)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
              {stat.trend === "urgent" && (
                <Badge variant="destructive" className="text-xs">
                  Needs Action
                </Badge>
              )}
              {stat.trend === "good" && (
                <Badge className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  On Track
                </Badge>
              )}
            </div>
            <div className="mt-4">
              <div className="text-2xl font-semibold text-foreground">
                {stat.value}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{stat.title}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">
                  Today's Priority Tasks
                </h2>
              </div>
              <Badge variant="secondary" className="text-xs">
                {todayTasks.length} tasks
              </Badge>
            </div>

            {/* Task List */}
            <div className="divide-y divide-border">
              {todayTasks.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No tasks due today. Great job!</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onCreateTask}
                    className="mt-4"
                  >
                    Create a Task
                  </Button>
                </div>
              ) : (
                todayTasks.slice(0, 5).map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    onClick={() => onTaskClick?.(task)}
                    className="px-6 py-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "mt-0.5 w-2 h-2 rounded-full flex-shrink-0",
                          task.priority === "high" && "bg-red-500",
                          task.priority === "medium" && "bg-blue-500",
                          task.priority === "low" && "bg-emerald-500"
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {task.description}
                          </p>
                        )}
                        {task.tags && task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {task.tags.slice(0, 2).map(tag => (
                              <Badge
                                key={tag.id}
                                variant="outline"
                                className="text-[10px] px-2 py-0"
                              >
                                {tag.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] capitalize shrink-0",
                          task.priority === "high" && "border-red-200 text-red-700 dark:border-red-900/50 dark:text-red-400",
                          task.priority === "medium" && "border-blue-200 text-blue-700 dark:border-blue-900/50 dark:text-blue-400",
                          task.priority === "low" && "border-emerald-200 text-emerald-700 dark:border-emerald-900/50 dark:text-emerald-400"
                        )}
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {todayTasks.length > 5 && (
              <div className="px-6 py-3 border-t border-border bg-muted/30">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onViewAllTasks}
                  className="w-full text-sm"
                >
                  View all {todayTasks.length} tasks
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          {/* Recent Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-border bg-card overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">
                  Recent
                </h3>
              </div>
              <Badge variant="secondary" className="text-[10px]">
                7 days
              </Badge>
            </div>
            <div className="divide-y divide-border">
              {recentlyCreated.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                  No recent tasks
                </div>
              ) : (
                recentlyCreated.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onTaskClick?.(task)}
                    className="px-5 py-3 hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {task.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(task.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {!task.completed && (
                        <div className={cn(
                          "w-2 h-2 rounded-full shrink-0",
                          task.priority === "high" && "bg-red-500",
                          task.priority === "medium" && "bg-blue-500",
                          task.priority === "low" && "bg-emerald-500"
                        )} />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Task by Category */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-xl border border-border bg-card overflow-hidden"
          >
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
              <BarChart3 className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                By Category
              </h3>
            </div>
            <div className="p-5 space-y-3">
              {categoryBreakdown.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Add tags to organize tasks
                </p>
              ) : (
                categoryBreakdown.map(([category, count], index) => {
                  const maxCount = Math.max(...categoryBreakdown.map(([, c]) => c));
                  const percentage = (count / maxCount) * 100;
                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="text-foreground font-medium">{category}</span>
                        <span className="text-muted-foreground">{count} tasks</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                          className="h-full bg-primary rounded-full"
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>

          {/* Priority Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl border border-border bg-card p-5"
          >
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Priority Breakdown
            </h3>
            <div className="space-y-3">
              {[
                { label: "High", count: highPriorityCount, color: "bg-red-500" },
                { label: "Medium", count: mediumPriorityCount, color: "bg-blue-500" },
                { label: "Low", count: lowPriorityCount, color: "bg-emerald-500" },
              ].map((item, index) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={cn("w-3 h-3 rounded-full", item.color)} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-foreground">{item.label}</span>
                      <span className="text-muted-foreground">{item.count}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(item.count, 0) * 10}%` }}
                        transition={{ delay: 0.45 + index * 0.1, duration: 0.5 }}
                        className={cn("h-full rounded-full", item.color)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Weekly Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="rounded-xl border border-border bg-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Weekly Progress</h3>
          <Badge variant="secondary" className="text-xs">
            Last 7 days
          </Badge>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }, (_, i) => {
            const date = new Date(today);
            date.setDate(date.getDate() - (6 - i));
            const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
            const dayDate = date.getDate();
            const isToday = date.toDateString() === today.toDateString();

            // Get completed count for this day
            const dayCompleted = tasks.filter(t => {
              if (!t.completed) return false;
              const updatedDate = new Date(t.updated_at);
              return updatedDate.toDateString() === date.toDateString();
            }).length;

            return (
              <div
                key={i}
                className={cn(
                  "text-center p-3 rounded-lg border",
                  isToday
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/30 border-border hover:bg-muted/50 transition-colors"
                )}
              >
                <div className="text-xs mb-1 opacity-80">{dayName}</div>
                <div className="text-sm font-semibold mb-2">{dayDate}</div>
                <div className="text-xs opacity-80">
                  {dayCompleted} {dayCompleted === 1 ? "task" : "tasks"}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
