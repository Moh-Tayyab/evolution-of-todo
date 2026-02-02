'use client';

import { ReactNode } from 'react';

interface GlassPanelProps {
  children: ReactNode;
  gradient?: 'purple-blue' | 'orange-red' | 'green-blue';
  intensity?: 'light' | 'medium' | 'strong';
  rounded?: boolean;
  hoverEffect?: 'glow' | 'scale' | 'none';
}

export function GlassPanel({
  children,
  gradient,
  intensity = 'medium',
  rounded = true,
  hoverEffect = 'none',
}: GlassPanelProps) {
  const gradientClasses = {
    'purple-blue': 'bg-gradient-to-br from-purple-500/20 to-blue-500/20',
    'orange-red': 'bg-gradient-to-br from-orange-500/20 to-red-500/20',
    'green-blue': 'bg-gradient-to-br from-green-500/20 to-blue-500/20',
  };

  const intensityClasses = {
    light: 'backdrop-blur-sm bg-white/5',
    medium: 'backdrop-blur-md bg-white/10',
    strong: 'backdrop-blur-lg bg-white/15',
  };

  const hoverClasses = {
    glow: 'hover:shadow-lg hover:shadow-purple-500/50',
    scale: 'hover:scale-105',
    none: '',
  };

  return (
    <div
      className={`
        border border-white/20
        ${rounded ? 'rounded-2xl' : ''}
        ${gradient ? gradientClasses[gradient] : ''}
        ${intensityClasses[intensity]}
        ${hoverClasses[hoverEffect]}
        transition-all duration-300
      `}
    >
      {children}
    </div>
  );
}
