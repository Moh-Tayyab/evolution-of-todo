"use client";

import * as React from "react";
import {
	DragDropContext,
	Droppable,
	Draggable,
	type DropResult,
	type DroppableProvided,
	type DroppableStateSnapshot,
	type DraggableProvided,
	type DraggableStateSnapshot
} from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";
import { type Task } from "@/components/tasks";
import { Badge } from "@/components/ui/badge";
import { Clock, GripVertical, CheckCircle2, Circle, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

interface BoardViewProps {
	tasks: Task[];
	onToggle: (id: string) => void;
	onEdit?: (task: Task) => void;
}

interface Column {
	id: string;
	title: string;
	icon: React.ReactNode;
	tasks: Task[];
	color: string;
}

interface Tag {
	id: string;
	name: string;
	color: string;
}

export function BoardView({ tasks, onToggle, onEdit }: BoardViewProps) {
	const columns: Column[] = [
		{
			id: "pending",
			title: "To Do",
			icon: <Circle className="w-5 h-5" />,
			tasks: tasks.filter(t => !t.completed),
			color: "text-amber-600 dark:text-amber-400",
		},
		{
			id: "completed",
			title: "Completed",
			icon: <CheckCircle2 className="w-5 h-5" />,
			tasks: tasks.filter(t => t.completed),
			color: "text-emerald-600 dark:text-emerald-400",
		},
	];

	const onDragEnd = (result: DropResult) => {
		const { destination, source, draggableId } = result;

		if (!destination) return;

		if (
			destination.droppableId === source.droppableId &&
			destination.index === source.index
		) {
			return;
		}

		// Toggle task status if moved between columns
		if (destination.droppableId !== source.droppableId) {
			onToggle(draggableId);
		}
	};

	const priorityStyles: Record<string, string> = {
		high: "bg-red-600 dark:bg-red-500",
		medium: "bg-amber-600 dark:bg-amber-500",
		low: "bg-emerald-600 dark:bg-emerald-500",
	};

	if (tasks.length === 0) {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="flex flex-col items-center justify-center py-20"
			>
				<div className="p-6 rounded-full bg-muted mb-6">
					<LayoutGrid className="w-12 h-12 text-muted-foreground" />
				</div>
				<h3 className="text-xl font-semibold text-foreground mb-2">No tasks yet</h3>
				<p className="text-muted-foreground">Create your first task to use the board</p>
			</motion.div>
		);
	}

	return (
		<DragDropContext onDragEnd={onDragEnd}>
			<div className="flex gap-6 overflow-x-auto pb-4 min-h-[500px]">
				{columns.map((column, columnIndex) => (
					<motion.div
						key={column.id}
						initial={{ opacity: 0, x: -10 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: columnIndex * 0.05, duration: 0.2 }}
						className="flex-1 min-w-[320px] max-w-[400px]"
					>
						{/* Column Header */}
						<div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
							<div className="flex items-center gap-3">
								<div className={cn("p-2 rounded-lg bg-muted", column.color)}>
									{column.icon}
								</div>
								<div>
									<h3 className="font-semibold text-base text-foreground">{column.title}</h3>
									<p className="text-xs text-muted-foreground">{column.tasks.length} tasks</p>
								</div>
							</div>

							<Badge
								variant="secondary"
								className="text-sm font-medium px-2.5 py-0.5"
							>
								{column.tasks.length}
							</Badge>
						</div>

						{/* Drop Zone */}
						<Droppable droppableId={column.id}>
							{(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
								<div
									{...provided.droppableProps}
									ref={provided.innerRef}
									className={cn(
										"min-h-[400px] rounded-xl p-3 transition-colors duration-200",
										"bg-card border border-border",
										snapshot.isDraggingOver
											? "border-primary-500/50 bg-primary-500/5"
											: ""
									)}
								>
									<AnimatePresence mode="popLayout">
										<div className="space-y-3">
											{column.tasks.map((task, index) => (
												<Draggable key={task.id} draggableId={task.id} index={index}>
													{(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
														<motion.div
															ref={provided.innerRef}
															{...provided.draggableProps}
															initial={{ opacity: 0, y: 5 }}
															animate={{ opacity: 1, y: 0 }}
															exit={{ opacity: 0, scale: 0.95 }}
															transition={{ delay: index * 0.03, duration: 0.2 }}
															onClick={() => onEdit?.(task)}
															className={cn(
																"group relative rounded-lg p-4 cursor-grab active:cursor-grabbing",
																"bg-card border border-border",
																"shadow-sm hover:shadow-md",
																"transition-all duration-200",
																snapshot.isDragging && "shadow-lg scale-[1.02]"
															)}
														>
															{/* Drag Handle */}
															<div
																{...provided.dragHandleProps}
																className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
															>
																<GripVertical className="w-4 h-4 text-muted-foreground" />
															</div>

															{/* Priority Indicator */}
															<div className={cn(
																"absolute top-0 left-0 w-1 h-full rounded-l-lg",
																priorityStyles[task.priority || "medium"]
															)} />

															{/* Content */}
															<div className="pl-4">
																<div className="flex items-start justify-between gap-2 mb-2">
																	<span className={cn(
																		"font-medium text-sm line-clamp-2",
																		task.completed && "line-through text-muted-foreground"
																	)}>
																		{task.title}
																	</span>
																	<Badge
																		variant="outline"
																		className="text-[10px] shrink-0 capitalize"
																	>
																		{task.priority || "medium"}
																	</Badge>
																</div>

																{task.description && (
																	<p className="text-xs text-muted-foreground line-clamp-2 mb-3">
																		{task.description}
																	</p>
																)}

																<div className="flex items-center gap-2 text-xs text-muted-foreground">
																	<Clock className="w-3 h-3" />
																	<span>{new Date(task.created_at).toLocaleDateString()}</span>
																</div>

																{/* Tags */}
																{task.tags && task.tags.length > 0 && (
																	<div className="flex flex-wrap gap-1.5 mt-2">
																		{task.tags.map((tag: Tag) => (
																			<span
																				key={tag.id}
																				className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-muted border border-border"
																			>
																				{tag.name}
																			</span>
																		))}
																	</div>
																)}
															</div>
														</motion.div>
													)}
												</Draggable>
											))}
										</div>
									</AnimatePresence>
									{provided.placeholder}

									{/* Empty state */}
									{column.tasks.length === 0 && (
										<div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
											<p className="text-sm">Drop tasks here</p>
										</div>
									)}
								</div>
							)}
						</Droppable>
					</motion.div>
				))}
			</div>
		</DragDropContext>
	);
}
