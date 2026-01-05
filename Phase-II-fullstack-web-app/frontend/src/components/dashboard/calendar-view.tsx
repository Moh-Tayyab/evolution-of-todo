"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Task } from "@/components/tasks";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarViewProps {
	tasks: Task[];
}

export function CalendarView({ tasks }: CalendarViewProps) {
	const [currentDate, setCurrentDate] = useState(new Date());

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

	const monthName = currentDate.toLocaleString("default", { month: "long" });
	const year = currentDate.getFullYear();

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

	const nextMonth = () => {
		setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
	};

	const prevMonth = () => {
		setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
	};

	return (
		<Card className="p-6 bg-white dark:bg-black border shadow-lg">
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-2xl font-bold">{monthName} {year}</h2>
				<div className="flex gap-2">
					<Button variant="outline" size="icon" onClick={prevMonth}>
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<Button variant="outline" size="icon" onClick={nextMonth}>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-7 gap-4 mb-4 text-center font-bold text-muted-foreground">
				<div>Sun</div>
				<div>Mon</div>
				<div>Tue</div>
				<div>Wed</div>
				<div>Thu</div>
				<div>Fri</div>
				<div>Sat</div>
			</div>

			<div className="grid grid-cols-7 gap-4">
				{blanks.map((_, i) => (
					<div key={`blank-${i}`} className="h-32 bg-gray-50/50 rounded-lg" />
				))}
				{days.map((day) => {
					const dayTasks = getTasksForDay(day);
					return (
						<motion.div
							key={day}
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{ delay: day * 0.01 }}
							className="h-32 p-2 border rounded-lg hover:shadow-md transition-shadow relative overflow-hidden bg-white dark:bg-gray-900"
						>
							<div className="font-semibold mb-1">{day}</div>
							<div className="space-y-1 overflow-y-auto max-h-[80px]">
								{dayTasks.map((task) => (
									<div
										key={task.id}
										className={`text-xs p-1 rounded truncate ${task.completed ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
											}`}
										title={task.title}
									>
										{task.title}
									</div>
								))}
							</div>
						</motion.div>
					);
				})}
			</div>
		</Card>
	);
}
