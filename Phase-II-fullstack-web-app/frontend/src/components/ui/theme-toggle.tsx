"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
	const [isDark, setIsDark] = React.useState(false);
	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => {
		setMounted(true);
		// Check initial theme
		const isDarkMode = document.documentElement.classList.contains("dark");
		setIsDark(isDarkMode);
	}, []);

	const toggleTheme = () => {
		const newIsDark = !isDark;
		setIsDark(newIsDark);

		if (newIsDark) {
			document.documentElement.classList.add("dark");
			localStorage.setItem("theme", "dark");
		} else {
			document.documentElement.classList.remove("dark");
			localStorage.setItem("theme", "light");
		}
	};

	// Prevent hydration mismatch
	if (!mounted) {
		return (
			<div className={cn(
				"p-3 rounded-xl bg-white/80 dark:bg-white/5 backdrop-blur-lg border border-white/20 dark:border-white/10 shadow-lg",
				className
			)}>
				<div className="w-5 h-5" />
			</div>
		);
	}

	return (
		<motion.button
			onClick={toggleTheme}
			className={cn(
				"relative p-3 rounded-xl",
				"bg-white/80 dark:bg-white/5 backdrop-blur-lg",
				"border border-white/20 dark:border-white/10",
				"shadow-lg hover:shadow-xl",
				"transition-all duration-300",
				className
			)}
			whileHover={{ scale: 1.05 }}
			whileTap={{ scale: 0.95 }}
		>
			<motion.div
				initial={false}
				animate={{ rotate: isDark ? 180 : 0 }}
				transition={{ duration: 0.5, type: "spring" }}
			>
				{isDark ? (
					<Moon className="w-5 h-5 text-primary-400" />
				) : (
					<Sun className="w-5 h-5 text-primary-500" />
				)}
			</motion.div>

			{/* Glow effect */}
			<div className="absolute inset-0 rounded-xl bg-primary-500/20 blur-xl opacity-0 hover:opacity-100 transition-opacity -z-10" />
		</motion.button>
	);
}
