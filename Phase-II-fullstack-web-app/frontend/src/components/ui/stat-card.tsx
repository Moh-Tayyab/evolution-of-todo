"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
	label: string;
	value: number | React.ReactNode;
	icon: LucideIcon;
	trend?: number;
	color?: "blue" | "green" | "orange" | "red" | "purple" | "gray";
	delay?: number;
}

const colorStyles: Record<string, { bg: string; icon: string; border: string }> = {
	blue: {
		bg: "bg-blue-50 dark:bg-blue-950/30",
		icon: "text-blue-600 dark:text-blue-400",
		border: "border-blue-200 dark:border-blue-900/50",
	},
	green: {
		bg: "bg-emerald-50 dark:bg-emerald-950/30",
		icon: "text-emerald-600 dark:text-emerald-400",
		border: "border-emerald-200 dark:border-emerald-900/50",
	},
	orange: {
		bg: "bg-orange-50 dark:bg-orange-950/30",
		icon: "text-orange-600 dark:text-orange-400",
		border: "border-orange-200 dark:border-orange-900/50",
	},
	red: {
		bg: "bg-red-50 dark:bg-red-950/30",
		icon: "text-red-600 dark:text-red-400",
		border: "border-red-200 dark:border-red-900/50",
	},
	purple: {
		bg: "bg-purple-50 dark:bg-purple-950/30",
		icon: "text-purple-600 dark:text-purple-400",
		border: "border-purple-200 dark:border-purple-900/50",
	},
	gray: {
		bg: "bg-slate-50 dark:bg-slate-900/50",
		icon: "text-monza-600 dark:text-monza-400",
		border: "border-slate-200 dark:border-slate-800",
	},
};

export function StatCard({
	label,
	value,
	icon: Icon,
	trend,
	color = "blue",
	delay = 0
}: StatCardProps) {
	const styles = colorStyles[color];

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay, duration: 0.3 }}
			whileHover={{ y: -2 }}
			className="group"
		>
			<div
				className={cn(
					"rounded-xl p-5",
					"bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
					"shadow-sm hover:shadow-md",
					"transition-all duration-200"
				)}
			>
				<div className="flex items-start justify-between">
					{/* Icon */}
					<div className={cn("p-2.5 rounded-lg", styles.bg)}>
						<Icon className={cn("w-5 h-5", styles.icon)} />
					</div>

					{/* Trend indicator */}
					{trend !== undefined && (
						<div
							className={cn(
								"px-2 py-1 rounded-md text-xs font-medium",
								trend > 0
									? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
									: trend < 0
										? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400"
										: "bg-slate-50 dark:bg-slate-900/50 text-monza-600 dark:text-monza-400"
							)}
						>
							{trend > 0 ? "+" : ""}
							{trend}%
						</div>
					)}
				</div>

				{/* Value */}
				<div className="mt-4">
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: delay + 0.1 }}
						className="text-2xl font-semibold text-monza-900 dark:text-slate-100"
					>
						{value}
					</motion.div>
					<p className="text-sm text-monza-600 dark:text-monza-400 mt-0.5">{label}</p>
				</div>
			</div>
		</motion.div>
	);
}
