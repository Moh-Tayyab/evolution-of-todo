// @spec: specs/002-fullstack-web-app/spec.md
// @spec: Calendar View - Enhanced calendar display

"use client";

import * as React from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { type Task } from "@/components/tasks";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CalendarViewProps {
	tasks: Task[];
	onTaskClick?: (task: Task) => void;
}

// Animation variants
const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.02,
		},
	},
};

const dayVariants = {
	hidden: {
		opacity: 0,
		scale: 0.8,
	},
	visible: {
		opacity: 1,
		scale: 1,
		transition: {
			duration: 0.2,
			ease: "easeOut",
		},
	},
	hover: {
		scale: 1.05,
		transition: {
			duration: 0.1,
		},
	},
};

export function CalendarView({ tasks, onTaskClick }: CalendarViewProps) {
	const [currentDate, setCurrentDate] = React.useState(new Date());
	const prefersReducedMotion = useReducedMotion();

	const adjustedContainerVariants = prefersReducedMotion
		? { hidden: {}, visible: {} }
		: containerVariants;

	const adjustedDayVariants = prefersReducedMotion
		? { hidden: {}, visible: {}, hover: {} }
		: dayVariants;

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
			className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm p-6"
			variants={adjustedContainerVariants}
			initial="hidden"
			animate="visible"
		>
			{/* Header */}
			<div className="flex items-center justify-between mb-6">
				<motion.div
					className="flex items-center gap-3"
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.4 }}
				>
					<motion.div
						className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/30"
						whileHover={{ scale: 1.05, rotate: 5 }}
						transition={{ type: "spring", stiffness: 300 }}
					>
						<CalendarIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
					</motion.div>
					<div>
						<h2 className="text-xl font-semibold text-foreground">{monthName}</h2>
						<p className="text-sm text-muted-foreground">{year}</p>
					</div>
				</motion.div>

				<div className="flex gap-2">
					<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
						<Button
							variant="outline"
							size="icon"
							onClick={prevMonth}
							className="rounded-lg"
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
					</motion.div>
					<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
						<Button
							variant="outline"
							size="icon"
							onClick={nextMonth}
							className="rounded-lg"
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</motion.div>
				</div>
			</div>

			{/* Week days header */}
			<motion.div
				className="grid grid-cols-7 gap-2 mb-4"
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3, delay: 0.2 }}
			>
				{weekDays.map((day) => (
					<motion.div
						key={day}
						className="text-center text-xs font-medium text-muted-foreground py-2"
						whileHover={{ scale: 1.1 }}
						transition={{ type: "spring", stiffness: 400 }}
					>
						{day}
					</motion.div>
				))}
			</motion.div>

			{/* Calendar grid */}
			<motion.div
				className="grid grid-cols-7 gap-2"
				variants={adjustedContainerVariants}
			>
				{blanks.map((_, i) => (
					<motion.div
						key={`blank-${i}`}
						className="aspect-square rounded-lg bg-slate-100 dark:bg-slate-800/50"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.2, delay: i * 0.01 }}
					/>
				))}

				<AnimatePresence>
					{days.map((day, index) => {
						const dayTasks = getTasksForDay(day);
						const hasHighPriority = dayTasks.some(t => t.priority === "high");

						return (
							<motion.div
								key={day}
								variants={adjustedDayVariants}
								whileHover={!prefersReducedMotion ? "hover" : undefined}
								className={cn(
									"aspect-square p-2 rounded-lg cursor-pointer relative",
									"border border-transparent hover:border-indigo-500/30 transition-colors duration-150",
									"bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50",
									isToday(day) && "ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
								)}
							>
								<div className={cn(
									"text-xs font-medium mb-1",
									isToday(day) ? "text-indigo-600 dark:text-indigo-400" : "text-monza-900 dark:text-slate-100"
								)}>
									{day}
								</div>

								<div className="space-y-0.5 overflow-hidden">
									<AnimatePresence>
										{dayTasks.slice(0, 2).map((task, taskIndex) => (
											<motion.div
												key={task.id}
												onClick={() => onTaskClick?.(task)}
												initial={{ opacity: 0, x: -10 }}
												animate={{ opacity: 1, x: 0 }}
												exit={{ opacity: 0, x: 10 }}
												transition={{ duration: 0.2, delay: taskIndex * 0.05 }}
												whileHover={{ scale: 1.02 }}
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
									</AnimatePresence>

									{dayTasks.length > 2 && (
										<motion.div
											className="text-[9px] text-muted-foreground text-center"
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={{ delay: 0.1 }}
										>
											+{dayTasks.length - 2}
										</motion.div>
									)}
								</div>

								{/* Priority indicator dot */}
								<AnimatePresence>
									{hasHighPriority && !isToday(day) && (
										<motion.div
											className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500"
											initial={{ scale: 0 }}
											animate={{ scale: 1 }}
											exit={{ scale: 0 }}
											transition={{
												type: "spring",
												stiffness: 500,
												damping: 15,
											}}
										/>
									)}
								</AnimatePresence>
							</motion.div>
						);
					})}
				</AnimatePresence>
			</motion.div>

			{/* Legend */}
			<motion.div
				className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.5, duration: 0.3 }}
			>
				{[
					{ color: "bg-red-500 dark:bg-red-400", label: "High Priority" },
					{ color: "bg-blue-500 dark:bg-blue-400", label: "Medium" },
					{ color: "bg-emerald-500 dark:bg-emerald-400", label: "Completed" },
				].map((item, index) => (
					<motion.div
						key={item.label}
						className="flex items-center gap-2 text-xs text-muted-foreground"
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.5 + index * 0.1 }}
						whileHover={{ scale: 1.05 }}
					>
						<div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
						<span>{item.label}</span>
					</motion.div>
				))}
			</motion.div>
		</motion.div>
	);
}
