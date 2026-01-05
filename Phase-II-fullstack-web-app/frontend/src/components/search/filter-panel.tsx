"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

/**
 * @spec: Filter Panel Component with Embedded State Management
 * @description: Advanced filtering with multiple criteria and active filter display
 * @feature: FR-012 - Filter tasks by various criteria
 */

export type FilterStatus = "all" | "completed" | "pending";
export type FilterPriority = "all" | "high" | "medium" | "low";
export type SortOption = "created_at" | "due_date" | "priority" | "title";
export type SortDirection = "asc" | "desc";

export interface FilterState {
  status: FilterStatus;
  priority: FilterPriority;
  sortBy: SortOption;
  sortDirection: SortDirection;
  tags: string[];
  dateFrom?: string;
  dateTo?: string;
}

export interface FilterPanelProps {
  availableTags?: Array<{ id: string; name: string; color?: string }>;
  onFilterChange?: (filters: FilterState) => void;
  onClearAll?: () => void;
  className?: string;
  variant?: "default" | "compact" | "inline";
  defaultFilters?: Partial<FilterState>;
}

/**
 * Get count of active filters
 */
function getActiveFilterCount(filters: FilterState): number {
  let count = 0;
  if (filters.status !== "all") count++;
  if (filters.priority !== "all") count++;
  if (filters.tags.length > 0) count++;
  if (filters.dateFrom) count++;
  if (filters.dateTo) count++;
  return count;
}

/**
 * FilterPanel - Intelligent filter panel with embedded state
 *
 * Embedded Intelligence:
 * - Local filter state management
 * - Active filter counting
 * - Clear all filters
 * - Responsive design
 * - Collapsible sections
 * - Animation transitions
 */
export function FilterPanel({
  availableTags = [],
  onFilterChange,
  onClearAll,
  className,
  variant = "default",
  defaultFilters = {},
}: FilterPanelProps) {
  // Local filter state
  const [filters, setFilters] = useState<FilterState>({
    status: defaultFilters.status || "all",
    priority: defaultFilters.priority || "all",
    sortBy: defaultFilters.sortBy || "created_at",
    sortDirection: defaultFilters.sortDirection || "desc",
    tags: defaultFilters.tags || [],
    dateFrom: defaultFilters.dateFrom,
    dateTo: defaultFilters.dateTo,
  });

  const [isExpanded, setIsExpanded] = useState(variant !== "compact");
  const [isTagsExpanded, setIsTagsExpanded] = useState(false);
  const [isDateExpanded, setIsDateExpanded] = useState(false);

  // Update filters and notify parent
  const updateFilters = useCallback(
    (updates: Partial<FilterState>) => {
      const newFilters = { ...filters, ...updates };
      setFilters(newFilters);
      onFilterChange?.(newFilters);
    },
    [filters, onFilterChange]
  );

  // Clear all filters
  const handleClearAll = useCallback(() => {
    const clearedFilters: FilterState = {
      status: "all",
      priority: "all",
      sortBy: "created_at",
      sortDirection: "desc",
      tags: [],
      dateFrom: undefined,
      dateTo: undefined,
    };
    setFilters(clearedFilters);
    onFilterChange?.(clearedFilters);
    onClearAll?.();
  }, [onFilterChange, onClearAll]);

  // Active filter count
  const activeFilterCount = getActiveFilterCount(filters);

  // Active filters display
  const activeFilters = useMemo(() => {
    const items: Array<{ key: string; label: string; onRemove: () => void }> = [];

    if (filters.status !== "all") {
      items.push({
        key: "status",
        label: `Status: ${filters.status}`,
        onRemove: () => updateFilters({ status: "all" }),
      });
    }

    if (filters.priority !== "all") {
      items.push({
        key: "priority",
        label: `Priority: ${filters.priority}`,
        onRemove: () => updateFilters({ priority: "all" }),
      });
    }

    filters.tags.forEach((tagId) => {
      const tag = availableTags.find((t) => t.id === tagId);
      if (tag) {
        items.push({
          key: tagId,
          label: `Tag: ${tag.name}`,
          onRemove: () =>
            updateFilters({ tags: filters.tags.filter((t) => t !== tagId) }),
        });
      }
    });

    return items;
  }, [filters, availableTags, updateFilters]);

  if (variant === "inline") {
    return (
      <div className={cn("flex flex-wrap items-center gap-2", className)}>
        <Select
          value={filters.status}
          onValueChange={(value: FilterStatus) => updateFilters({ status: value })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.priority}
          onValueChange={(value: FilterPriority) =>
            updateFilters({ priority: value })
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        {activeFilters.length > 0 && (
          <Button variant="ghost" size="sm" onClick={handleClearAll}>
            Clear all
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <div className="flex items-center justify-between">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="default" className="ml-1">
                  {activeFilterCount}
                </Badge>
              )}
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </CollapsibleTrigger>

          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClearAll}>
              Clear all
            </Button>
          )}
        </div>

        <CollapsibleContent className="space-y-4 pt-4">
          {/* Active Filters Display */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 bg-coral-50 rounded-lg">
              {activeFilters.map((filter) => (
                <Badge
                  key={filter.key}
                  variant="secondary"
                  className="gap-1 pl-2"
                >
                  {filter.label}
                  <button
                    onClick={filter.onRemove}
                    className="hover:bg-gray-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Filter Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filters.status}
                onValueChange={(value: FilterStatus) =>
                  updateFilters({ status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select
                value={filters.priority}
                onValueChange={(value: FilterPriority) =>
                  updateFilters({ priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort By */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort by</label>
              <Select
                value={`${filters.sortBy}-${filters.sortDirection}`}
                onValueChange={(value) => {
                  const [field, direction] = value.split("-") as [
                    SortOption,
                    SortDirection
                  ];
                  updateFilters({ sortBy: field, sortDirection: direction });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at-desc">Newest first</SelectItem>
                  <SelectItem value="created_at-asc">Oldest first</SelectItem>
                  <SelectItem value="due_date-asc">Due date</SelectItem>
                  <SelectItem value="priority-desc">Priority</SelectItem>
                  <SelectItem value="title-asc">Title A-Z</SelectItem>
                  <SelectItem value="title-desc">Title Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tags Filter */}
            {availableTags.length > 0 && (
              <Collapsible open={isTagsExpanded} onOpenChange={setIsTagsExpanded}>
                <div className="space-y-2">
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      <span>Tags</span>
                      <span className="text-xs text-gray-500">
                        {filters.tags.length > 0
                          ? `${filters.tags.length} selected`
                          : "All"}
                      </span>
                      {isTagsExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 pt-2">
                    {availableTags.map((tag) => (
                      <label
                        key={tag.id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filters.tags.includes(tag.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateFilters({ tags: [...filters.tags, tag.id] });
                            } else {
                              updateFilters({
                                tags: filters.tags.filter((t) => t !== tag.id),
                              });
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tag.color || "#D6675D" }}
                        />
                        <span className="text-sm">{tag.name}</span>
                      </label>
                    ))}
                  </CollapsibleContent>
                </div>
              </Collapsible>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
