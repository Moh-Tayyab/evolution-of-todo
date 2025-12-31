// @spec: specs/003-modern-ui-ux/spec.md
// @spec: specs/003-modern-ui-ux/plan.md
// Showcase cards using CardSpotlight from Aceternity UI

"use client";

import React from "react";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { Shield, Zap, Sparkles } from "lucide-react";

export function SpotlightFeatureCards() {
  const features = [
    {
      title: "Fast Performance",
      description: "Optimized animations ensuring 60fps even on lower-end devices.",
      icon: <Zap className="h-8 w-8 text-primary-500" />,
    },
    {
      title: "Secure Isolation",
      description: "Your tasks are yours alone, protected by robust JWT authentication.",
      icon: <Shield className="h-8 w-8 text-primary-500" />,
    },
    {
      title: "Interactive UI",
      description: "Amazing animations and micro-interactions for a premium feel.",
      icon: <Sparkles className="h-8 w-8 text-primary-500" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto py-12 px-4">
      {features.map((feature, i) => (
        <CardSpotlight key={i} className="h-64 flex flex-col justify-center items-center p-8 bg-zinc-950/[0.8] border-zinc-800">
           <div className="z-20 relative text-center">
                <div className="mb-4 flex justify-center">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{feature.description}</p>
           </div>
        </CardSpotlight>
      ))}
    </div>
  );
}
