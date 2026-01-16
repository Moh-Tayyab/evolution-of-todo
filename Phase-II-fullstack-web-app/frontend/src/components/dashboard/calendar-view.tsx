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
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm p-6"
		>
			{/* Header */}
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center gap-3">
					<div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/30">
						<CalendarIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
					</div>
					<div>
						<h2 className="text-xl font-semibold text-foreground">{monthName}</h2>
						<p className="text-sm text-muted-foreground">{year}</p>
					</div>
				</div>

				<div className="flex gap-2">
					<Button
						variant="outline"
						size="icon"
						onClick={prevMonth}
						className="rounded-lg"
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						size="icon"
						onClick={nextMonth}
						className="rounded-lg"
					>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			</div>

			{/* Week days header */}
			<div className="grid grid-cols-7 gap-2 mb-4">
				{weekDays.map((day) => (
					<div
						key={day}
						className="text-center text-xs font-medium text-muted-foreground py-2"
					>
						{day}
					</div>
				))}
			</div>

			{/* Calendar grid */}
			<div className="grid grid-cols-7 gap-2">
				{blanks.map((_, i) => (
					<div key={`blank-${i}`} className="aspect-square rounded-lg bg-slate-100 dark:bg-slate-800/50" />
				))}

				<AnimatePresence mode="popLayout">
					{days.map((day) => {
						const dayTasks = getTasksForDay(day);
						const hasHighPriority = dayTasks.some(t => t.priority === "high");

						return (
							<motion.div
								key={day}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: day * 0.01, duration: 0.2 }}
								className={cn(
									"aspect-square p-2 rounded-lg cursor-pointer transition-colors duration-150 relative",
									"border border-transparent hover:border-indigo-500/30",
									"bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50",
									isToday(day) && "ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
								)}
							>
								<div className={cn(
									"text-xs font-medium mb-1",
									isToday(day) ? "text-indigo-600 dark:text-indigo-400" : "text-slate-900 dark:text-slate-100"
								)}>
									{day}
								</div>

								<div className="space-y-0.5 overflow-hidden">
									{dayTasks.slice(0, 2).map((task) => (
										<motion.div
											key={task.id}
											onClick={() => onTaskClick?.(task)}
											className={cn(
												"text-[9px] p-1 rounded truncate font-medium",
												task.completed
													? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 line-through"
													: task.priority === "high"
														? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400"
														: task.priority === "medium"
															? "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400"
															: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400"
											)}
										>
											{task.title}
										</motion.div>
									))}

									{dayTasks.length > 2 && (
										<div className="text-[9px] text-muted-foreground text-center">
											+{dayTasks.length - 2}
										</div>
									)}
								</div>

								{/* Priority indicator dot */}
								{hasHighPriority && !isToday(day) && (
									<div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500" />
								)}
							</motion.div>
						);
					})}
				</AnimatePresence>
			</div>

			{/* Legend */}
			<div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
				<div className="flex items-center gap-2 text-xs text-muted-foreground">
					<div className="w-2.5 h-2.5 rounded-full bg-red-500 dark:bg-red-400" />
					<span>High Priority</span>
				</div>
				<div className="flex items-center gap-2 text-xs text-muted-foreground">
					<div className="w-2.5 h-2.5 rounded-full bg-blue-500 dark:bg-blue-400" />
					<span>Medium</span>
				</div>
				<div className="flex items-center gap-2 text-xs text-muted-foreground">
					<div className="w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
					<span>Completed</span>
				</div>
			</div>
		</motion.div>
	);
}
