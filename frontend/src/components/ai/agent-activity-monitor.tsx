// @spec: specs/003-ai-chatbot/spec.md
// Agent Activity Monitor - Real-time AI Agent State Visualization
// Now connects to real agent state via chat context

"use client"

import { motion, AnimatePresence } from "framer-motion"
import {
  Activity,
  Brain,
  MessageSquare,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"
import React, { useState, useEffect } from "react"
import { useChatContext, type AgentState, type ToolExecution } from "@/components/chat/chat-context"

/**
 * AgentActivityMonitor - Real-time visualization of AI agent activity
 *
 * Features:
 * - Live agent state display (from chat context)
 * - Tool execution timeline (from chat context)
 * - Professional animations
 * - Performance metrics
 *
 * Now connects to real agent state through chat context instead of simulation
 */
export function AgentActivityMonitor({ className }: { className?: string }) {
  const { agentState, toolExecutions, activeTool } = useChatContext()

  // Calculate metrics
  const totalExecutions = toolExecutions.length
  const successRate = toolExecutions.length > 0
    ? (toolExecutions.filter(e => e.status === "success").length / toolExecutions.length * 100).toFixed(0)
    : "100"
  const avgDuration = toolExecutions.length > 0
    ? (toolExecutions.reduce((sum, e) => sum + (e.duration || 0), 0) / toolExecutions.length).toFixed(0)
    : "0"

  return (
    <div className={cn("space-y-4", className)}>
      {/* Agent State Display */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-primary/0 to-background border border-primary/20"
      >
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0"
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <motion.div
                className="relative"
                animate={{ rotate: agentState === "thinking" ? 360 : 0 }}
                transition={{ duration: 2, repeat: agentState === "thinking" ? Infinity : 0, ease: "linear" }}
              >
                <Brain className="w-8 h-8 text-primary" />
                {agentState !== "idle" && (
                  <motion.div
                    className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                )}
              </motion.div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">AI Agent</h3>
                <StateBadge state={agentState} />
              </div>
            </div>

            {/* Current tool indicator */}
            <AnimatePresence mode="wait">
              {activeTool && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20"
                >
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">{activeTool}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-4">
            <MetricCard
              icon={Activity}
              label="Operations"
              value={totalExecutions.toString()}
              color="text-blue-500"
            />
            <MetricCard
              icon={CheckCircle2}
              label="Success Rate"
              value={`${successRate}%`}
              color="text-emerald-500"
            />
            <MetricCard
              icon={Clock}
              label="Avg Time"
              value={`${avgDuration}ms`}
              color="text-purple-500"
            />
          </div>
        </div>
      </motion.div>

      {/* Tool Execution Timeline */}
      {toolExecutions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50 p-4"
        >
          <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Recent Activity
          </h4>
          <div className="space-y-2">
            {toolExecutions.slice(-5).reverse().map((execution) => (
              <ExecutionRow key={execution.id} execution={execution} />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

/**
 * StateBadge - Visual indicator of agent state
 */
function StateBadge({ state }: { state: AgentState }) {
  const config = {
    idle: { label: "Ready", color: "bg-muted-foreground/50", icon: null },
    thinking: { label: "Thinking...", color: "bg-primary", icon: Loader2 },
    executing: { label: "Executing", color: "bg-primary", icon: Zap },
    responding: { label: "Responding", color: "bg-emerald-500", icon: MessageSquare },
    error: { label: "Error", color: "bg-red-500", icon: AlertCircle },
  }

  const { label, color, icon: Icon } = config[state]

  return (
    <motion.div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/50 w-fit"
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      key={state}
    >
      <div className={cn("w-2 h-2 rounded-full", color)} />
      {Icon && (
        <Icon className="w-3 h-3 text-muted-foreground animate-pulse" />
      )}
      <span className="text-xs text-muted-foreground">{label}</span>
    </motion.div>
  )
}

/**
 * MetricCard - Display a single metric
 */
function MetricCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Activity
  label: string
  value: string
  color: string
}) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center p-3 rounded-xl bg-background/50 border border-border/50"
      whileHover={{ scale: 1.02 }}
    >
      <Icon className={cn("w-5 h-5 mb-1", color)} />
      <span className="text-lg font-bold text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </motion.div>
  )
}

/**
 * ExecutionRow - Display a single tool execution
 */
function ExecutionRow({ execution }: { execution: ToolExecution }) {
  const statusConfig = {
    running: { icon: Loader2, color: "text-primary", bg: "bg-primary/10" },
    success: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    error: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
  }

  const { icon: Icon, color, bg } = statusConfig[execution.status]

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-3 rounded-xl bg-background border border-border/50"
    >
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg", bg)}>
          <Icon className={cn("w-4 h-4", color)} />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{execution.tool}</p>
          <p className="text-xs text-muted-foreground">
            {execution.timestamp.toLocaleTimeString()}
          </p>
        </div>
      </div>
      {execution.duration && (
        <span className="text-xs text-muted-foreground">{execution.duration}ms</span>
      )}
    </motion.div>
  )
}
