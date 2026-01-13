"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { type Task } from "@/components/tasks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SpotlightCard } from "@/components/ui/spotlight";
import { GlowingBorder } from "@/components/ui/border-beam";
import {
	Clock,
	Calendar as CalendarIcon,
	Check,
	Trash2,
	Pin,
	Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LuxuryViewProps {
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

const priorityStyles: Record<string, { badge: string; glow: string; accent: string }> = {
	high: {
		badge: "bg-gradient-to-r from-red-500 to-pink-500 text-white border-0",
		glow: "shadow-red-500/30",
		accent: "from-red-500 to-pink-500",
	},
	medium: {
		badge: "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0",
		glow: "shadow-amber-500/30",
		accent: "from-amber-500 to-orange-500",
	},
	low: {
		badge: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0",
		glow: "shadow-emerald-500/30",
		accent: "from-emerald-500 to-teal-500",
	},
};

export function LuxuryView({ tasks, onToggle, onDelete, onPin }: LuxuryViewProps) {
	if (tasks.length === 0) {
		return (
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				className="flex flex-col items-center justify-center py-20"
			>
				<div className="p-6 rounded-full bg-primary-500/10 mb-6">
					<Sparkles className="w-12 h-12 text-primary-500" />
				</div>
				<h3 className="text-xl font-semibold text-foreground mb-2">No tasks yet</h3>
				<p className="text-muted-foreground">Create your first task to get started</p>
			</motion.div>
		);
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-2">
			{tasks.map((task, index) => {
				const priority = task.priority as keyof typeof priorityStyles;
				const styles = priorityStyles[priority] || priorityStyles.medium;

				return (
					<motion.div
						key={task.id}
						initial={{ opacity: 0, y: 30, rotateX: -10 }}
						animate={{ opacity: 1, y: 0, rotateX: 0 }}
						transition={{
							delay: index * 0.1,
							duration: 0.6,
							type: "spring",
							stiffness: 100
						}}
						whileHover={{ y: -8, scale: 1.02 }}
						className="group perspective-1000"
					>
						<GlowingBorder containerClassName="h-full">
							<SpotlightCard className="h-full flex flex-col">
								{/* Header */}
								<div className="flex items-center justify-between mb-4">
									<Badge className={cn("font-semibold uppercase text-xs tracking-wider", styles.badge)}>
										{task.priority}
									</Badge>

									<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
										{onPin && (
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8 hover:bg-primary-500/10"
												onClick={() => onPin(task.id)}
											>
												<Pin className={cn("h-4 w-4", task.is_pinned && "text-primary-500 fill-primary-500")} />
											</Button>
										)}
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8 hover:bg-red-500/10 hover:text-red-500"
											onClick={() => onDelete(task.id)}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</div>

								{/* Pinned indicator */}
								{task.is_pinned && (
									<div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
										<div className="absolute top-3 right-[-30px] w-[100px] bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs py-1 text-center rotate-45 shadow-lg">
											Pinned
										</div>
									</div>
								)}

								{/* Content */}
								<div className="flex-1">
									<h3
										className={cn(
											"text-xl font-bold mb-3 transition-all duration-300",
											"group-hover:text-primary-500 dark:group-hover:text-primary-400",
											task.completed && "line-through text-muted-foreground"
										)}
									>
										{task.title}
									</h3>

									<p className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed">
										{task.description}
									</p>

									{/* Tags */}
									{task.tags && task.tags.length > 0 && (
										<div className="flex flex-wrap gap-2 mb-4">
											{task.tags.map((tag: Tag) => (
												<span
													key={tag.id}
													className="px-2 py-1 rounded-full text-xs font-medium"
													style={{
														backgroundColor: `${tag.color}20`,
														color: tag.color,
													}}
												>
													{tag.name}
												</span>
											))}
										</div>
									)}
								</div>

								{/* Footer */}
								<div className="mt-auto pt-4 border-t border-white/10">
									<div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
										<div className="flex items-center gap-1.5">
											<CalendarIcon className="h-3.5 w-3.5" />
											<span>{new Date(task.created_at).toLocaleDateString()}</span>
										</div>

										{task.due_date && (
											<div className={cn(
												"flex items-center gap-1.5 px-2 py-1 rounded-full",
												new Date(task.due_date) < new Date()
													? "bg-red-500/10 text-red-500"
													: "bg-amber-500/10 text-amber-500"
											)}>
												<Clock className="h-3.5 w-3.5" />
												<span>{new Date(task.due_date).toLocaleDateString()}</span>
											</div>
										)}
									</div>

									{/* Action Button */}
									<Button
										onClick={() => onToggle(task.id)}
										className={cn(
											"w-full font-semibold transition-all duration-300",
											task.completed
												? "bg-muted hover:bg-muted/80 text-muted-foreground"
												: cn("bg-gradient-to-r text-white shadow-lg hover:shadow-xl hover:scale-[1.02]", styles.accent)
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
							</SpotlightCard>
						</GlowingBorder>
					</motion.div>
				);
			})}
		</div>
	);
}
