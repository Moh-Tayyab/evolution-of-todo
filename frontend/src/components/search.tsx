"use client";

import React from "react";
import { CheckSquare, Filter, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Filter state types
export interface FilterState {
  search: string;
  status: "all" | "active" | "completed";
  priority: "all" | "high" | "medium" | "low";
  tags: string[];
  sortBy: "created_at" | "updated_at" | "title" | "priority" | "due_date";
  sortDirection: "asc" | "desc";
}

export interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableTags?: Array<{ id: string; name: string; color: string; count?: number }>;
  variant?: "inline" | "sidebar";
}

export function FilterPanel({
  filters,
  onFiltersChange,
  availableTags = [],
  variant = "inline"
}: FilterPanelProps) {
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleTag = (tagId: string) => {
    const newTags = filters.tags.includes(tagId)
      ? filters.tags.filter(t => t !== tagId)
      : [...filters.tags, tagId];
    updateFilter("tags", newTags);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: "",
      status: "all",
      priority: "all",
      tags: [],
      sortBy: "created_at",
      sortDirection: "desc",
    });
  };

  const hasActiveFilters =
    filters.status !== "all" ||
    filters.priority !== "all" ||
    filters.tags.length > 0;

  const activeFilterCount =
    (filters.status !== "all" ? 1 : 0) +
    (filters.priority !== "all" ? 1 : 0) +
    filters.tags.length;

  const baseClasses = variant === "inline"
    ? "flex flex-wrap items-center gap-2"
    : "flex flex-col gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700";

  if (variant === "inline") {
    return (
      <div className={baseClasses}>
        {/* Status Filter */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
          {[
            { value: "all", label: "All" },
            { value: "active", label: "Active" },
            { value: "completed", label: "Done" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => updateFilter("status", option.value as FilterState["status"])}
              data-testid={`status-filter-${option.value}`}
              aria-pressed={filters.status === option.value}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                filters.status === option.value
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="relative">
          <select
            data-testid="priority-filter"
            value={filters.priority}
            onChange={(e) => updateFilter("priority", e.target.value as FilterState["priority"])}
            className="appearance-none px-4 py-2 pr-10 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>

        {/* Active Tags */}
        {filters.tags.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
            <span className="text-xs text-indigo-600 dark:text-indigo-400">Tags:</span>
            {filters.tags.map((tagId) => {
              const tag = availableTags.find(t => t.id === tagId);
              return tag ? (
                <Badge
                  key={tagId}
                  variant="secondary"
                  className="gap-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-0"
                >
                  {tag.name}
                  <button
                    onClick={() => toggleTag(tagId)}
                    className="hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ) : null;
            })}
          </div>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            data-testid="clear-filters-button"
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    );
  }

  // Sidebar variant
  return (
    <div className={baseClasses} data-testid="filter-panel">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <h3 className="font-semibold text-slate-900 dark:text-white">Filters</h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Status */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Status</label>
        <div className="flex flex-wrap gap-2">
          {[
            { value: "all", label: "All" },
            { value: "active", label: "Active" },
            { value: "completed", label: "Completed" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => updateFilter("status", option.value as FilterState["status"])}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filters.status === option.value
                  ? "bg-indigo-500 text-white"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Priority */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Priority</label>
        <div className="flex flex-wrap gap-2">
          {[
            { value: "all", label: "All", color: "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400" },
            { value: "high", label: "High", color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" },
            { value: "medium", label: "Medium", color: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" },
            { value: "low", label: "Low", color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => updateFilter("priority", option.value as FilterState["priority"])}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filters.priority === option.value
                  ? option.value === "all"
                    ? "bg-slate-200 dark:bg-slate-600"
                    : option.color
                  : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      {availableTags.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Tags</label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => {
              const isSelected = filters.tags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    isSelected
                      ? "ring-2 ring-offset-1"
                      : "opacity-60 hover:opacity-100"
                  }`}
                  style={{
                    backgroundColor: isSelected ? `${tag.color}30` : `${tag.color}15`,
                    color: tag.color,
                    borderColor: tag.color,
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
                  {tag.name}
                  {isSelected && <X className="w-3 h-3" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
