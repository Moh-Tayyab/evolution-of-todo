// @spec: specs/002-fullstack-web-app/plan.md
// Analytics Dashboard - Charts, Progress Tracking, Productivity Insights

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
  data?: AnalyticsData;
  className?: string;
}

// Mock data generator
function generateMockData(): AnalyticsData {
  return {
    totalTasks: 47,
    completedTasks: 32,
    completionRate: 68,
    avgTasksPerDay: 4.2,
    streak: 7,
    weeklyData: [
      { day: "Mon", completed: 5, created: 3 },
      { day: "Tue", completed: 4, created: 6 },
      { day: "Wed", completed: 7, created: 4 },
      { day: "Thu", completed: 3, created: 5 },
      { day: "Fri", completed: 6, created: 4 },
      { day: "Sat", completed: 4, created: 3 },
      { day: "Sun", completed: 3, created: 2 },
    ],
    priorityDistribution: [
      { priority: "high", count: 8, completed: 6, color: "#ef4444" },
      { priority: "medium", count: 18, completed: 12, color: "#3b82f6" },
      { priority: "low", count: 21, completed: 14, color: "#22c55e" },
    ],
    categoryDistribution: [
      { category: "Work", count: 18, completed: 14, color: "#d6675d" },
      { category: "Personal", count: 12, completed: 8, color: "#6B9BD1" },
      { category: "Learning", count: 10, completed: 6, color: "#a855f7" },
      { category: "Health", count: 7, completed: 4, color: "#22c55e" },
    ],
    productivityScore: 85,
  };
}

export function AnalyticsDashboard({
  data = generateMockData(),
  className,
}: AnalyticsDashboardProps) {
  // Calculate trends (mock)
  const completionTrend = data.completionRate > 65 ? "up" : "down";
  const productivityTrend = data.avgTasksPerDay > 4 ? "up" : "down";

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Analytics Dashboard
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
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
          trendValue="+5%"
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
          trendValue="Personal best!"
          color="orange"
          delay={0.2}
        />
        <MetricCard
          label="Productivity Score"
          value={`${data.productivityScore}`}
          icon={Award}
          trend="up"
          trendValue="Top 15%"
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
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Weekly Activity
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Tasks created vs completed
              </p>
            </div>
            <BarChart3 className="w-5 h-5 text-indigo-500" />
          </div>

          <div className="space-y-4">
            {data.weeklyData.map((day, index) => {
              const maxVal = Math.max(...data.weeklyData.map((d) => d.completed), ...data.weeklyData.map((d) => d.created));
              const completedHeight = (day.completed / maxVal) * 100;
              const createdHeight = (day.created / maxVal) * 100;

              return (
                <div key={day.day} className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-medium">{day.day}</span>
                    <span className="flex items-center gap-2">
                      <span className="text-emerald-500">{day.completed} done</span>
                      <span className="text-indigo-500">{day.created} new</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1 h-16">
                    {/* Completed bar */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${completedHeight}%` }}
                      transition={{ delay: index * 0.05 + 0.3, duration: 0.5 }}
                      className="flex-1 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-lg relative group"
                    >
                      <div className="absolute inset-0 bg-emerald-300 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                    {/* Created bar */}
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

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-emerald-500" />
              <span className="text-sm text-slate-600 dark:text-slate-400">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-indigo-500" />
              <span className="text-sm text-slate-600 dark:text-slate-400">Created</span>
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
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Priority Distribution
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Task breakdown by priority
              </p>
            </div>
            <PieChart className="w-5 h-5 text-indigo-500" />
          </div>

          <div className="space-y-4">
            {data.priorityDistribution.map((priority) => {
              const percentage = Math.round((priority.count / data.totalTasks) * 100);
              const completedPercentage = Math.round((priority.completed / priority.count) * 100);

              return (
                <div key={priority.priority} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: priority.color }}
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
                        {priority.priority}
                      </span>
                    </div>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {priority.completed}/{priority.count} completed
                    </span>
                  </div>
                  <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden relative">
                    {/* Total bar */}
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                      className="h-full absolute top-0 left-0 opacity-30"
                      style={{ backgroundColor: priority.color }}
                    />
                    {/* Completed bar */}
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(percentage * completedPercentage) / 100}%` }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                      className="h-full absolute top-0 left-0"
                      style={{ backgroundColor: priority.color }}
                    />
                    {/* Percentage label */}
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-slate-700 dark:text-slate-300 mix-blend-difference">
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Category Progress
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Track completion by category
            </p>
          </div>
          <Target className="w-5 h-5 text-indigo-500" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.categoryDistribution.map((category, index) => {
            const progress = Math.round((category.completed / category.count) * 100);

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
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    {category.category}
                  </h4>
                </div>

                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                      {progress}%
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
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
              You're on a {data.streak}-day streak! Your most productive day is Wednesday with an average
              of {data.weeklyData[2].completed} tasks completed. Consider scheduling important tasks
              mid-week for optimal productivity.
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
        <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
          {value}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
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
          ? "border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          : "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700",
        size === "sm" && "px-3 py-1.5 text-xs",
        className
      )}
    >
      {children}
    </button>
  );
}
