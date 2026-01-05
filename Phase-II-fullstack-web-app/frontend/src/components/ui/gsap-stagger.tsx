"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface GSAPStaggerProps {
  children: React.ReactNode[];
  className?: string;
  staggerDelay?: number;
  duration?: number;
  ease?: string;
}

export function GSAPStagger({
  children,
  className,
  staggerDelay = 0.1,
  duration = 0.6,
  ease = "power3.out",
}: GSAPStaggerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const items = container?.querySelectorAll(":scope > div");

    if (!items || items.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        items,
        {
          y: 40,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration,
          ease,
          stagger: staggerDelay,
          scrollTrigger: {
            trigger: container,
            start: "top 85%",
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [children, staggerDelay, duration, ease]);

  return (
    <div ref={containerRef} className={cn("", className)}>
      {children.map((child, index) => (
        <div key={index} ref={itemsRef}>
          {child}
        </div>
      ))}
    </div>
  );
}
