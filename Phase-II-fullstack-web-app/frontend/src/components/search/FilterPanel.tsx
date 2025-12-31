// @spec: specs/002-fullstack-web-app/spec.md
// Filter panel component for status, priority, and tag filtering

"use client";

import { useState } from "react";
import type { Priority, TagWithCount } from "@/types";
import { TagChip } from "@/components/tasks/TagChip";

export type TaskStatus = "all" | "completed" | "incomplete";

interface FilterPanelProps {
  status: TaskStatus;
  priority: Priority | undefined;
  selectedTagIds: string[];
  availableTags: TagWithCount[];
  onStatusChange: (status: TaskStatus) => void;
  onPriorityChange: (priority: Priority | undefined) => void;
  onTagToggle: (tagId: string) => void;
  onClearAll: () => void;
}

export function FilterPanel({
  status,
  priority,
  selectedTagIds,
  availableTags,
  onStatusChange,
  onPriorityChange,
  onTagToggle,
  onClearAll,
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFilters =
    status !== "all" || priority !== undefined || selectedTagIds.length > 0;

  return (
    <div className="space-y-4">
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
          hasActiveFilters
            ? "border-primary-300 bg-primary-50 text-primary-700"
            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        }`}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        <span className="font-medium">Filters</span>
        {hasActiveFilters && (
          <span className="ml-1 px-2 py-0.5 text-xs font-bold bg-primary-600 text-white rounded-full">
            {[
              status !== "all" ? 1 : 0,
              priority !== undefined ? 1 : 0,
              selectedTagIds.length,
            ].reduce((a, b) => a + b, 0)}
          </span>
        )}
        <svg
          className={`w-4 h-4 ml-auto transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Expanded filter options */}
      {isExpanded && (
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm space-y-4">
          {/* Status filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="flex gap-2">
              {(["all", "incomplete", "completed"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onStatusChange(s)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${
                    status === s
                      ? "bg-primary-600 text-white border-primary-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {s === "all"
                    ? "All"
                    : s === "incomplete"
                    ? "Incomplete"
                    : "Completed"}
                </button>
              ))}
            </div>
          </div>

          {/* Priority filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => onPriorityChange(undefined)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${
                  priority === undefined
                    ? "bg-gray-800 text-white border-gray-800"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Any
              </button>
              {(["high", "medium", "low"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPriorityChange(p)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md border capitalize transition-colors ${
                    priority === p
                      ? p === "high"
                        ? "bg-red-600 text-white border-red-600"
                        : p === "medium"
                        ? "bg-orange-500 text-white border-orange-500"
                        : "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Tag filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => onTagToggle(tag.id)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
                    selectedTagIds.includes(tag.id)
                      ? "bg-primary-600 text-white border-primary-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {tag.name}
                </button>
              ))}
              {availableTags.length === 0 && (
                <p className="text-sm text-gray-500">
                  No tags available. Create tags when adding tasks.
                </p>
              )}
            </div>
          </div>

          {/* Clear all button */}
          {hasActiveFilters && (
            <div className="pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={onClearAll}
                className="text-sm text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1"
              >
                <svg
                  className="w-4 h-4"
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
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
