"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface GSAPParallaxProps {
  children: React.ReactNode;
  className?: string;
  speed?: number; // Positive moves slower, negative moves faster
  direction?: "vertical" | "horizontal";
}

export function GSAPParallax({
  children,
  className,
  speed = 0.5,
  direction = "vertical",
}: GSAPParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const ctx = gsap.context(() => {
      gsap.to(element, {
        [direction === "vertical" ? "y" : "x"]: speed * -200,
        ease: "none",
        scrollTrigger: {
          trigger: element.parentElement,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }, ref);

    return () => ctx.revert();
  }, [speed, direction]);

  return (
    <div ref={ref} className={cn("", className)}>
      {children}
    </div>
  );
}
