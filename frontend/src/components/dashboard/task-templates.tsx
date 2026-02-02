// @spec: specs/002-fullstack-web-app/spec.md
// @spec: specs/002-fullstack-web-app/plan.md
// Task Templates - Premium glass morphism design with real functionality

"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Sparkles,
  Clock,
  Calendar,
  Repeat,
  Plus,
  Zap,
  ArrowRight,
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
  CheckSquare,
  Eye,
  X,
  Rocket,
  Target,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface TaskTemplate {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  tasks: TemplateTask[];
  category: string;
  description: string;
}

export interface TemplateTask {
  title: string;
  description?: string;
  priority: "high" | "medium" | "low";
  tag?: string;
}

export interface RecurringTask {
  id: string;
  title: string;
  frequency: "daily" | "weekly" | "monthly";
  nextDue: string;
  icon?: React.ElementType;
}

// Pre-defined templates with real functionality
const templates: TaskTemplate[] = [
  {
    id: "daily-routine",
    name: "Daily Routine",
    icon: Coffee,
    color: "#8b5cf6",
    category: "Personal",
    description: "Start your day with these productive habits",
    tasks: [
      { title: "Morning meditation", priority: "medium", tag: "Wellness" },
      { title: "Review today's priorities", priority: "high", tag: "Planning" },
      { title: "Check emails and messages", priority: "medium", tag: "Communication" },
      { title: "Schedule deep work blocks", priority: "high", tag: "Productivity" },
    ],
  },
  {
    id: "weekly-planning",
    name: "Weekly Planning",
    icon: Calendar,
    color: "#3b82f6",
    category: "Planning",
    description: "Plan your week ahead every Sunday",
    tasks: [
      { title: "Review last week's accomplishments", priority: "medium", tag: "Review" },
      { title: "Set top 3 goals for this week", priority: "high", tag: "Goals" },
      { title: "Schedule important meetings", priority: "high", tag: "Calendar" },
      { title: "Block time for focused work", priority: "high", tag: "Productivity" },
      { title: "Plan personal time and breaks", priority: "medium", tag: "Wellness" },
    ],
  },
  {
    id: "project-launch",
    name: "Project Launch",
    icon: Rocket,
    color: "#ef4444",
    category: "Work",
    description: "Essential tasks for launching a new project",
    tasks: [
      { title: "Final QA testing", priority: "high", tag: "Development" },
      { title: "Prepare release notes", priority: "medium", tag: "Documentation" },
      { title: "Create marketing materials", priority: "high", tag: "Marketing" },
      { title: "Schedule announcement", priority: "high", tag: "Communication" },
      { title: "Monitor launch metrics", priority: "medium", tag: "Analytics" },
    ],
  },
  {
    id: "fitness-plan",
    name: "Fitness Plan",
    icon: Dumbbell,
    color: "#22c55e",
    category: "Health",
    description: "Weekly fitness and wellness routine",
    tasks: [
      { title: "3x Cardio sessions (30min)", priority: "high", tag: "Exercise" },
      { title: "2x Strength training", priority: "high", tag: "Exercise" },
      { title: "Meal prep for the week", priority: "medium", tag: "Nutrition" },
      { title: "Stretching routine (daily)", priority: "low", tag: "Wellness" },
    ],
  },
  {
    id: "learning-sprint",
    name: "Learning Sprint",
    icon: BookOpen,
    color: "#06b6d4",
    category: "Learning",
    description: "Accelerated learning for new skills",
    tasks: [
      { title: "Complete 2 online lessons", priority: "high", tag: "Study" },
      { title: "Practice exercises", priority: "high", tag: "Practice" },
      { title: "Review notes and flashcards", priority: "medium", tag: "Review" },
      { title: "Apply skills to mini-project", priority: "medium", tag: "Practice" },
    ],
  },
  {
    id: "shopping-list",
    name: "Shopping List",
    icon: ShoppingBag,
    color: "#ec4899",
    category: "Personal",
    description: "Weekly groceries and essentials",
    tasks: [
      { title: "Fruits and vegetables", priority: "medium", tag: "Groceries" },
      { title: "Proteins (meat/fish/tofu)", priority: "high", tag: "Groceries" },
      { title: "Dairy and alternatives", priority: "medium", tag: "Groceries" },
      { title: "Household essentials", priority: "low", tag: "Home" },
    ],
  },
];

