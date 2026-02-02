// @spec: specs/003-ai-chatbot/spec.md
// Task Sync Context - Real-time dashboard state tracking for AI chatbot
// This context tracks EVERYTHING happening in the dashboard so the chatbot stays aware

"use client"

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react"
import type { Task } from "@/types"

/**
 * Dashboard Operation - Tracks any operation performed on tasks
 */
export interface DashboardOperation {
  id: string
  timestamp: Date
  type: "create" | "update" | "delete" | "toggle" | "filter" | "view_change" | "bulk_action"
  details: {
    taskId?: number
    taskIds?: number[]
    taskTitle?: string
    description?: string
    previousState?: any
    newState?: any
    view?: string
    filter?: string
    count?: number
  }
}

/**
 * Dashboard Snapshot - Complete current state of the dashboard
 */
export interface DashboardSnapshot {
  timestamp: Date
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  highPriorityTasks: number
  currentView: string
  currentFilter: string
  recentOperations: DashboardOperation[]
  tasks: Task[]
}

/**
 * Task Sync State
 */
interface TaskSyncState {
  // Current dashboard snapshot
  snapshot: DashboardSnapshot | null

  // All tracked operations
  operations: DashboardOperation[]

  // Current tasks (mirrored from dashboard)
  tasks: Task[]

  // Current view state
  currentView: string
  currentFilter: string

  // Active operations count
  activeOperations: number
}

/**
 * Task Sync Actions
 */
interface TaskSyncActions {
  // Track operations
  trackOperation: (operation: Omit<DashboardOperation, "id" | "timestamp">) => void

  // Update tasks (called when tasks change)
  updateTasks: (tasks: Task[]) => void

  // Update view state
  updateViewState: (view: string, filter: string) => void

  // Get context for chatbot
  getChatContext: () => string

  // Get recent operations summary
  getRecentOperations: (limit?: number) => DashboardOperation[]

  // Clear old operations
  clearOldOperations: (olderThanMs?: number) => void
}

/**
 * Task Sync Context Value
 */
interface TaskSyncContextValue extends TaskSyncState, TaskSyncActions {}

// Create context
const TaskSyncContext = createContext<TaskSyncContextValue | undefined>(undefined)

/**
 * TaskSyncProvider - Provides real-time dashboard state tracking
 *
 * This context tracks:
 * - All task CRUD operations
 * - View changes
 * - Filter changes
 * - Complete task state
 * - Operations history for chatbot context
 */
