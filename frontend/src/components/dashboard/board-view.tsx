// @spec: specs/002-fullstack-web-app/spec.md
// @spec: Board View - Kanban-style board layout

"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion, Reorder } from "framer-motion";
import { type Task } from "@/components/tasks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Check,
	X,
	Edit2,
	Pin,
	MoreVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BoardViewProps {
	tasks: Task[];
	onToggle: (id: number) => void;
	onEdit?: (task: Task) => void;
	onDelete?: (id: number) => void;
	onPin?: (id: number) => void;
}

type Column = "todo" | "in-progress" | "done";

const columns: { id: Column; title: string; bgColor: string; borderColor: string }[] = [
	{
		id: "todo",
		title: "To Do",
		bgColor: "bg-slate-50 dark:bg-slate-900/50",
		borderColor: "border-slate-200 dark:border-slate-700"
	},
	{
		id: "in-progress",
		title: "In Progress",
		bgColor: "bg-blue-50 dark:bg-blue-950/20",
		borderColor: "border-blue-200 dark:border-blue-800"
	},
	{
		id: "done",
		title: "Done",
		bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
		borderColor: "border-emerald-200 dark:border-emerald-800"
	},
];

const priorityStyles: Record<string, string> = {
	high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
	medium: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	low: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
};

// Animation variants
const columnVariants = {
	hidden: {
		opacity: 0,
		y: 20,
	},
	visible: (custom: number) => ({
		opacity: 1,
		y: 0,
		transition: {
			delay: custom * 0.1,
			duration: 0.4,
			ease: [0.25, 0.1, 0.25, 1],
		},
	}),
};

const cardVariants = {
	hidden: {
		opacity: 0,
		scale: 0.95,
	},
	visible: {
		opacity: 1,
		scale: 1,
		transition: {
			duration: 0.3,
			ease: [0.25, 0.1, 0.25, 1],
		},
	},
	exit: {
		opacity: 0,
		scale: 0.95,
		transition: {
			duration: 0.2,
		},
	},
};

const getColumnForTask = (task: Task): Column => {
	if (task.completed) return "done";
	// For this demo, treat high priority as "in progress"
	if (task.priority === "high") return "in-progress";
	return "todo";
};

export function BoardView({ tasks, onToggle, onEdit, onDelete, onPin }: BoardViewProps) {
	const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
	const prefersReducedMotion = useReducedMotion();

	const tasksByColumn: Record<Column, Task[]> = {
		"todo": [],
		"in-progress": [],
		"done": [],
	};

	tasks.forEach(task => {
		const column = getColumnForTask(task);
		tasksByColumn[column].push(task);
	});

	const adjustedCardVariants = prefersReducedMotion
		? { hidden: {}, visible: {}, exit: {} }
		: cardVariants;

	const handleDragEnd = (event: { active: { id: string }; over: { id: string } | null }) => {
		const { active, over } = event;
		if (over && active.id !== over.id) {
			// Handle drag and drop reordering
			console.log('Dragged', active.id, 'to', over.id);
		}
	};

	return (
		<div className="h-full">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{columns.map((column, columnIndex) => {
					const columnTasks = tasksByColumn[column.id];
					const completedCount = columnTasks.filter(t => t.completed).length;

					return (
						<motion.div
							key={column.id}
							custom={columnIndex}
							variants={columnVariants}
							initial="hidden"
							animate="visible"
							className={cn(
								"rounded-xl border p-4 flex flex-col",
								column.bgColor,
								column.borderColor
							)}
						>
							{/* Column Header */}
							<div className="flex items-center justify-between mb-4">
								<div className="flex items-center gap-2">
									<motion.div
										className={cn(
											"w-3 h-3 rounded-full",
											column.id === "todo" && "bg-slate-400",
											column.id === "in-progress" && "bg-blue-500",
											column.id === "done" && "bg-emerald-500"
										)}
										animate={{
											scale: [1, 1.2, 1],
											opacity: [1, 0.7, 1],
										}}
										transition={{
											duration: 2,
											repeat: Infinity,
											repeatDelay: 3,
										}}
									/>
									<h3 className="font-semibold text-sm text-monza-900 dark:text-white">
										{column.title}
									</h3>
								</div>
								<motion.div
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
								>
									<Badge variant="secondary" className="text-xs">
										{completedCount}/{columnTasks.length}
									</Badge>
								</motion.div>
							</div>

							{/* Task Cards */}
							<div className="flex-1 space-y-3 overflow-y-auto">
								<AnimatePresence>
									{columnTasks.map((task, index) => (
										<motion.div
											key={task.id}
											variants={adjustedCardVariants}
											initial="hidden"
											animate="visible"
											exit="exit"
											whileHover={{
												y: prefersReducedMotion ? 0 : -4,
												transition: { duration: 0.2 },
											}}
											drag={prefersReducedMotion ? false : true}
											dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
											dragElastic={0.1}
											onDragEnd={handleDragEnd}
											className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer transition-all"
											onClick={() => setSelectedTask(task)}
										>
											<div className="flex items-start justify-between gap-2 mb-2">
												<h4 className={cn(
													"text-sm font-medium line-clamp-2",
													task.completed ? "line-through text-monza-400" : "text-monza-900 dark:text-white"
												)}>
													{task.title}
												</h4>
											</div>

											{task.description && (
												<p className="text-xs text-monza-500 dark:text-monza-400 line-clamp-2 mb-2">
													{task.description}
												</p>
											)}

											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													{task.priority && (
														<motion.div
															whileHover={{ scale: 1.05 }}
														>
															<Badge variant="outline" className={cn("text-[10px]", priorityStyles[task.priority])}>
																{task.priority}
															</Badge>
														</motion.div>
													)}
												</div>

												<motion.div
													className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
													initial={{ opacity: 0 }}
													whileHover={{ opacity: 1 }}
												>
													<motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
														<Button
															variant="ghost"
															size="icon"
															className="h-6 w-6"
															onClick={(e) => {
																e.stopPropagation();
																onToggle(task.id);
															}}
														>
															<Check className="w-3 h-3" />
														</Button>
													</motion.div>
													<motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
														<Button
															variant="ghost"
															size="icon"
															className="h-6 w-6"
															onClick={(e) => {
																e.stopPropagation();
																onEdit?.(task);
															}}
														>
															<Edit2 className="w-3 h-3" />
														</Button>
													</motion.div>
													<motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
														<Button
															variant="ghost"
															size="icon"
															className="h-6 w-6 hover:text-red-600"
															onClick={(e) => {
																e.stopPropagation();
																onDelete?.(task.id);
															}}
														>
															<X className="w-3 h-3" />
														</Button>
													</motion.div>
												</motion.div>
											</div>
										</motion.div>
									))}
								</AnimatePresence>

								{columnTasks.length === 0 && (
									<motion.div
										className="text-center py-8 opacity-50"
										initial={{ opacity: 0 }}
										animate={{ opacity: 0.5 }}
										transition={{ duration: 0.3 }}
									>
										<p className="text-sm text-monza-400 dark:text-monza-500">
											No tasks
										</p>
									</motion.div>
								)}
							</div>
						</motion.div>
					);
				})}
			</div>
		</div>
	);
}
