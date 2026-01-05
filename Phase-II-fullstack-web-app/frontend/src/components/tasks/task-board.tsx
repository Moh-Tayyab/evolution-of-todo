"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Plus, MoreHorizontal, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TaskCard, type Task } from "./task-card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * @spec: Task Board Component (Kanban View)
 * @description: Kanban-style board with drag-and-drop
 * @feature: FR-003 - View all tasks
 * @feature: FR-005 - Mark tasks as complete
 */

export interface TaskBoardProps {
  tasks: Task[];
  onToggle?: (taskId: string) => Promise<void>;
  onDelete?: (taskId: string) => Promise<void>;
  onPin?: (taskId: string) => Promise<void>;
  onArchive?: (taskId: string) => Promise<void>;
  onEdit?: (task: Task) => void;
  onMoveTask?: (taskId: string, newStatus: "todo" | "in_progress" | "done") => Promise<void>;
  onNewTask?: (status: "todo" | "in_progress" | "done") => void;
  className?: string;
}

type ColumnStatus = "todo" | "in_progress" | "done";

interface Column {
  id: ColumnStatus;
  title: string;
  color: string;
}

const columns: Column[] = [
  { id: "todo", title: "To Do", color: "border-l-gray-400" },
  { id: "in_progress", title: "In Progress", color: "border-l-blue-500" },
  { id: "done", title: "Done", color: "border-l-green-500" },
];

/**
 * TaskBoard - Kanban-style task board with drag-and-drop
 *
 * Embedded Intelligence:
 * - Drag and drop task management
 * - Local state for UI interactions
 * - Optimistic updates
 * - Task counts per column
 * - Framer Motion animations
 */
export function TaskBoard({
  tasks,
  onToggle,
  onDelete,
  onPin,
  onArchive,
  onEdit,
  onMoveTask,
  onNewTask,
  className,
}: TaskBoardProps) {
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);

  // Organize tasks by column
  const tasksByColumn = useMemo(() => {
    const organized: Record<ColumnStatus, Task[]> = {
      todo: [],
      in_progress: [],
      done: [],
    };

    tasks.forEach((task) => {
      const status: ColumnStatus = task.completed ? "done" : "todo";
      organized[status].push(task);
    });

    return organized;
  }, [tasks]);

  // Handle drag end
  const handleDragEnd = useCallback(async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    setDraggingTaskId(null);

    // No destination or dropped in same position
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    // Get source and destination columns
    const sourceColumn = source.droppableId as ColumnStatus;
    const destinationColumn = destination.droppableId as ColumnStatus;

    // If moved to different column, update task status
    if (sourceColumn !== destinationColumn) {
      await onMoveTask?.(draggableId, destinationColumn);
    }
  }, [onMoveTask]);

  const handleDragStart = useCallback((result: any) => {
    setDraggingTaskId(result.draggableId);
  }, []);

  // Get task count for column
  const getColumnCount = (columnId: ColumnStatus) => {
    return tasksByColumn[columnId].length;
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
      <div className={cn("h-full", className)}>
        {/* Board Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">Task Board</h2>
            <div className="flex gap-2">
              {columns.map((column) => (
                <Badge
                  key={column.id}
                  variant="outline"
                  className="text-sm"
                >
                  {column.title}: {getColumnCount(column.id)}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Board Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {columns.map((column) => (
            <motion.div
              key={column.id}
              layout
              className="bg-gray-50 rounded-xl p-4 border-2 border-t-0 border-l-4 border-r-0 border-b-0 min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-3 h-3 rounded-full",
                      column.id === "todo" && "bg-gray-400",
                      column.id === "in_progress" && "bg-blue-500",
                      column.id === "done" && "bg-green-500"
                    )}
                  />
                  <h3 className="font-semibold text-gray-700">{column.title}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {getColumnCount(column.id)}
                  </Badge>
                </div>

                <div className="flex items-center gap-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onNewTask?.(column.id)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add task
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Tasks List */}
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "space-y-3 min-h-[400px] transition-colors",
                      snapshot.isDraggingOver && "bg-gray-100/50 rounded-lg"
                    )}
                  >
                    <AnimatePresence mode="popLayout">
                      {tasksByColumn[column.id].map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                          isDragDisabled={draggingTaskId === task.id}
                        >
                          {(provided, snapshot) => (
                            <motion.div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              layout
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.2 }}
                              className={cn(
                                "relative",
                                snapshot.isDragging && "z-50"
                              )}
                            >
                              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-2">
                                  {/* Drag Handle */}
                                  <div
                                    {...provided.dragHandleProps}
                                    className="cursor-grab active:cursor-grabbing pt-1"
                                  >
                                    <GripVertical className="w-4 h-4 text-gray-400" />
                                  </div>

                                  {/* Task Content */}
                                  <div className="flex-1 min-w-0">
                                    <p
                                      className={cn(
                                        "text-sm font-medium",
                                        task.completed && "line-through text-gray-400"
                                      )}
                                    >
                                      {task.title}
                                    </p>
                                    {task.description && (
                                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                        {task.description}
                                      </p>
                                    )}

                                    {/* Tags and Priority */}
                                    <div className="flex items-center gap-2 mt-2">
                                      <Badge
                                        variant="outline"
                                        className={cn(
                                          "text-xs",
                                          task.priority === "high" && "border-red-300 text-red-700",
                                          task.priority === "medium" && "border-yellow-300 text-yellow-700",
                                          task.priority === "low" && "border-gray-300 text-gray-700"
                                        )}
                                      >
                                        {task.priority}
                                      </Badge>
                                      {task.tags && task.tags.length > 0 && (
                                        <div className="flex gap-1">
                                          {task.tags.slice(0, 2).map((tag) => (
                                            <Badge
                                              key={tag.id}
                                              variant="secondary"
                                              className="text-xs"
                                              style={{
                                                backgroundColor: tag.color || "#D6675D",
                                                color: "white",
                                              }}
                                            >
                                              {tag.name}
                                            </Badge>
                                          ))}
                                          {task.tags.length > 2 && (
                                            <Badge variant="secondary" className="text-xs">
                                              +{task.tags.length - 2}
                                            </Badge>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </Draggable>
                      ))}
                    </AnimatePresence>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              {/* Empty State */}
              {tasksByColumn[column.id].length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed border-gray-300 rounded-lg"
                >
                  <p className="text-sm text-gray-500 mb-2">No tasks yet</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onNewTask?.(column.id)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add task
                  </Button>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </DragDropContext>
  );
}
