"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface GSAPScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right";
  easing?: string;
}

export function GSAPScrollReveal({
  children,
  className,
  delay = 0,
  duration = 0.8,
  direction = "up",
  easing = "power3.out",
}: GSAPScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Set initial state based on direction
    const getInitialProps = () => {
      switch (direction) {
        case "up":
          return { y: 60, opacity: 0 };
        case "down":
          return { y: -60, opacity: 0 };
        case "left":
          return { x: 60, opacity: 0 };
        case "right":
          return { x: -60, opacity: 0 };
        default:
          return { y: 60, opacity: 0 };
      }
    };

    // Create GSAP timeline with ScrollTrigger
    const ctx = gsap.context(() => {
      gsap.fromTo(
        element,
        {
          ...getInitialProps(),
        },
        {
          y: 0,
          x: 0,
          opacity: 1,
          duration,
          delay,
          ease: easing,
          scrollTrigger: {
            trigger: element,
            start: "top 85%",
            end: "bottom 15%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, ref);

    return () => ctx.revert();
  }, [delay, duration, direction, easing]);

  return (
    <div ref={ref} className={cn("", className)}>
      {children}
    </div>
  );
}
