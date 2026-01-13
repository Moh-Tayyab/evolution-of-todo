"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { BorderBeam } from "./border-beam";

interface StatCardProps {
	label: string;
	value: number | React.ReactNode;
	icon: LucideIcon;
	trend?: number;
	color: "blue" | "green" | "yellow" | "red" | "purple" | "cyan";
	delay?: number;
}

const colorStyles: Record<string, { bg: string; icon: string; glow: string; gradient: string }> = {
	blue: {
		bg: "bg-blue-500/10 dark:bg-blue-500/20",
		icon: "text-blue-500",
		glow: "shadow-blue-500/20",
		gradient: "from-blue-500 to-cyan-500",
	},
	green: {
		bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
		icon: "text-emerald-500",
		glow: "shadow-emerald-500/20",
		gradient: "from-emerald-500 to-teal-500",
	},
	yellow: {
		bg: "bg-amber-500/10 dark:bg-amber-500/20",
		icon: "text-amber-500",
		glow: "shadow-amber-500/20",
		gradient: "from-amber-500 to-orange-500",
	},
	red: {
		bg: "bg-red-500/10 dark:bg-red-500/20",
		icon: "text-red-500",
		glow: "shadow-red-500/20",
		gradient: "from-red-500 to-pink-500",
	},
	purple: {
		bg: "bg-purple-500/10 dark:bg-purple-500/20",
		icon: "text-purple-500",
		glow: "shadow-purple-500/20",
		gradient: "from-purple-500 to-pink-500",
	},
	cyan: {
		bg: "bg-cyan-500/10 dark:bg-cyan-500/20",
		icon: "text-cyan-500",
		glow: "shadow-cyan-500/20",
		gradient: "from-cyan-500 to-blue-500",
	},
};

export function StatCard({ label, value, icon: Icon, trend, color, delay = 0 }: StatCardProps) {
	const styles = colorStyles[color];

	return (
		<motion.div
			initial={{ opacity: 0, y: 20, scale: 0.95 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			transition={{ delay, duration: 0.5, type: "spring" }}
			whileHover={{ y: -5, scale: 1.02 }}
			className="relative group"
		>
			<div
				className={cn(
					"relative overflow-hidden rounded-2xl p-6",
					"bg-white/80 dark:bg-white/5 backdrop-blur-xl",
					"border border-white/20 dark:border-white/10",
					"shadow-xl hover:shadow-2xl",
					"transition-all duration-500"
				)}
			>
				{/* Hover glow effect */}
				<div
					className={cn(
						"absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
						"bg-gradient-to-br",
						styles.gradient,
						"blur-2xl -z-10"
					)}
					style={{ opacity: 0.1 }}
				/>

				{/* Border beam on hover */}
				<BorderBeam
					className="opacity-0 group-hover:opacity-100 transition-opacity"
					colorFrom={color === "blue" ? "#3b82f6" : color === "green" ? "#10b981" : "#d6675d"}
					colorTo={color === "purple" ? "#a855f7" : "#22d3ee"}
				/>

				<div className="flex items-center justify-between">
					{/* Icon */}
					<div className={cn("p-3 rounded-xl", styles.bg)}>
						<Icon className={cn("w-6 h-6", styles.icon)} />
					</div>

					{/* Trend indicator */}
					{trend !== undefined && (
						<div
							className={cn(
								"px-2 py-1 rounded-full text-xs font-medium",
								trend > 0
									? "bg-emerald-500/10 text-emerald-500"
									: trend < 0
										? "bg-red-500/10 text-red-500"
										: "bg-gray-500/10 text-gray-500"
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
						transition={{ delay: delay + 0.2 }}
						className="text-3xl font-bold text-foreground"
					>
						{value}
					</motion.div>
					<p className="text-sm text-muted-foreground mt-1">{label}</p>
				</div>

				{/* Decorative gradient line */}
				<div
					className={cn(
						"absolute bottom-0 left-0 right-0 h-1",
						"bg-gradient-to-r",
						styles.gradient,
						"opacity-0 group-hover:opacity-100 transition-opacity duration-300"
					)}
				/>
			</div>
		</motion.div>
	);
}
