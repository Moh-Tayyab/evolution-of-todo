'use client';

import { ReactNode } from 'react';

interface InfoCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  children?: ReactNode;
  hoverEffect?: 'lift' | 'glow' | 'none';
}

export function InfoCard({
  title,
  description,
  icon,
  children,
  hoverEffect = 'lift',
}: InfoCardProps) {
  const hoverClasses = {
    lift: 'hover:-translate-y-1',
    glow: 'hover:shadow-lg hover:shadow-purple-500/30',
    none: '',
  };

  return (
    <div
      className={`
        p-6 rounded-xl bg-white/10
        backdrop-blur-md border border-white/20
        transition-all duration-300
        ${hoverClasses[hoverEffect]}
      `}
    >
      {icon && (
        <div className="mb-3 text-purple-500">{icon}</div>
      )}
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      {description && (
        <p className="text-gray-300 mb-4">{description}</p>
      )}
      {children}
    </div>
  );
}
