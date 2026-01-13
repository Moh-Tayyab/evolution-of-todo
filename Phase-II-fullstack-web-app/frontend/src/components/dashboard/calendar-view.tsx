"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type Task } from "@/components/tasks";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CalendarViewProps {
	tasks: Task[];
	onTaskClick?: (task: Task) => void;
}

export function CalendarView({ tasks, onTaskClick }: CalendarViewProps) {
	const [currentDate, setCurrentDate] = React.useState(new Date());

	const daysInMonth = new Date(
		currentDate.getFullYear(),
		currentDate.getMonth() + 1,
		0
	).getDate();

	const firstDayOfMonth = new Date(
		currentDate.getFullYear(),
		currentDate.getMonth(),
		1
	).getDay();

	const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
	const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);
	const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

	const monthName = currentDate.toLocaleString("default", { month: "long" });
	const year = currentDate.getFullYear();
	const today = new Date();

	const getTasksForDay = (day: number) => {
		return tasks.filter(task => {
			const taskDate = new Date(task.due_date || task.created_at);
			return (
				taskDate.getDate() === day &&
				taskDate.getMonth() === currentDate.getMonth() &&
				taskDate.getFullYear() === currentDate.getFullYear()
			);
		});
	};

	const isToday = (day: number) => {
		return (
			day === today.getDate() &&
			currentDate.getMonth() === today.getMonth() &&
			currentDate.getFullYear() === today.getFullYear()
		);
	};

	const nextMonth = () => {
		setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
	};

	const prevMonth = () => {
		setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl p-6"
		>
			{/* Header */}
			<div className="flex items-center justify-between mb-8">
				<div className="flex items-center gap-3">
					<div className="p-3 rounded-xl bg-primary-500/10">
						<CalendarIcon className="w-6 h-6 text-primary-500" />
					</div>
					<div>
						<h2 className="text-2xl font-bold text-foreground">{monthName}</h2>
						<p className="text-sm text-muted-foreground">{year}</p>
					</div>
				</div>

				<div className="flex gap-2">
					<Button
						variant="outline"
						size="icon"
						onClick={prevMonth}
						className="rounded-xl hover:bg-primary-500/10 hover:text-primary-500 hover:border-primary-500/50"
					>
						<ChevronLeft className="h-5 w-5" />
					</Button>
					<Button
						variant="outline"
						size="icon"
						onClick={nextMonth}
						className="rounded-xl hover:bg-primary-500/10 hover:text-primary-500 hover:border-primary-500/50"
					>
						<ChevronRight className="h-5 w-5" />
					</Button>
				</div>
			</div>

			{/* Week days header */}
			<div className="grid grid-cols-7 gap-2 mb-4">
				{weekDays.map((day) => (
					<div
						key={day}
						className="text-center text-sm font-semibold text-muted-foreground py-2"
					>
						{day}
					</div>
				))}
			</div>

			{/* Calendar grid */}
			<div className="grid grid-cols-7 gap-2">
				{blanks.map((_, i) => (
					<div key={`blank-${i}`} className="aspect-square rounded-xl bg-muted/20" />
				))}

				<AnimatePresence mode="popLayout">
					{days.map((day, index) => {
						const dayTasks = getTasksForDay(day);
						const hasHighPriority = dayTasks.some(t => t.priority === "high");

						return (
							<motion.div
								key={day}
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: index * 0.02 }}
								whileHover={{ scale: 1.05, zIndex: 10 }}
								className={cn(
									"aspect-square p-2 rounded-xl cursor-pointer transition-all duration-300 relative",
									"border border-transparent hover:border-primary-500/50",
									"bg-white/50 dark:bg-white/5 hover:bg-primary-500/10",
									"shadow-sm hover:shadow-lg",
									isToday(day) && "ring-2 ring-primary-500 bg-primary-500/10"
								)}
							>
								<div className={cn(
									"text-sm font-medium mb-1",
									isToday(day) ? "text-primary-500" : "text-foreground"
								)}>
									{day}
								</div>

								<div className="space-y-1 overflow-hidden">
									{dayTasks.slice(0, 2).map((task) => (
										<motion.div
											key={task.id}
											onClick={() => onTaskClick?.(task)}
											whileHover={{ scale: 1.02 }}
											className={cn(
												"text-[10px] p-1 rounded truncate font-medium",
												task.completed
													? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 line-through"
													: task.priority === "high"
														? "bg-red-500/20 text-red-600 dark:text-red-400"
														: task.priority === "medium"
															? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
															: "bg-blue-500/20 text-blue-600 dark:text-blue-400"
											)}
										>
											{task.title}
										</motion.div>
									))}

									{dayTasks.length > 2 && (
										<div className="text-[10px] text-muted-foreground text-center">
											+{dayTasks.length - 2} more
										</div>
									)}
								</div>

								{/* Priority indicator dot */}
								{hasHighPriority && !isToday(day) && (
									<div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
								)}
							</motion.div>
						);
					})}
				</AnimatePresence>
			</div>

			{/* Legend */}
			<div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-white/10">
				<div className="flex items-center gap-2 text-xs text-muted-foreground">
					<div className="w-3 h-3 rounded-full bg-red-500/30" />
					<span>High Priority</span>
				</div>
				<div className="flex items-center gap-2 text-xs text-muted-foreground">
					<div className="w-3 h-3 rounded-full bg-amber-500/30" />
					<span>Medium</span>
				</div>
				<div className="flex items-center gap-2 text-xs text-muted-foreground">
					<div className="w-3 h-3 rounded-full bg-emerald-500/30" />
					<span>Completed</span>
				</div>
			</div>
		</motion.div>
	);
}
