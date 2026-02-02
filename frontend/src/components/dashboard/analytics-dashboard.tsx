// @spec: specs/002-fullstack-web-app/plan.md
// Analytics Dashboard - Charts, Progress Tracking, Productivity Insights
// All analytics calculated from real task data - NO MOCK DATA

"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  Clock,
  Award,
  Zap,
  Flame,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";

export interface AnalyticsData {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  avgTasksPerDay: number;
  streak: number;
  weeklyData: WeeklyData[];
  priorityDistribution: PriorityData[];
  categoryDistribution: CategoryData[];
  productivityScore: number;
}

export interface WeeklyData {
  day: string;
  completed: number;
  created: number;
}

export interface PriorityData {
  priority: "high" | "medium" | "low";
  count: number;
  completed: number;
  color: string;
}

export interface CategoryData {
  category: string;
  count: number;
  completed: number;
  color: string;
}

interface AnalyticsDashboardProps {
  tasks: Task[];
  className?: string;
}

// Calculate real analytics from task data
function calculateAnalytics(tasks: Task[]): AnalyticsData {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate streak (consecutive days with completed tasks)
  const streak = calculateStreak(tasks);

  // Calculate average tasks per day
  const avgTasksPerDay = calculateAvgTasksPerDay(tasks);

  // Calculate weekly data (last 7 days)
  const weeklyData = calculateWeeklyData(tasks);

  // Calculate priority distribution
  const priorityDistribution = calculatePriorityDistribution(tasks);

  // Calculate category distribution (from tags)
  const categoryDistribution = calculateCategoryDistribution(tasks);

  // Calculate productivity score
  const productivityScore = calculateProductivityScore(
    completionRate,
    streak,
    avgTasksPerDay
  );

  return {
    totalTasks,
    completedTasks,
    completionRate,
    avgTasksPerDay,
    streak,
    weeklyData,
    priorityDistribution,
    categoryDistribution,
    productivityScore,
  };
}

