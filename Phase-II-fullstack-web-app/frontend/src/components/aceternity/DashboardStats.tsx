// @spec: specs/003-modern-ui-ux/spec.md
// @spec: specs/003-modern-ui-ux/plan.md
// Statistics dashboard using BentoGrid from Aceternity UI

"use client";

import React from "react";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import {
  BarChart3,
  CheckCircle2,
  Clock,
  ListTodo,
  TrendingUp,
  Tags
} from "lucide-react";
import { motion } from "framer-motion";

interface StatsProps {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  tagCount: number;
}

export function DashboardStats({ totalTasks, completedTasks, pendingTasks, tagCount }: StatsProps) {
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const items = [
    {
      title: "Task Completion",
      description: "You've finished " + completionRate + "% of your tasks. Keep going!",
      header: <SkeletonOne rate={completionRate} />,
      icon: <TrendingUp className="h-4 w-4 text-neutral-500" />,
      className: "md:col-span-2",
    },
    {
      title: "Active Tasks",
      description: "Current tasks needing attention.",
      header: <SkeletonTwo count={pendingTasks} />,
      icon: <Clock className="h-4 w-4 text-neutral-500" />,
      className: "md:col-span-1",
    },
    {
       title: "Organization",
       description: "Managing tasks across " + tagCount + " unique tags.",
       header: <SkeletonThree count={tagCount} />,
       icon: <Tags className="h-4 w-4 text-neutral-500" />,
       className: "md:col-span-1",
    },
    {
      title: "Total Progress",
      description: "Overview of your entire productivity journey.",
      header: <SkeletonFour completed={completedTasks} total={totalTasks} />,
      icon: <BarChart3 className="h-4 w-4 text-neutral-500" />,
      className: "md:col-span-2",
    },
  ];

  return (
    <BentoGrid className="max-w-7xl mx-auto py-10">
      {items.map((item, i) => (
        <BentoGridItem
          key={i}
          title={item.title}
          description={item.description}
          header={item.header}
          icon={item.icon}
          className={item.className}
        />
      ))}
    </BentoGrid>
  );
}

const SkeletonOne = ({ rate }: { rate: number }) => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-4 border border-blue-200/50">
    <div className="flex flex-col justify-end w-full">
        <div className="text-4xl font-bold text-blue-600 mb-2">{rate}%</div>
        <div className="w-full bg-blue-200 rounded-full h-2">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${rate}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-blue-600 h-2 rounded-full"
            />
        </div>
    </div>
  </div>
);

const SkeletonTwo = ({ count }: { count: number }) => (
    <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 p-4 border border-amber-200/50">
        <div className="flex items-center justify-center w-full h-full">
            <div className="text-5xl font-bold text-amber-600">{count}</div>
        </div>
    </div>
);

const SkeletonThree = ({ count }: { count: number }) => (
    <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 p-4 border border-purple-200/50">
        <div className="flex items-center justify-center w-full h-full">
            <div className="text-5xl font-bold text-purple-600">{count}</div>
        </div>
    </div>
);

const SkeletonFour = ({ completed, total }: { completed: number, total: number }) => (
    <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-green-50 to-green-100 p-4 border border-green-200/50 flex-row gap-4">
        <div className="flex-1 flex flex-col justify-center items-center">
            <div className="text-xs text-green-600 font-semibold uppercase tracking-wider mb-1">Completed</div>
            <div className="text-3xl font-bold text-green-700">{completed}</div>
        </div>
        <div className="w-px h-full bg-green-200" />
        <div className="flex-1 flex flex-col justify-center items-center">
            <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-1">Total</div>
            <div className="text-3xl font-bold text-zinc-700">{total}</div>
        </div>
    </div>
);
