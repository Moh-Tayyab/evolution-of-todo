"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SpotlightProps {
	className?: string;
	fill?: string;
}

export function Spotlight({ className, fill }: SpotlightProps) {
	return (
		<svg
			className={cn(
				"animate-spotlight pointer-events-none absolute z-[1] h-[169%] w-[138%] lg:w-[84%] opacity-0",
				className
			)}
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 3787 2842"
			fill="none"
		>
			<g filter="url(#filter)">
				<ellipse
					cx="1924.71"
					cy="273.501"
					rx="1924.71"
					ry="273.501"
					transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
					fill={fill || "rgba(214, 103, 93, 0.21)"}
					fillOpacity="0.21"
				/>
			</g>
			<defs>
				<filter
					id="filter"
					x="0.860352"
					y="0.838989"
					width="3785.16"
					height="2840.26"
					filterUnits="userSpaceOnUse"
					colorInterpolationFilters="sRGB"
				>
					<feFlood floodOpacity="0" result="BackgroundImageFix" />
					<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
					<feGaussianBlur stdDeviation="151" result="effect1_foregroundBlur_1065_8" />
				</filter>
			</defs>
		</svg>
	);
}

interface SpotlightCardProps {
	children: React.ReactNode;
	className?: string;
}

export function SpotlightCard({ children, className }: SpotlightCardProps) {
	const divRef = React.useRef<HTMLDivElement>(null);
	const [position, setPosition] = React.useState({ x: 0, y: 0 });
	const [opacity, setOpacity] = React.useState(0);

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!divRef.current) return;
		const rect = divRef.current.getBoundingClientRect();
		setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
	};

	return (
		<div
			ref={divRef}
			onMouseMove={handleMouseMove}
			onMouseEnter={() => setOpacity(1)}
			onMouseLeave={() => setOpacity(0)}
			className={cn(
				"relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 dark:bg-black/20 backdrop-blur-xl p-8",
				className
			)}
		>
			<div
				className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
				style={{
					opacity,
					background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(214, 103, 93, 0.15), transparent 40%)`,
				}}
			/>
			{children}
		</div>
	);
}
