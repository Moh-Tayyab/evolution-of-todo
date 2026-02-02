// @spec: specs/002-fullstack-web-app/spec.md
// @spec: Luxury View - Premium Grid Layout with advanced glass effects and animations

"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
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
	Sparkles,
	TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { cardVariants, premiumStaggerContainer, statCardVariants, getAccessibleVariants } from "@/lib/animations/variants";

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

// Premium priority styling with violet-based palette
const priorityStyles: Record<string, { badge: string; text: string; glow: string; icon: React.ElementType }> = {
  high: {
    badge: "bg-gradient-to-r from-rose-500/20 to-pink-500/20 border-rose-500/30 text-rose-700 dark:text-rose-300",
    text: "text-rose-700 dark:text-rose-300",
    glow: "shadow-rose-500/20",
    icon: AlertCircle,
  },
  medium: {
    badge: "bg-gradient-to-r from-violet-500/20 to-purple-500/20 border-violet-500/30 text-violet-700 dark:text-violet-300",
    text: "text-violet-700 dark:text-violet-300",
    glow: "shadow-violet-500/20",
    icon: TrendingUp,
  },
  low: {
    badge: "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-700 dark:text-emerald-300",
    text: "text-emerald-700 dark:text-emerald-300",
    glow: "shadow-emerald-500/20",
    icon: Check,
  },
};

const priorityGradients: Record<string, string> = {
  high: "from-rose-500 via-pink-500 to-rose-500",
  medium: "from-violet-500 via-purple-500 to-violet-500",
  low: "from-emerald-500 via-teal-500 to-emerald-500",
};

// Premium animated stat card
interface PremiumStatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  gradient: string;
  index: number;
  trend?: "up" | "down" | "neutral";
}

function PremiumStatCard({ title, value, icon: Icon, gradient, index, trend }: PremiumStatCardProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const adjustedVariants = getAccessibleVariants(statCardVariants, prefersReducedMotion);

  return (
    <motion.div
      variants={adjustedVariants}
      custom={index}
      whileHover={{ scale: prefersReducedMotion ? 1 : 1.02, y: prefersReducedMotion ? 0 : -5 }}
      className="group glass-card-hover glass-noise p-6 relative overflow-hidden"
    >
      {/* Animated gradient orb */}
      <motion.div
        className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${gradient} rounded-full blur-3xl opacity-30`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.4, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Shimmer effect */}
      <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-center gap-1 text-xs font-semibold ${
                trend === "up"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : trend === "down"
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-muted-foreground"
              }`}
            >
              {trend === "up" && <TrendingUp className="w-3 h-3" />}
              {trend === "up" ? "+12%" : trend === "down" ? "-5%" : "0%"}
            </motion.div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 + 0.2 }}
        >
          <h3 className="stat-value text-3xl font-bold mb-1">{value}</h3>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
        </motion.div>
      </div>
    </motion.div>
  );
}