// Recurring tasks
const recurringTasks: RecurringTask[] = [
  { id: "1", title: "Pay bills", frequency: "monthly", nextDue: "In 3 days" },
  { id: "2", title: "Team standup", frequency: "daily", nextDue: "Today 9:00 AM" },
  { id: "3", title: "Backup important files", frequency: "weekly", nextDue: "Sunday" },
  { id: "4", title: "Water plants", frequency: "weekly", nextDue: "Saturday" },
];

// Quick action categories
const quickActions = [
  { id: "1", name: "Work", icon: Briefcase, color: "#d6675d" },
  { id: "2", name: "Personal", icon: Heart, color: "#6B9BD1" },
  { id: "3", name: "Learning", icon: BookOpen, color: "#a855f7" },
  { id: "4", name: "Health", icon: Dumbbell, color: "#22c55e" },
  { id: "5", name: "Shopping", icon: ShoppingBag, color: "#ec4899" },
  { id: "6", name: "Code", icon: Code, color: "#3b82f6" },
  { id: "7", name: "Music", icon: Music, color: "#8b5cf6" },
  { id: "8", name: "Travel", icon: Plane, color: "#06b6d4" },
];

interface TaskTemplatesProps {
  onUseTemplate?: (template: TaskTemplate) => void;
  onQuickAction?: (category: string) => void;
  onCreateRecurring?: (task: RecurringTask) => void;
  className?: string;
}

