"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { type Task } from "@/components/tasks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Clock,
	Calendar as CalendarIcon,
	Check,
	Trash2,
	Pin,
	Grid3x3
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfessionalViewProps {
	tasks: Task[];
	onToggle: (id: string) => void;
	onDelete: (id: string) => void;
	onPin?: (id: string) => void;
}

interface Tag {
	id: string;
	name: string;
	color: string;
}

// Professional, subtle priority styling
const priorityStyles: Record<string, { badge: string; text: string }> = {
	high: {
		badge: "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50",
		text: "text-red-700 dark:text-red-400",
	},
	medium: {
		badge: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50",
		text: "text-amber-700 dark:text-amber-400",
	},
	low: {
		badge: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50",
		text: "text-emerald-700 dark:text-emerald-400",
	},
};

export function LuxuryView({ tasks, onToggle, onDelete, onPin }: ProfessionalViewProps) {
	if (tasks.length === 0) {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="flex flex-col items-center justify-center py-20"
			>
				<div className="p-6 rounded-full bg-muted mb-6">
					<Grid3x3 className="w-12 h-12 text-muted-foreground" />
				</div>
				<h3 className="text-xl font-semibold text-foreground mb-2">No tasks yet</h3>
				<p className="text-muted-foreground">Create your first task to get started</p>
			</motion.div>
		);
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
			{tasks.map((task, index) => {
				const priority = task.priority as keyof typeof priorityStyles;
				const styles = priorityStyles[priority] || priorityStyles.medium;

				return (
					<motion.div
						key={task.id}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{
							delay: index * 0.05,
							duration: 0.3,
						}}
						className="group"
					>
						<div className="h-full flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-all duration-200">
							{/* Header */}
							<div className="flex items-center justify-between mb-4">
								<Badge className={cn("font-medium text-xs", styles.badge)} variant="outline">
									{task.priority}
								</Badge>

								<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
									{onPin && (
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8 hover:bg-muted"
											onClick={() => onPin(task.id)}
										>
											<Pin className={cn("h-4 w-4", task.is_pinned && "text-primary fill-primary")} />
										</Button>
									)}
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600"
										onClick={() => onDelete(task.id)}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							</div>

							{/* Pinned indicator */}
							{task.is_pinned && (
								<div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
									<div className="absolute top-3 right-[-30px] w-[100px] bg-primary text-primary-foreground text-xs py-1 text-center rotate-45 shadow-sm">
										Pinned
									</div>
								</div>
							)}

							{/* Content */}
							<div className="flex-1">
								<h3
									className={cn(
										"text-lg font-semibold mb-2 transition-colors",
										"group-hover:text-primary",
										task.completed && "line-through text-muted-foreground"
									)}
								>
									{task.title}
								</h3>

								<p className="text-muted-foreground text-sm mb-4 line-clamp-2">
									{task.description}
								</p>

								{/* Tags */}
								{task.tags && task.tags.length > 0 && (
									<div className="flex flex-wrap gap-2 mb-4">
										{task.tags.map((tag: Tag) => (
											<span
												key={tag.id}
												className="px-2 py-1 rounded-md text-xs font-medium bg-muted text-foreground border border-border"
											>
												{tag.name}
											</span>
										))}
									</div>
								)}
							</div>

							{/* Footer */}
							<div className="mt-auto pt-4 border-t border-border">
								<div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
									<div className="flex items-center gap-1.5">
										<CalendarIcon className="h-3.5 w-3.5" />
										<span>{new Date(task.created_at).toLocaleDateString()}</span>
									</div>

									{task.due_date && (
										<div className={cn(
											"flex items-center gap-1.5 px-2 py-1 rounded-md",
											new Date(task.due_date) < new Date()
												? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400"
												: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400"
										)}>
											<Clock className="h-3.5 w-3.5" />
											<span>{new Date(task.due_date).toLocaleDateString()}</span>
										</div>
									)}
								</div>

								{/* Action Button */}
								<Button
									onClick={() => onToggle(task.id)}
									variant={task.completed ? "outline" : "default"}
									className={cn(
										"w-full font-medium transition-all duration-200",
										task.completed && "hover:bg-muted"
									)}
								>
									{task.completed ? (
										<>
											<span className="mr-2">↩</span> Restore Task
										</>
									) : (
										<>
											<Check className="w-4 h-4 mr-2" /> Mark Complete
										</>
									)}
								</Button>
							</div>
						</div>
					</motion.div>
				);
			})}
		</div>
	);
}
