// @spec: specs/002-fullstack-web-app/spec.md
// Active filters display component

"use client";

import type { Priority, TagWithCount } from "@/types";

export type TaskStatus = "all" | "completed" | "incomplete";

interface ActiveFilter {
  type: "status" | "priority" | "tag";
  value: string;
  label: string;
}

interface ActiveFiltersProps {
  status: TaskStatus;
  priority: Priority | undefined;
  selectedTags: TagWithCount[];
  onRemove: (type: "status" | "priority" | "tag", value: string) => void;
  onClearAll: () => void;
}

export function ActiveFilters({
  status,
  priority,
  selectedTags,
  onRemove,
  onClearAll,
}: ActiveFiltersProps) {
  const filters: ActiveFilter[] = [];

  if (status !== "all") {
    filters.push({
      type: "status",
      value: status,
      label: status === "completed" ? "Completed" : "Incomplete",
    });
  }

  if (priority !== undefined) {
    filters.push({
      type: "priority",
      value: priority,
      label: priority.charAt(0).toUpperCase() + priority.slice(1),
    });
  }

  selectedTags.forEach((tag) => {
    filters.push({
      type: "tag",
      value: tag.id,
      label: tag.name,
    });
  });

  if (filters.length === 0) {
    return null;
  }

  const getStatusColor = (type: ActiveFilter["type"]) => {
    switch (type) {
      case "status":
        return "bg-primary-100 text-primary-800 border-primary-200";
      case "priority":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "tag":
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-gray-500">Active:</span>
      {filters.map((filter) => (
        <span
          key={`${filter.type}-${filter.value}`}
          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(
            filter.type
          )}`}
        >
          {filter.label}
          <button
            type="button"
            onClick={() => onRemove(filter.type, filter.value)}
            className="inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-black/10 transition-colors"
            aria-label={`Remove ${filter.type} filter: ${filter.label}`}
          >
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="text-sm text-primary-600 hover:text-primary-800 font-medium ml-2"
      >
        Clear all
      </button>
    </div>
  );
}
