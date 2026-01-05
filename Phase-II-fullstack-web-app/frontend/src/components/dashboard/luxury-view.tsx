"use client";

import { motion } from "framer-motion";
import { Task } from "@/components/tasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar as CalendarIcon, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LuxuryViewProps {
	tasks: Task[];
	onToggle: (id: string) => void;
	onDelete: (id: string) => void;
}

export function LuxuryView({ tasks, onToggle, onDelete }: LuxuryViewProps) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
			{tasks.map((task, index) => (
				<motion.div
					key={task.id}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: index * 0.1, duration: 0.5 }}
					whileHover={{ scale: 1.02 }}
					className="group"
				>
					<Card className="h-full bg-white/50 dark:bg-black/50 backdrop-blur-xl border-white/20 shadow-xl overflow-hidden relative">
						<div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

						<CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
							<Badge
								variant={task.completed ? "secondary" : "default"}
								className={task.completed ? "bg-green-500/10 text-green-600" : ""}
							>
								{task.priority}
							</Badge>
							<Button variant="ghost" size="icon" className="h-8 w-8">
								<MoreVertical className="h-4 w-4" />
							</Button>
						</CardHeader>

						<CardContent className="relative z-10">
							<CardTitle className={`text-xl font-bold mb-2 ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
								{task.title}
							</CardTitle>
							<p className="text-muted-foreground text-sm mb-4 line-clamp-2">
								{task.description}
							</p>

							<div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto">
								<div className="flex items-center gap-1">
									<CalendarIcon className="h-3 w-3" />
									{new Date(task.created_at).toLocaleDateString()}
								</div>
								{task.due_date && (
									<div className="flex items-center gap-1 text-red-400">
										<Clock className="h-3 w-3" />
										{new Date(task.due_date).toLocaleDateString()}
									</div>
								)}
							</div>

							<div className="mt-4 flex gap-2">
								<Button
									className="w-full"
									variant={task.completed ? "outline" : "default"}
									onClick={() => onToggle(task.id)}
								>
									{task.completed ? "Restore" : "Complete"}
								</Button>
							</div>
						</CardContent>
					</Card>
				</motion.div>
			))}
		</div>
	);
}
