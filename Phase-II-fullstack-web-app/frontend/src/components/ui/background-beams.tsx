"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface BackgroundBeamsProps {
	className?: string;
}

export function BackgroundBeams({ className }: BackgroundBeamsProps) {
	return (
		<div
			className={cn(
				"absolute inset-0 overflow-hidden pointer-events-none",
				className
			)}
		>
			<svg
				className="absolute w-full h-full"
				xmlns="http://www.w3.org/2000/svg"
			>
				<defs>
					<linearGradient id="beam-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="rgba(214, 103, 93, 0)" />
						<stop offset="50%" stopColor="rgba(214, 103, 93, 0.3)" />
						<stop offset="100%" stopColor="rgba(214, 103, 93, 0)" />
					</linearGradient>
					<linearGradient id="beam-gradient-2" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="rgba(168, 85, 247, 0)" />
						<stop offset="50%" stopColor="rgba(168, 85, 247, 0.2)" />
						<stop offset="100%" stopColor="rgba(168, 85, 247, 0)" />
					</linearGradient>
					<linearGradient id="beam-gradient-3" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="rgba(34, 211, 238, 0)" />
						<stop offset="50%" stopColor="rgba(34, 211, 238, 0.2)" />
						<stop offset="100%" stopColor="rgba(34, 211, 238, 0)" />
					</linearGradient>
				</defs>

				{/* Animated beams */}
				<g className="animate-pulse-slow">
					<line
						x1="10%"
						y1="0%"
						x2="90%"
						y2="100%"
						stroke="url(#beam-gradient-1)"
						strokeWidth="1"
						opacity="0.5"
					/>
					<line
						x1="30%"
						y1="0%"
						x2="70%"
						y2="100%"
						stroke="url(#beam-gradient-2)"
						strokeWidth="1"
						opacity="0.3"
					/>
					<line
						x1="50%"
						y1="0%"
						x2="50%"
						y2="100%"
						stroke="url(#beam-gradient-3)"
						strokeWidth="1"
						opacity="0.4"
					/>
					<line
						x1="70%"
						y1="0%"
						x2="30%"
						y2="100%"
						stroke="url(#beam-gradient-1)"
						strokeWidth="1"
						opacity="0.3"
					/>
					<line
						x1="90%"
						y1="0%"
						x2="10%"
						y2="100%"
						stroke="url(#beam-gradient-2)"
						strokeWidth="1"
						opacity="0.5"
					/>
				</g>
			</svg>

			{/* Gradient orbs */}
			<div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-float" />
			<div
				className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float"
				style={{ animationDelay: "2s" }}
			/>
			<div
				className="absolute top-1/2 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-float"
				style={{ animationDelay: "4s" }}
			/>
		</div>
	);
}

export function GridBackground({ className }: { className?: string }) {
	return (
		<div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
			<div className="absolute inset-0 bg-grid opacity-30 dark:opacity-20" />
			<div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
		</div>
	);
}
