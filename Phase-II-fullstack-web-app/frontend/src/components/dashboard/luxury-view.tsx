// @spec: specs/002-fullstack-web-app/plan.md
// Luxury View - Professional Grid Layout matching sidebar quality

"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type Task } from "@/components/tasks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Clock,
	Calendar as CalendarIcon,
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
	Pin,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LuxuryViewProps {
	tasks: Task[];
	onToggle: (id: string) => void;
	onEdit?: (task: Task) => void;
	onDelete?: (id: string) => void;
	onPin?: (id: string) => void;
}

interface Tag {
	id: string;
	name: string;
	color: string;
}

// Professional, subtle priority styling - matching sidebar quality
const priorityStyles: Record<string, { badge: string; text: string }> = {
	high: {
		badge: "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50",
		text: "text-red-700 dark:text-red-400",
	},
	medium: {
		badge: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50",
		text: "text-blue-700 dark:text-blue-400",
	},
	low: {
		badge: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50",
		text: "text-emerald-700 dark:text-emerald-400",
	},
};

export function LuxuryView({ tasks, onToggle, onDelete, onPin }: LuxuryViewProps) {
	if (tasks.length === 0) {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="flex flex-col items-center justify-center py-20"
			>
				<div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50 mb-4">
					<Plus className="w-10 h-10 text-slate-400 dark:text-slate-500" />
				</div>
				<h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">No tasks yet</h3>
				<p className="text-sm text-slate-600 dark:text-slate-400">Create your first task to get started</p>
			</motion.div>
		);
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
			{tasks.map((task, index) => {
				const priority = task.priority as keyof typeof priorityStyles;
				const styles = priorityStyles[priority] || priorityStyles.medium;

				return (
					<motion.div
						key={task.id}
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{
							delay: index * 0.03,
							duration: 0.25,
						}}
						className="group"
					>
						<div className="h-full flex flex-col rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 backdrop-blur-sm p-4 hover:shadow-sm transition-all duration-200">
							{/* Header */}
							<div className="flex items-center justify-between mb-3">
								<Badge className={cn("text-xs font-medium", styles.badge)} variant="outline">
									{task.priority}
								</Badge>

								<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
									{onPin && (
										<Button
											variant="ghost"
											size="icon"
											className="h-7 w-7 hover:bg-slate-100 dark:hover:bg-slate-700/50"
											onClick={() => onPin(task.id)}
										>
											<Pin className={cn("h-3.5 w-3.5", task.is_pinned && "text-indigo-600 dark:text-indigo-400 fill-indigo-600 dark:fill-indigo-400")} />
										</Button>
									)}
									<Button
										variant="ghost"
										size="icon"
										className="h-7 w-7 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600"
										onClick={() => onDelete?.(task.id)}
									>
										<X className="h-3.5 w-3.5" />
									</Button>
								</div>
							</div>

							{/* Pinned indicator */}
							{task.is_pinned && (
								<div className="absolute top-2 right-2">
									<Pin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 fill-indigo-600 dark:fill-indigo-400" />
								</div>
							)}

							{/* Content */}
							<div className="flex-1 min-h-0">
								<h3
									className={cn(
										"text-sm font-medium mb-2 line-clamp-2 transition-colors",
										"group-hover:text-indigo-600 dark:group-hover:text-indigo-400",
										task.completed && "line-through text-slate-400 dark:text-slate-500"
									)}
								>
									{task.title}
								</h3>

								{task.description && (
									<p className="text-xs text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
										{task.description}
									</p>
								)}

								{/* Tags */}
								{task.tags && task.tags.length > 0 && (
									<div className="flex flex-wrap gap-1.5 mb-3">
										{task.tags.slice(0, 3).map((tag: Tag) => (
											<span
												key={tag.id}
												className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600"
											>
												{tag.name}
											</span>
										))}
										{task.tags.length > 3 && (
											<span className="text-[10px] text-slate-500 dark:text-slate-500">
												+{task.tags.length - 3} more
											</span>
										)}
									</div>
								)}
							</div>

							{/* Footer */}
							<div className="mt-auto pt-3 border-t border-slate-200 dark:border-slate-700/50">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
										<CalendarIcon className="h-3.5 w-3.5" />
										<span>{new Date(task.created_at).toLocaleDateString()}</span>
									</div>

									{task.due_date && (
										<div className={cn(
											"flex items-center gap-1.5 px-2 py-1 rounded-md text-xs",
											new Date(task.due_date) < new Date()
												? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400"
												: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400"
										)}>
											<Clock className="h-3.5 w-3.5" />
											<span>{new Date(task.due_date).toLocaleDateString()}</span>
										</div>
									)}
								</div>
							</div>

							{/* Action Button */}
							<Button
								onClick={() => onToggle(task.id)}
								variant={task.completed ? "outline" : "default"}
								size="sm"
								className={cn(
									"w-full mt-3 font-medium text-xs transition-all duration-200",
									task.completed && "hover:bg-slate-100 dark:hover:bg-slate-700/50"
								)}
							>
								{task.completed ? (
									<>
										<span className="mr-1.5">↩</span> Restore
									</>
								) : (
									<>
										<Check className="w-3 h-3 mr-1.5" /> Complete
									</>
								)}
							</Button>
						</div>
					</motion.div>
				);
			})}
		</div>
	);
}
