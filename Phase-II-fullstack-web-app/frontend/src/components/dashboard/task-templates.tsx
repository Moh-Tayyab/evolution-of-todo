// @spec: specs/002-fullstack-web-app/plan.md
// Task Templates - Pre-made templates, recurring tasks, quick actions

"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Clock,
  Calendar,
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

// Pre-defined templates
const templates: TaskTemplate[] = [
  {
    id: "daily-routine",
    name: "Daily Routine",
    icon: Coffee,
    color: "#3b82f6",
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
    color: "#8b5cf6",
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
    color: "#3b82f6",
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
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-500" />
            Task Templates
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Pre-made templates to boost your productivity
          </p>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-6 h-6" />
          <h3 className="text-lg font-semibold">Quick Add Task</h3>
        </div>
        <p className="text-white/90 text-sm mb-4">
          Create a task in a category with one click
        </p>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => onQuickAction?.(action.name)}
                className="group flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all duration-200 hover:scale-105"
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{action.name}</span>
                <Plus className="w-3 h-3 opacity-60 group-hover:opacity-100" />
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
              filter === category
                ? "bg-indigo-500 text-white shadow-md"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            )}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template, index) => {
          const Icon = template.icon;
          return (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group"
            >
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all duration-300 h-full">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="p-3 rounded-xl"
                    style={{ backgroundColor: `${template.color}20` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: template.color }} />
                  </div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    {template.category}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {template.name}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                  {template.description}
                </p>

                {/* Task count */}
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
                  <CheckSquare className="w-4 h-4" />
                  <span>{template.tasks.length} tasks included</span>
                </div>

                {/* Preview tasks */}
                <div className="space-y-2 mb-4">
                  {template.tasks.slice(0, 2).map((task, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          task.priority === "high"
                            ? "bg-red-500"
                            : task.priority === "medium"
                            ? "bg-blue-500"
                            : "bg-emerald-500"
                        )}
                      />
                      <span className="text-slate-600 dark:text-slate-400 truncate">
                        {task.title}
                      </span>
                    </div>
                  ))}
                  {template.tasks.length > 2 && (
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      +{template.tasks.length - 2} more tasks
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleUseTemplate(template)}
                    className="flex-1 gap-2 text-sm"
                    style={{ backgroundColor: template.color }}
                  >
                    <Plus className="w-4 h-4" />
                    Use Template
                  </Button>
                  <button
                    onClick={() => {
                      setSelectedTemplate(template);
                      setShowPreview(true);
                    }}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Eye className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recurring Tasks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Repeat className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Recurring Tasks
            </h3>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Recurring
          </Button>
        </div>

        <div className="space-y-3">
          {recurringTasks.map((task, index) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{task.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    <span className="capitalize">{task.frequency}</span> • {task.nextDue}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onCreateRecurring?.(task)}
                className="p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-indigo-500 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Template Preview Modal */}
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

// Template Preview Modal
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div
          className="p-6 text-white"
          style={{ backgroundColor: template.color }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{template.name}</h3>
                <p className="text-white/80 text-sm">{template.category}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="mt-4 text-white/90">{template.description}</p>
        </div>

        {/* Tasks List */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
            Tasks ({template.tasks.length})
          </h4>
          <div className="space-y-3">
            {template.tasks.map((task, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50"
              >
                <div
                  className={cn(
                    "w-2 h-2 rounded-full mt-2 shrink-0",
                    task.priority === "high"
                      ? "bg-red-500"
                      : task.priority === "medium"
                      ? "bg-blue-500"
                      : "bg-emerald-500"
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 dark:text-white text-sm">
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {task.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs capitalize px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                      {task.priority}
                    </span>
                    {task.tag && (
                      <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                        {task.tag}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800">
          <Button
            onClick={onUse}
            className="w-full gap-2"
            style={{ backgroundColor: template.color }}
          >
            <Plus className="w-4 h-4" />
            Use This Template
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Additional icon components
function Rocket({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.1 2.75-2 2.75-2" />
      <path d="M12 15v5s3.03-.55 4-2c1.1-1.62 2-2.75 2-2.75" />
    </svg>
  );
}

function CheckSquare({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m9 11 3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function Eye({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