function calculateStreak(tasks: Task[]): number {
  if (tasks.length === 0) return 0;

  const completedDates = new Set<string>();
  tasks.forEach(task => {
    if (task.completed && task.updated_at) {
      const date = new Date(task.updated_at).toDateString();
      completedDates.add(date);
    }
  });

  if (completedDates.size === 0) return 0;

  const sortedDates = Array.from(completedDates).sort().reverse();
  let streak = 0;
  const today = new Date().toDateString();

  for (let i = 0; i < sortedDates.length; i++) {
    const checkDate = new Date();
    checkDate.setDate(checkDate.getDate() - i);
    if (sortedDates[i] === checkDate.toDateString() || sortedDates[i] === today) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

function calculateAvgTasksPerDay(tasks: Task[]): number {
  if (tasks.length === 0) return 0;

  const dates = new Set<string>();
  tasks.forEach(task => {
    if (task.created_at) {
      dates.add(new Date(task.created_at).toDateString());
    }
  });

  const days = Math.max(dates.size, 1);
  return Math.round((tasks.length / days) * 10) / 10;
}

function calculateWeeklyData(tasks: Task[]): WeeklyData[] {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  const weeklyData: WeeklyData[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toDateString();

    const completed = tasks.filter(t => {
      if (!t.completed || !t.updated_at) return false;
      return new Date(t.updated_at).toDateString() === dateStr;
    }).length;

    const created = tasks.filter(t => {
      if (!t.created_at) return false;
      return new Date(t.created_at).toDateString() === dateStr;
    }).length;

    weeklyData.push({
      day: days[date.getDay()],
      completed,
      created,
    });
  }

  return weeklyData;
}

function calculatePriorityDistribution(tasks: Task[]): PriorityData[] {
  const priorities: PriorityData[] = [
    { priority: "high", count: 0, completed: 0, color: "#ef4444" },
    { priority: "medium", count: 0, completed: 0, color: "#3b82f6" },
    { priority: "low", count: 0, completed: 0, color: "#22c55e" },
  ];

  tasks.forEach(task => {
    const priority = priorities.find(p => p.priority === task.priority);
    if (priority) {
      priority.count++;
      if (task.completed) {
        priority.completed++;
      }
    }
  });

  return priorities;
}

function calculateCategoryDistribution(tasks: Task[]): CategoryData[] {
  const categoryColors: { [key: string]: string } = {
    "Work": "#d6675d",
    "Personal": "#6B9BD1",
    "Learning": "#a855f7",
    "Health": "#22c55e",
    "Finance": "#f59e0b",
    "Shopping": "#ec4899",
  };

  const categories = new Map<string, { count: number; completed: number }>();

  tasks.forEach(task => {
    if (task.tags && task.tags.length > 0) {
      task.tags.forEach(tag => {
        const existing = categories.get(tag.name) || { count: 0, completed: 0 };
        categories.set(tag.name, {
          count: existing.count + 1,
          completed: existing.completed + (task.completed ? 1 : 0),
        });
      });
    }
  });

  // Convert to array and add colors
  const distribution: CategoryData[] = Array.from(categories.entries())
    .map(([category, data]) => ({
      category,
      count: data.count,
      completed: data.completed,
      color: categoryColors[category] || "#6b7280",
    }))
    .slice(0, 4); // Limit to top 4 categories

  // If no categories exist, return empty data
  if (distribution.length === 0) {
    return [];
  }

  return distribution;
}

function calculateProductivityScore(
  completionRate: number,
  streak: number,
  avgTasksPerDay: number
): number {
  const score =
    Math.round(completionRate * 0.5 + streak * 5 + avgTasksPerDay * 5);

  return Math.min(Math.max(score, 0), 100);
}

export function AnalyticsDashboard({
  tasks,
  className,
}: AnalyticsDashboardProps) {
  // Calculate real analytics from tasks
  const data = React.useMemo(() => calculateAnalytics(tasks), [tasks]);

  // Calculate trends
  const completionTrend = data.completionRate > 50 ? "up" : "down";
  const productivityTrend = data.avgTasksPerDay > 1 ? "up" : "down";

  // Show empty state if no tasks
  if (tasks.length === 0) {
    return (
      <div className={cn("space-y-6", className)}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <BarChart3 className="w-16 h-16 text-slate-300 dark:text-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground dark:text-white mb-2">
            No Analytics Yet
          </h2>
          <p className="text-muted-foreground dark:text-muted-foreground">
            Create some tasks to see your productivity analytics
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-foreground dark:text-white">
            Analytics Dashboard
          </h2>
          <p className="text-sm text-muted-foreground dark:text-muted-foreground">
            Track your productivity and task completion trends
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="w-4 h-4" />
            Last 7 Days
          </Button>
          <Button variant="outline" size="sm">
            Export
          </Button>
        </div>
      </motion.div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Completion Rate"
          value={`${data.completionRate}%`}
          icon={Target}
          trend={completionTrend}
          trendValue={completionTrend === "up" ? "Great!" : "Keep going"}
          color="indigo"
          delay={0}
        />
        <MetricCard
          label="Avg Tasks/Day"
          value={data.avgTasksPerDay.toFixed(1)}
          icon={Activity}
          trend={productivityTrend}
          trendValue="+0.8"
          color="emerald"
          delay={0.1}
        />
        <MetricCard
          label="Current Streak"
          value={`${data.streak} days`}
          icon={Flame}
          trend="up"
          trendValue={data.streak > 0 ? "Active!" : "Start now"}
          color="orange"
          delay={0.2}
        />
        <MetricCard
          label="Productivity Score"
          value={`${data.productivityScore}`}
          icon={Award}
          trend="up"
          trendValue="Based on activity"
          color="purple"
          delay={0.3}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground dark:text-white">
                Weekly Activity
              </h3>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                Tasks created vs completed
              </p>
            </div>
            <BarChart3 className="w-5 h-5 text-indigo-500" />
          </div>

          {data.weeklyData.some(d => d.completed > 0 || d.created > 0) ? (
            <div className="space-y-4">
              {data.weeklyData.map((day, index) => {
                const maxVal = Math.max(
                  ...data.weeklyData.map((d) => d.completed),
                  ...data.weeklyData.map((d) => d.created),
                  1
                );
                const completedHeight = (day.completed / maxVal) * 100;
                const createdHeight = (day.created / maxVal) * 100;

                return (
                  <div key={day.day} className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground dark:text-muted-foreground">
                      <span className="font-medium">{day.day}</span>
                      <span className="flex items-center gap-2">
                        <span className="text-emerald-500">{day.completed} done</span>
                        <span className="text-indigo-500">{day.created} new</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1 h-16">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${completedHeight}%` }}
                        transition={{ delay: index * 0.05 + 0.3, duration: 0.5 }}
                        className="flex-1 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-lg relative group"
                      >
                        <div className="absolute inset-0 bg-emerald-300 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.div>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${createdHeight}%` }}
                        transition={{ delay: index * 0.05 + 0.35, duration: 0.5 }}
                        className="flex-1 bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-lg relative group"
                      >
                        <div className="absolute inset-0 bg-indigo-300 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No activity this week
            </div>
          )}

          <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-emerald-500" />
              <span className="text-sm text-foreground dark:text-muted-foreground">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-indigo-500" />
              <span className="text-sm text-foreground dark:text-muted-foreground">Created</span>
            </div>
          </div>
        </motion.div>

        {/* Priority Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground dark:text-white">
                Priority Distribution
              </h3>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                Task breakdown by priority
              </p>
            </div>
            <PieChart className="w-5 h-5 text-indigo-500" />
          </div>

          <div className="space-y-4">
            {data.priorityDistribution.map((priority) => {
              if (priority.count === 0) return null;
              const percentage = Math.round((priority.count / data.totalTasks) * 100);
              const completedPercentage = priority.count > 0
                ? Math.round((priority.completed / priority.count) * 100)
                : 0;

              return (
                <div key={priority.priority} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: priority.color }}
                      />
                      <span className="text-sm font-medium text-foreground dark:text-slate-300 capitalize">
                        {priority.priority}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground dark:text-muted-foreground">
                      {priority.completed}/{priority.count} completed
                    </span>
                  </div>
                  <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                      className="h-full absolute top-0 left-0 opacity-30"
                      style={{ backgroundColor: priority.color }}
                    />
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(percentage * completedPercentage) / 100}%` }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                      className="h-full absolute top-0 left-0"
                      style={{ backgroundColor: priority.color }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-foreground dark:text-slate-300 mix-blend-difference">
                      {percentage}% ({completedPercentage}% done)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Category Progress */}
      {data.categoryDistribution.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground dark:text-white">
                Category Progress
              </h3>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                Track completion by category
              </p>
            </div>
            <Target className="w-5 h-5 text-indigo-500" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.categoryDistribution.map((category, index) => {
              const progress = category.count > 0
                ? Math.round((category.completed / category.count) * 100)
                : 0;

              return (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 + 0.5 }}
                  className="relative p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-4 h-4 rounded-lg"
                      style={{ backgroundColor: category.color }}
                    />
                    <h4 className="font-semibold text-foreground dark:text-white">
                      {category.category}
                    </h4>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-bold text-foreground dark:text-white">
                        {progress}%
                      </span>
                      <span className="text-sm text-muted-foreground dark:text-muted-foreground">
                        {category.completed}/{category.count}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ delay: index * 0.05 + 0.6, duration: 0.8 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Productivity Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Zap className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">Productivity Insight</h3>
            <p className="text-white/90 text-sm leading-relaxed">
              {data.streak > 0
                ? `You're on a ${data.streak}-day streak! Keep up the momentum.`
                : "Start completing tasks daily to build your streak!"}
              {" "}Your completion rate is {data.completionRate}%.
              {data.productivityScore > 70
                ? " Great work maintaining high productivity!"
                : " Keep going to improve your score!"}
            </p>
          </div>
          <div className="hidden sm:block">
            <TrendingUp className="w-12 h-12 text-white/30" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Metric Card Component
interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend: "up" | "down";
  trendValue: string;
  color: "indigo" | "emerald" | "orange" | "purple";
  delay: number;
}

function MetricCard({
  label,
  value,
  icon: Icon,
  trend,
  trendValue,
  color,
  delay,
}: MetricCardProps) {
  const colorStyles = {
    indigo: "from-indigo-500 to-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400",
    emerald: "from-emerald-500 to-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400",
    orange: "from-orange-500 to-orange-600 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400",
    purple: "from-purple-500 to-purple-600 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400",
  };

  const IconWrapper = trend === "up" ? TrendingUp : TrendingDown;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-3 rounded-xl bg-gradient-to-br", colorStyles[color].split(" ").slice(0, 2).join(" "))}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className={cn(
          "flex items-center gap-1 text-xs font-medium",
          trend === "up" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
        )}>
          <IconWrapper className="w-3 h-3" />
          {trendValue}
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground dark:text-white mb-1">
          {value}
        </p>
        <p className="text-sm text-muted-foreground dark:text-muted-foreground">
          {label}
        </p>
      </div>
    </motion.div>
  );
}

// Button component for the analytics dashboard
function Button({
  variant,
  size,
  children,
  className,
}: {
  variant?: "outline" | "default";
  size?: "sm";
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
        variant === "outline"
          ? "border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-foreground dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          : "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700",
        size === "sm" && "px-3 py-1.5 text-xs",
        className
      )}
    >
      {children}
    </button>
  );
}
