// @spec: specs/003-ai-chatbot/spec.md
// AI Skills Panel - Professional MCP Tools Visualization

"use client"

import { motion } from "framer-motion"
import {
  Plus,
  List,
  Edit,
  Trash2,
  CheckCircle,
  Sparkles,
  Zap,
  Brain,
  Activity
} from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * AI Skill - Represents an MCP tool capability
 */
interface AISkill {
  id: string
  name: string
  description: string
  icon: typeof Plus
  color: string
  status: "idle" | "active" | "success" | "error"
  lastUsed?: Date
  executionCount?: number
}

/**
 * AISkillsPanel - Professional visualization of AI agent capabilities
 *
 * Displays MCP tools as professional skill cards with:
 * - Real-time status indicators
 * - Execution animations
 * - Glass morphism design
 * - Professional gradients
 */
export function AISkillsPanel({ className }: { className?: string }) {
  // AI Skills representing MCP tools
  const [skills, setSkills] = React.useState<AISkill[]>([
    {
      id: "add_task",
      name: "Add Task",
      description: "Create new tasks with titles, descriptions, and priorities",
      icon: Plus,
      color: "from-blue-500 to-cyan-500",
      status: "idle",
      executionCount: 0,
    },
    {
      id: "list_tasks",
      name: "List Tasks",
      description: "View all tasks with filtering by completion status",
      icon: List,
      color: "from-purple-500 to-pink-500",
      status: "idle",
      executionCount: 0,
    },
    {
      id: "update_task",
      name: "Update Task",
      description: "Modify task titles, descriptions, and priorities",
      icon: Edit,
      color: "from-amber-500 to-orange-500",
      status: "idle",
      executionCount: 0,
    },
    {
      id: "delete_task",
      name: "Delete Task",
      description: "Remove tasks permanently from your list",
      icon: Trash2,
      color: "from-red-500 to-rose-500",
      status: "idle",
      executionCount: 0,
    },
    {
      id: "complete_task",
      name: "Complete Task",
      description: "Mark tasks as complete or incomplete",
      icon: CheckCircle,
      color: "from-emerald-500 to-green-500",
      status: "idle",
      executionCount: 0,
    },
  ])

  // Total executions
  const totalExecutions = skills.reduce((sum, skill) => sum + (skill.executionCount || 0), 0)

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <div className="relative">
              <Brain className="w-7 h-7 text-primary" />
              <motion.div
                className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
            AI Capabilities
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Professional AI agent powered by OpenAI & MCP
          </p>
        </div>
        <motion.div
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20"
          whileHover={{ scale: 1.02 }}
        >
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            {totalExecutions} ops
          </span>
        </motion.div>
      </motion.div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((skill, index) => (
          <SkillCard
            key={skill.id}
            skill={skill}
            index={index}
            onStatusChange={(status) => {
              setSkills(prev =>
                prev.map(s =>
                  s.id === skill.id
                    ? { ...s, status, executionCount: (s.executionCount || 0) + (status === "success" ? 1 : 0) }
                    : s
                )
              )
            }}
          />
        ))}
      </div>

      {/* Info Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center gap-2 px-4 py-3 rounded-xl bg-muted/30 border border-border/50"
      >
        <Sparkles className="w-4 h-4 text-primary" />
        <p className="text-xs text-muted-foreground">
          AI uses these tools to help manage your tasks efficiently
        </p>
      </motion.div>
    </div>
  )
}

/**
 * SkillCard - Individual skill card with status and animations
 */
function SkillCard({
  skill,
  index,
  onStatusChange,
}: {
  skill: AISkill
  index: number
  onStatusChange: (status: AISkill["status"]) => void
}) {
  const Icon = skill.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="group relative"
    >
      {/* Glass morphism background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 dark:from-white/5 dark:to-white/0 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10" />

      {/* Gradient accent */}
      <motion.div
        className={cn(
          "absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r",
          skill.color
        )}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: skill.status === "active" ? 1 : 0.5 }}
        transition={{ duration: 0.3 }}
      />

      <div className="relative p-5 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Icon container with gradient */}
            <motion.div
              className={cn(
                "relative w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center",
                skill.color,
                skill.status === "active" && "animate-pulse"
              )}
              whileHover={{ rotate: 5, scale: 1.1 }}
            >
              <Icon className="w-6 h-6 text-white" />
              {skill.status === "active" && (
                <motion.div
                  className="absolute inset-0 bg-white/30 rounded-xl"
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </motion.div>

            <div>
              <h3 className="font-semibold text-foreground">{skill.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {skill.executionCount || 0} uses
              </p>
            </div>
          </div>

          {/* Status indicator */}
          <StatusIndicator status={skill.status} />
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {skill.description}
        </p>

        {/* Tech badge */}
        <motion.div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/5 border border-primary/10 w-fit"
          whileHover={{ backgroundColor: "rgba(var(--primary), 0.1)" }}
        >
          <Zap className="w-3 h-3 text-primary" />
          <span className="text-xs font-medium text-primary">MCP Tool</span>
        </motion.div>
      </div>

      {/* Success glow effect */}
      {skill.status === "success" && (
        <motion.div
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.6 }}
        />
      )}
    </motion.div>
  )
}

/**
 * StatusIndicator - Visual status indicator for skill execution
 */
function StatusIndicator({ status }: { status: AISkill["status"] }) {
  const variants = {
    idle: { scale: 1, opacity: 0.5 },
    active: { scale: [1, 1.2, 1], opacity: 1 },
    success: { scale: 1, opacity: 1 },
    error: { scale: [1, 1.1, 1], opacity: 1 },
  }

  const colors = {
    idle: "bg-muted-foreground/30 dark:bg-muted-foreground/20",
    active: "bg-primary",
    success: "bg-emerald-500",
    error: "bg-red-500",
  }

  return (
    <motion.div
      className="relative"
      animate={variants[status]}
      transition={{ duration: status === "active" ? 0.5 : 0.2 }}
    >
      <div className={cn("w-2.5 h-2.5 rounded-full", colors[status])} />
      {status === "active" && (
        <motion.div
          className={cn("absolute inset-0 rounded-full", colors[status])}
          animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </motion.div>
  )
}

// Import React
import React from "react"