export function LuxuryView({ tasks, onToggle, onEdit, onDelete, onPin }: LuxuryViewProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;

  const priorityGroups: Record<string, Task[]> = {
    high: tasks.filter(t => t.priority === "high"),
    medium: tasks.filter(t => t.priority === "medium"),
    low: tasks.filter(t => t.priority === "low"),
  };

  const adjustedContainerVariants = getAccessibleVariants(premiumStaggerContainer, prefersReducedMotion);
  const adjustedCardVariants = getAccessibleVariants(cardVariants, prefersReducedMotion);

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
    <motion.div
      className="space-y-8"
      variants={adjustedContainerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Premium Stats Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={adjustedContainerVariants}
      >
        <PremiumStatCard
          title="Total Tasks"
          value={tasks.length}
          icon={List}
          gradient="from-violet-500 via-purple-500 to-fuchsia-500"
          index={0}
          trend={tasks.length > 0 ? "up" : "neutral"}
        />
        <PremiumStatCard
          title="Today's Tasks"
          value={todayTasks.length}
          icon={Clock}
          gradient="from-amber-500 via-yellow-500 to-orange-500"
          index={1}
          trend={todayTasks.length > 0 ? "up" : "neutral"}
        />
        <PremiumStatCard
          title="Completed Today"
          value={completedToday.length}
          icon={Check}
          gradient="from-emerald-500 via-teal-500 to-cyan-500"
          index={2}
          trend={completedToday.length > 0 ? "up" : "neutral"}
        />
        <PremiumStatCard
          title="Overdue"
          value={tasks.filter(t => !t.completed && new Date(t.created_at) < new Date(Date.now() - 86400000)).length}
          icon={AlertCircle}
          gradient="from-rose-500 via-pink-500 to-red-500"
          index={3}
          trend="neutral"
        />
      </motion.div>

      {/* Premium Priority Groups */}
      <motion.div className="space-y-6" variants={adjustedContainerVariants}>
        <AnimatePresence>
          {["high", "medium", "low"].map((priority) => {
            const groupTasks = priorityGroups[priority];
            if (!groupTasks || groupTasks.length === 0) return null;

            const completed = getCompletedCount(priority);
            const PriorityIcon = priorityStyles[priority].icon;

            return (
              <motion.div
                key={priority}
                variants={adjustedCardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="glass-card-hover glass-noise p-6"
              >
                {/* Animated gradient line */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${priorityGradients[priority]}`} />

                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <motion.div
                      className={`p-2.5 rounded-xl bg-gradient-to-br ${priorityGradients[priority]} shadow-lg ${priorityStyles[priority].glow}`}
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <PriorityIcon className="w-5 h-5 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground dark:text-white">
                        {priority.toUpperCase()} PRIORITY
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {groupTasks.length} task{groupTasks.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <motion.div
                    className={`px-4 py-2 rounded-xl border ${priorityStyles[priority].badge} font-semibold text-sm`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Sparkles className="w-4 h-4 inline mr-1" />
                    {completed}/{getTaskCount(priority)} done
                  </motion.div>
                </div>

                <div className="space-y-3">
                  <AnimatePresence>
                    {groupTasks.map((task, index) => (
                      <motion.div
                        key={task.id}
                        variants={adjustedCardVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        whileHover={{ scale: prefersReducedMotion ? 1 : 1.01 }}
                        transition={{ delay: index * 0.05 }}
                        className="group relative p-4 rounded-xl border border-border/50 bg-gradient-to-r from-white/50 to-transparent dark:from-white/5 dark:to-transparent hover:shadow-lg transition-all duration-300"
                      >
                        {/* Hover glow effect */}
                        <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${priorityGradients[priority]} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                        <div className="relative flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <motion.div
                              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${priorityGradients[priority]} flex items-center justify-center shadow-md`}
                              whileHover={{ rotate: 5, scale: 1.05 }}
                            >
                              <span className="text-sm font-bold text-white">#{task.id}</span>
                            </motion.div>
                            <div className="flex-1 min-w-0">
                              <h4 className={`text-sm font-semibold ${task.completed ? "line-through text-muted-foreground" : "text-foreground dark:text-white"} truncate`}>
                                {task.title}
                              </h4>
                              {task.description && (
                                <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-0.5 line-clamp-1">
                                  {task.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Badge
                                variant="outline"
                                className={`${priorityStyles[task.priority ?? "medium"].badge} text-xs font-medium border`}
                              >
                                {task.priority}
                              </Badge>
                            </motion.div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(task.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                            </span>
                          </div>
                        </div>

                        {/* Premium Action Buttons */}
                        <motion.div
                          className="flex items-center gap-1 mt-3 pt-3 border-t border-border/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                        >
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10"
                              onClick={() => onToggle(task.id)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-violet-600 hover:bg-violet-500/10"
                              onClick={() => onEdit && onEdit(task)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10"
                              onClick={() => onDelete && onDelete(task.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </motion.div>
                          {onPin && (
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-blue-600 hover:bg-blue-500/10"
                                onClick={() => onPin(task.id)}
                              >
                                <Pin className="w-4 h-4" />
                              </Button>
                            </motion.div>
                          )}
                        </motion.div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
