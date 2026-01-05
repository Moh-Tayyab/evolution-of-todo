"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * @spec: Spotlight Component from Aceternity UI
 * @description: Creates a spotlight effect for hero sections
 */

export interface SpotlightProps {
  className?: string;
  fill?: string;
}

/**
 * Spotlight - Creates a spotlight gradient effect
 *
 * Features:
 * - Animated gradient background
 * - Customizable fill color
 * - Smooth transitions
 */
export function Spotlight({ className, fill = "white" }: SpotlightProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      className={cn(
        "spotlight pointer-events-none fixed inset-0 z-30 transition duration-300",
        className
      )}
      style={{
        background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, ${fill}, transparent 40%)`,
      }}
    />
  );
}

/**
 * SpotlightPreview - Preview variant with larger radius
 */
export function SpotlightPreview({
  className,
  fill = "white",
}: SpotlightProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      className={cn(
        "spotlight-preview pointer-events-none fixed inset-0 z-30",
        className
      )}
      style={{
        background: `radial-gradient(1200px circle at ${mousePosition.x}px ${mousePosition.y}px, ${fill}, transparent 40%)`,
      }}
    />
  );
}