export function TaskSyncProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TaskSyncState>({
    snapshot: null,
    operations: [],
    tasks: [],
    currentView: "dashboard",
    currentFilter: "all",
    activeOperations: 0,
  })

  // Create dashboard snapshot from current state
  const createSnapshot = useCallback((): DashboardSnapshot => {
    const tasks = state.tasks
    return {
      timestamp: new Date(),
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.completed).length,
      pendingTasks: tasks.filter(t => !t.completed).length,
      highPriorityTasks: tasks.filter(t => t.priority === "high").length,
      currentView: state.currentView,
      currentFilter: state.currentFilter,
      recentOperations: state.operations.slice(-10),
      tasks,
    }
  }, [state.tasks, state.currentView, state.currentFilter, state.operations])

  // Update snapshot whenever relevant state changes
  useEffect(() => {
    setState(prev => ({ ...prev, snapshot: createSnapshot() }))
  }, [createSnapshot])

  // Track a new operation
  const trackOperation = useCallback((operation: Omit<DashboardOperation, "id" | "timestamp">) => {
    const newOp: DashboardOperation = {
      ...operation,
      id: `op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    }

    setState(prev => ({
      ...prev,
      operations: [...prev.operations, newOp],
      activeOperations: prev.activeOperations + 1,
    }))

    // Auto-decrement active operations after a delay
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        activeOperations: Math.max(0, prev.activeOperations - 1),
      }))
    }, 1000)
  }, [])

  // Update tasks when dashboard tasks change
  const updateTasks = useCallback((tasks: Task[]) => {
    setState(prev => ({ ...prev, tasks }))
  }, [])

  // Update view state
  const updateViewState = useCallback((view: string, filter: string) => {
    setState(prev => ({
      ...prev,
      currentView: view,
      currentFilter: filter,
    }))

    // Track view change as operation
    trackOperation({
      type: "view_change",
      details: { view, filter },
    })
  }, [trackOperation])

  // Get formatted context for chatbot
  const getChatContext = useCallback((): string => {
    const snapshot = state.snapshot
    if (!snapshot) return "No dashboard data available yet."

    const recentOps = state.operations.slice(-5)

    let context = `CURRENT DASHBOARD STATE (as of ${snapshot.timestamp.toLocaleTimeString()}):\n\n`

    // Summary stats
    context += `📊 SUMMARY:\n`
    context += `- Total Tasks: ${snapshot.totalTasks}\n`
    context += `- Completed: ${snapshot.completedTasks}\n`
    context += `- Pending: ${snapshot.pendingTasks}\n`
    context += `- High Priority: ${snapshot.highPriorityTasks}\n`
    context += `- Current View: ${snapshot.currentView}\n`
    context += `- Current Filter: ${snapshot.currentFilter}\n\n`

    // Recent operations
    if (recentOps.length > 0) {
      context += `🔄 RECENT ACTIVITY (last ${recentOps.length} operations):\n`
      recentOps.forEach((op, i) => {
        const time = op.timestamp.toLocaleTimeString()
        const type = op.type.toUpperCase()
        context += `${i + 1}. [${time}] ${type}: `

        switch (op.type) {
          case "create":
            context += `Created task "${op.details.taskTitle}"\n`
            break
          case "update":
            context += `Updated task "${op.details.taskTitle}"\n`
            break
          case "delete":
            context += `Deleted task "${op.details.taskTitle}"\n`
            break
          case "toggle":
            context += `Marked task "${op.details.taskTitle}" as ${op.details.newState?.completed ? "complete" : "incomplete"}\n`
            break
          case "view_change":
            context += `Changed view to ${op.details.view} (filter: ${op.details.filter})\n`
            break
          case "bulk_action":
            context += `Bulk action on ${op.details.count} tasks\n`
            break
          default:
            context += `${JSON.stringify(op.details)}\n`
        }
      })
      context += "\n"
    }

    // Current tasks list (abbreviated for token efficiency)
    if (snapshot.tasks.length > 0) {
      context += `📝 CURRENT TASKS:\n`
      snapshot.tasks.forEach((task, i) => {
        const status = task.completed ? "✅" : "⬜"
        const priority = task.priority === "high" ? "🔴" : task.priority === "medium" ? "🟡" : "🟢"
        const tags = task.tags?.length ? ` [${task.tags.map(t => t.name).join(", ")}]` : ""
        context += `${i + 1}. ${status} ${priority} "${task.title}"${tags}\n`
        if (task.description) {
          context += `   └─ ${task.description.substring(0, 100)}${task.description.length > 100 ? "..." : ""}\n`
        }
      })
    } else {
      context += `📝 CURRENT TASKS: No tasks yet\n`
    }

    return context
  }, [state.snapshot, state.operations])

  // Get recent operations
  const getRecentOperations = useCallback((limit = 10) => {
    return state.operations.slice(-limit)
  }, [state.operations])

  // Clear old operations
  const clearOldOperations = useCallback((olderThanMs = 3600000) => {
    const cutoff = Date.now() - olderThanMs
    setState(prev => ({
      ...prev,
      operations: prev.operations.filter(op => op.timestamp.getTime() > cutoff),
    }))
  }, [])

  const value: TaskSyncContextValue = {
    ...state,
    trackOperation,
    updateTasks,
    updateViewState,
    getChatContext,
    getRecentOperations,
    clearOldOperations,
  }

  return <TaskSyncContext.Provider value={value}>{children}</TaskSyncContext.Provider>
}

/**
 * useTaskSync - Hook to access task sync context
 *
 * Usage:
 * ```tsx
 * const { trackOperation, updateTasks, getChatContext } = useTaskSync()
 *
 * // When user creates a task
 * trackOperation({
 *   type: "create",
 *   details: { taskId: 123, taskTitle: "New Task" }
 * })
 *
 * // Get context for chatbot
 * const context = getChatContext()
 * ```
 */
export function useTaskSync(): TaskSyncContextValue {
  const context = useContext(TaskSyncContext)
  if (context === undefined) {
    throw new Error("useTaskSync must be used within a TaskSyncProvider")
  }
  return context
}
