"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Task } from "@/components/tasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface BoardViewProps {
	tasks: Task[];
	onToggle: (id: string) => void;
}

export function BoardView({ tasks, onToggle }: BoardViewProps) {
	// We can't actually persist the drag without an API, but we can show the UI.
	// We'll separate tasks by status for the columns.

	const columns = {
		pending: {
			id: "pending",
			title: "Pending",
			tasks: tasks.filter(t => !t.completed)
		},
		completed: {
			id: "completed",
			title: "Completed",
			tasks: tasks.filter(t => t.completed)
		}
	};

	const onDragEnd = (result: DropResult) => {
		const { destination, source, draggableId } = result;

		if (!destination) return;

		if (
			destination.droppableId === source.droppableId &&
			destination.index === source.index
		) {
			return;
		}

		// Identify if status changed
		if (destination.droppableId !== source.droppableId) {
			onToggle(draggableId);
		}
	};

	return (
		<DragDropContext onDragEnd={onDragEnd}>
			<div className="flex gap-6 h-[calc(100vh-200px)] overflow-x-auto pb-4">
				{Object.values(columns).map((column) => (
					<div key={column.id} className="flex-1 min-w-[300px] flex flex-col">
						<h3 className="font-bold text-lg mb-4 flex items-center justify-between">
							{column.title}
							<Badge variant="secondary">{column.tasks.length}</Badge>
						</h3>
						<Droppable droppableId={column.id}>
							{(provided, snapshot) => (
								<div
									{...provided.droppableProps}
									ref={provided.innerRef}
									className={`flex-1 bg-gray-50/50 dark:bg-gray-900/50 rounded-xl p-4 transition-colors ${snapshot.isDraggingOver ? "bg-accent/50" : ""
										}`}
								>
									<div className="space-y-4">
										{column.tasks.map((task, index) => (
											<Draggable key={task.id} draggableId={task.id} index={index}>
												{(provided, snapshot) => (
													<Card
														ref={provided.innerRef}
														{...provided.draggableProps}
														{...provided.dragHandleProps}
														className={`cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${snapshot.isDragging ? "shadow-xl ring-2 ring-primary rotate-2" : ""
															}`}
													>
														<CardContent className="p-4">
															<div className="flex justify-between items-start mb-2">
																<span className="font-medium text-sm line-clamp-2">{task.title}</span>
																<Badge variant="outline" className="text-xs scale-90">{task.priority}</Badge>
															</div>
															<div className="flex items-center gap-2 text-xs text-muted-foreground">
																<Clock className="w-3 h-3" />
																<span>{new Date(task.created_at).toLocaleDateString()}</span>
															</div>
														</CardContent>
													</Card>
												)}
											</Draggable>
										))}
										{provided.placeholder}
									</div>
								</div>
							)}
						</Droppable>
					</div>
				))}
			</div>
		</DragDropContext>
	);
}
