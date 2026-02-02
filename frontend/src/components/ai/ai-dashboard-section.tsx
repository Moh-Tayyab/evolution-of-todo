// @spec: specs/003-ai-chatbot/spec.md
// AI Dashboard Section - Professional AI Command Center
// Quick Actions now integrate with real chat via chat context

"use client"

import { motion } from "framer-motion"
import { Sparkles, TrendingUp, Zap, Shield } from "lucide-react"
import { cn } from "@/lib/utils"
import { AISkillsPanel } from "./ai-skills-panel"
import { AgentActivityMonitor } from "./agent-activity-monitor"
import { useChatContext } from "@/components/chat/chat-context"
import React from "react"

/**
 * AIDashboardSection - Professional AI command center
 *
 * Integrates:
 * - AI Skills Panel (MCP tools visualization)
 * - Agent Activity Monitor (real-time state)
 * - Quick Actions (opens chat with prompts)
 * - Performance metrics
 * - Professional animations
 */
export function AIDashboardSection({ className }: { className?: string }) {
  const { openChat } = useChatContext()

  return (
    <div className={cn("space-y-6", className)}>
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 p-8 text-primary-foreground"
      >
        {/* Animated background patterns */}
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative">
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 mb-4"
            whileHover={{ scale: 1.02 }}
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Phase III: AI-Powered</span>
          </motion.div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            AI Command Center
          </h1>
          <p className="text-lg text-white/80 max-w-2xl">
            Your AI Task Assistant helps you manage tasks with natural language commands.
            Add, view, update, complete, and delete tasks effortlessly.
          </p>

          {/* Feature badges */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <FeatureBadge icon={Zap} label="Fast & Smart" />
            <FeatureBadge icon={Shield} label="Secure Tools" />
            <FeatureBadge icon={TrendingUp} label="Real-time" />
          </div>
        </div>
      </motion.div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - AI Skills */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <AISkillsPanel />
        </motion.div>

        {/* Right Column - Agent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AgentActivityMonitor />
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-6 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/20 border border-border/50"
      >
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <QuickAction
            icon="➕"
            label="Add Task"
            prompt="Add a new task: "
            onClick={() => openChat("Add a new task: ")}
          />
          <QuickAction
            icon="📋"
            label="List Tasks"
            prompt="Show me all my tasks"
            onClick={() => openChat("Show me all my tasks")}
          />
          <QuickAction
            icon="✅"
            label="Complete Task"
            prompt="Mark task as complete: "
            onClick={() => openChat("Mark task as complete: ")}
          />
          <QuickAction
            icon="🗑️"
            label="Delete Task"
            prompt="Delete task: "
            onClick={() => openChat("Delete task: ")}
          />
        </div>
      </motion.div>
    </div>
  )
}

/**
 * FeatureBadge - Small badge showing a feature
 */
function FeatureBadge({
  icon: Icon,
  label,
}: {
  icon: typeof Zap
  label: string
}) {
  return (
    <motion.div
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20"
      whileHover={{ scale: 1.05 }}
    >
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{label}</span>
    </motion.div>
  )
}

/**
 * QuickAction - Quick action button for common AI tasks
 * Now integrates with real chat via onClick callback
 */
function QuickAction({
  icon,
  label,
  prompt,
  onClick,
}: {
  icon: string
  label: string
  prompt: string
  onClick: () => void
}) {
  return (
    <motion.button
      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-background border border-border/50 hover:border-primary/50 transition-colors text-left"
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <span className="text-2xl">{icon}</span>
      <span className="font-medium text-foreground">{label}</span>
    </motion.button>
  )
}