export function TaskTemplates({
  onUseTemplate,
  onQuickAction,
  onCreateRecurring,
  className,
}: TaskTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = React.useState<TaskTemplate | null>(null);
  const [showPreview, setShowPreview] = React.useState(false);
  const [filter, setFilter] = React.useState<string>("all");

  const filteredTemplates = React.useMemo(() => {
    if (filter === "all") return templates;
    return templates.filter((t) => t.category.toLowerCase() === filter.toLowerCase());
  }, [filter]);

  const categories = React.useMemo(() => {
    const cats = new Set(templates.map((t) => t.category));
    return ["all", ...Array.from(cats)];
  }, []);

  const handleUseTemplate = (template: TaskTemplate) => {
    onUseTemplate?.(template);
    setSelectedTemplate(null);
    setShowPreview(false);
  };

  return (
    <div className={cn("space-y-8", className)}>
      {/* Header with premium gradient text */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <motion.h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-300% animate-gradient flex items-center gap-3"
            style={{ backgroundSize: "200% auto" }}
            animate={
              !useReducedMotion()
                ? {
                    backgroundPosition: ["0% center", "200% center", "0% center"],
                  }
                : {}
            }
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-7 h-7" />
            Task Templates
          </motion.h2>
          <p className="text-sm text-muted-foreground dark:text-muted-foreground">
            Pre-made templates to boost your productivity
          </p>
        </div>
      </motion.div>

      {/* Quick Actions - Premium glass morphism */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-3xl shadow-premium-xl"
      >
        {/* Animated gradient background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600"
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          style={{ backgroundSize: "200% 100%" }}
        />

        {/* Glass overlay */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />

        {/* Content */}
        <div className="relative z-10 p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Quick Add Task</h3>
              <p className="text-white/90 text-sm">Create a task in a category with one click</p>
            </div>
          </div>

          {/* Quick action buttons */}
          <div className="flex flex-wrap gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.id}
                  onClick={() => onQuickAction?.(action.name)}
                  className="group flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all duration-200 hover:scale-105 border border-white/30"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-4 h-4 text-white" />
                  <span className="text-sm font-medium text-white">{action.name}</span>
                  <Plus className="w-3 h-3 text-white/60 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Category Filter - Premium glass buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-3 overflow-x-auto pb-2"
      >
        {categories.map((category, index) => (
          <motion.button
            key={category}
            onClick={() => setFilter(category)}
            className={cn(
              "px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 border",
              filter === category
                ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white border-transparent shadow-premium-md"
                : "bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl text-foreground dark:text-muted-foreground border-white/30 dark:border-white/10 hover:bg-white/80 dark:hover:bg-slate-800 hover:scale-105"
            )}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </motion.button>
        ))}
      </motion.div>

      {/* Templates Grid - Premium glass cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template, index) => {
          const Icon = template.icon;
          return (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <div className="relative h-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/30 dark:border-white/10 shadow-premium-lg hover:shadow-premium-xl transition-all duration-300 overflow-hidden">
                {/* Animated gradient border on hover */}
                <motion.div
                  className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${template.color}40, ${template.color}10)`,
                  }}
                />

                <div className="relative z-10 p-6 h-full flex flex-col">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <motion.div
                      className="p-3 rounded-2xl shadow-premium-sm border border-white/20"
                      style={{
                        backgroundColor: `${template.color}20`,
                        borderColor: `${template.color}40`
                      }}
                      whileHover={{ scale: 1.05, rotate: 2 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Icon className="w-6 h-6" style={{ color: template.color }} />
                    </motion.div>
                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm text-foreground dark:text-muted-foreground border border-white/20 dark:border-white/10">
                      {template.category}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-bold text-foreground dark:text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-violet-600 group-hover:to-fuchsia-600 group-hover:bg-300% group-hover:animate-gradient transition-all"
                    style={{ backgroundSize: "200% auto" }}
                  >
                    {template.name}
                  </h3>
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-4 line-clamp-2 min-h-[40px]">
                    {template.description}
                  </p>

                  {/* Task count */}
                  <div className="flex items-center gap-2 text-sm text-foreground dark:text-muted-foreground mb-4">
                    <CheckSquare className="w-4 h-4" />
                    <span>{template.tasks.length} tasks included</span>
                  </div>

                  {/* Preview tasks with premium badges */}
                  <div className="space-y-2.5 mb-4 flex-1">
                    {template.tasks.slice(0, 2).map((task, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-2.5 text-sm p-2 rounded-xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border border-white/20 dark:border-white/5 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-colors"
                      >
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full shrink-0",
                            task.priority === "high"
                              ? "bg-red-500 shadow-premium-sm"
                              : task.priority === "medium"
                              ? "bg-blue-500 shadow-premium-sm"
                              : "bg-emerald-500 shadow-premium-sm"
                          )}
                        />
                        <span className="text-foreground dark:text-muted-foreground truncate flex-1">
                          {task.title}
                        </span>
                      </motion.div>
                    ))}
                    {template.tasks.length > 2 && (
                      <p className="text-xs text-muted-foreground dark:text-muted-foreground pl-4.5">
                        +{template.tasks.length - 2} more tasks
                      </p>
                    )}
                  </div>

                  {/* Premium action buttons */}
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => handleUseTemplate(template)}
                      className="flex-1 gap-2 text-sm shadow-premium-sm"
                      style={{
                        backgroundColor: template.color,
                        color: "white",
                        border: "none"
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      Use Template
                    </Button>
                    <motion.button
                      onClick={() => {
                        setSelectedTemplate(template);
                        setShowPreview(true);
                      }}
                      className="p-2.5 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/20 dark:border-white/10 hover:bg-white/80 dark:hover:bg-slate-800 transition-all hover:scale-105"
                      whileHover={{ rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Eye className="w-4 h-4 text-foreground dark:text-muted-foreground" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recurring Tasks - Premium glass panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/30 dark:border-white/10 shadow-premium-lg overflow-hidden"
      >
        {/* Decorative gradient line */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8 }}
        />

        <div className="relative z-10 p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-premium-md">
                <Repeat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground dark:text-white">Recurring Tasks</h3>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                  Automate your repeating tasks
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-violet-300 dark:border-violet-700 hover:bg-violet-50 dark:hover:bg-violet-950/20"
              onClick={() => {/* TODO: Open create recurring dialog */}}
            >
              <Plus className="w-4 h-4" />
              Add Recurring
            </Button>
          </div>

          {/* Recurring tasks list */}
          <div className="space-y-3">
            {recurringTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="flex items-center justify-between p-4 rounded-xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border border-white/20 dark:border-white/5 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:scale-[1.02] transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-600/20 group-hover:from-violet-500/30 group-hover:to-purple-600/30 transition-all">
                    <Clock className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground dark:text-white">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs capitalize px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300">
                        {task.frequency}
                      </span>
                      <span className="text-xs text-muted-foreground dark:text-muted-foreground">
                        • {task.nextDue}
                      </span>
                    </div>
                  </div>
                </div>
                <motion.button
                  onClick={() => onCreateRecurring?.(task)}
                  className="p-2 rounded-lg bg-violet-50 dark:bg-violet-950/20 text-violet-500 hover:bg-violet-100 dark:hover:bg-violet-950/40 transition-colors hover:scale-110"
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-4 h-4" />
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Template Preview Modal - Premium glass design */}
      <AnimatePresence>
        {showPreview && selectedTemplate && (
          <TemplatePreviewModal
            template={selectedTemplate}
            onClose={() => {
              setShowPreview(false);
              setSelectedTemplate(null);
            }}
            onUse={() => handleUseTemplate(selectedTemplate)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Template Preview Modal with premium glass morphism
interface TemplatePreviewModalProps {
  template: TaskTemplate;
  onClose: () => void;
  onUse: () => void;
}

function TemplatePreviewModal({ template, onClose, onUse }: TemplatePreviewModalProps) {
  const Icon = template.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop with premium blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-lg"
      >
        {/* Premium glass card with gradient border */}
        <div className="absolute inset-0 -inset-[1px] rounded-3xl bg-gradient-to-br from-white/80 via-white/60 to-white/40 dark:from-slate-800/80 dark:via-slate-900/60 dark:to-slate-950/40 backdrop-blur-2xl rounded-3xl shadow-premium-2xl border border-white/30 dark:border-white/10" />

        {/* Animated gradient border */}
        <motion.div
          className="absolute inset-0 rounded-3xl opacity-50"
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          style={{
            background: `linear-gradient(90deg, ${template.color}40, transparent, ${template.color}40, transparent)`,
            backgroundSize: "200% 100%",
          }}
        />

        <div className="relative z-10 overflow-hidden rounded-3xl">
          {/* Header with gradient */}
          <div
            className="p-8 text-white"
            style={{
              background: `linear-gradient(135deg, ${template.color}, ${template.color}dd)`,
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <motion.div
                  className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30"
                  whileHover={{ scale: 1.05, rotate: 3 }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon className="w-8 h-8" />
                </motion.div>
                <div>
                  <h3 className="text-2xl font-bold">{template.name}</h3>
                  <p className="text-white/80 text-sm">{template.category}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/20 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="mt-4 text-white/90 leading-relaxed">{template.description}</p>
          </div>

          {/* Tasks List with premium cards */}
          <div className="p-8 max-h-[50vh] overflow-y-auto bg-white/40 dark:bg-slate-900/40">
            <h4 className="text-lg font-bold text-foreground dark:text-white mb-6 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-violet-500" />
              Tasks ({template.tasks.length})
            </h4>
            <div className="space-y-3">
              {template.tasks.map((task, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.06 }}
                  className="p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/20 dark:border-white/5 hover:bg-white/80 dark:hover:bg-slate-800 hover:scale-[1.01] transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "w-2.5 h-2.5 rounded-full mt-1 shrink-0 shadow-sm",
                        task.priority === "high"
                          ? "bg-gradient-to-br from-red-500 to-rose-500"
                          : task.priority === "medium"
                          ? "bg-gradient-to-br from-blue-500 to-cyan-500"
                          : "bg-gradient-to-br from-emerald-500 to-green-500"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground dark:text-white">{task.title}</p>
                      {task.description && (
                        <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">{task.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs capitalize px-2 py-0.5 rounded-md bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 text-foreground dark:text-muted-foreground font-medium">
                          {task.priority}
                        </span>
                        {task.tag && (
                          <span className="text-xs px-2 py-0.5 rounded-md bg-gradient-to-r from-violet-100 to-violet-200 dark:from-violet-950 dark:to-violet-900 text-violet-700 dark:text-violet-300 font-medium">
                            {task.tag}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Footer with gradient button */}
          <div className="p-8 border-t border-white/20 dark:border-white/10 bg-white/40 dark:bg-slate-900/40">
            <Button
              onClick={onUse}
              className="w-full gap-2 text-white shadow-premium-md text-base py-3 hover:shadow-premium-lg transition-all"
              style={{
                background: `linear-gradient(135deg, ${template.color}, ${template.color}dd)`,
              }}
            >
              <Plus className="w-5 h-5" />
              Use This Template
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
