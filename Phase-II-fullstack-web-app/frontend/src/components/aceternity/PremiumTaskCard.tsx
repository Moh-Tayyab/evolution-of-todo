// @spec: specs/003-modern-ui-ux/spec.md
// @spec: specs/003-modern-ui-ux/plan.md
// Premium Task Card using 3D Card effect from Aceternity UI

"use client";

import React from "react";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { Badge } from "@/components/ui/badge";
import { TagChip } from "@/components/tasks/TagChip";
import { Task } from "@/types";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Clock, Trash2, Edit2 } from "lucide-react";
import { motion } from "framer-motion";

interface PremiumTaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function PremiumTaskCard({ task, onToggle, onEdit, onDelete }: PremiumTaskCardProps) {
  const priorityColors = {
    high: "bg-red-100 text-red-700 border-red-200",
    medium: "bg-amber-100 text-amber-700 border-amber-200",
    low: "bg-zinc-100 text-zinc-700 border-zinc-200",
  };

  return (
    <CardContainer className="inter-var w-full">
      <CardBody className={cn(
        "bg-white relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-auto rounded-2xl p-6 border",
        task.completed ? "opacity-75" : ""
      )}>
        <CardItem
          translateZ="50"
          className="flex items-start justify-between w-full"
        >
          <div className="flex items-start gap-3">
             <button
                onClick={() => onToggle(task.id)}
                className="mt-1 transition-transform hover:scale-110 active:scale-95"
              >
                {task.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="h-5 w-5 text-zinc-300" />
                )}
              </button>
              <h3 className={cn(
                "text-lg font-bold text-zinc-800 dark:text-white",
                task.completed ? "line-through text-zinc-400" : ""
              )}>
                {task.title}
              </h3>
          </div>
          <Badge className={cn("text-[10px] uppercase", priorityColors[task.priority])}>
            {task.priority}
          </Badge>
        </CardItem>

        <CardItem
          as="p"
          translateZ="60"
          className={cn(
            "text-zinc-500 text-sm max-w-sm mt-2 dark:text-neutral-300",
            task.completed ? "text-zinc-400" : ""
          )}
        >
          {task.description || "No description provided."}
        </CardItem>

        {task.tags.length > 0 && (
          <CardItem translateZ="70" className="flex flex-wrap gap-2 mt-4">
            {task.tags.map((tag) => (
              <TagChip key={tag.id} tag={tag} />
            ))}
          </CardItem>
        )}

        <div className="flex justify-between items-center mt-8">
          <CardItem
            translateZ={20}
            className="text-xs font-normal text-zinc-400 flex items-center gap-1"
          >
            <Clock className="h-3 w-3" />
            {new Date(task.created_at).toLocaleDateString()}
          </CardItem>
          <div className="flex gap-2">
            <CardItem
                translateZ={20}
                as="button"
                onClick={() => onEdit(task)}
                className="p-2 rounded-full hover:bg-zinc-100 transition-colors text-zinc-400 hover:text-primary-500"
            >
                <Edit2 className="h-4 w-4" />
            </CardItem>
            <CardItem
                translateZ={20}
                as="button"
                onClick={() => onDelete(task)}
                className="p-2 rounded-full hover:bg-zinc-100 transition-colors text-zinc-400 hover:text-error"
            >
                <Trash2 className="h-4 w-4" />
            </CardItem>
          </div>
        </div>
      </CardBody>
    </CardContainer>
  );
}
