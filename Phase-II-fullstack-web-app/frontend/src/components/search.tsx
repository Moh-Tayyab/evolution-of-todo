"use client";

import React from "react";

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

export function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  return (
    <div className="p-4 bg-card border border-border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Filters</h3>
      <p className="text-muted-foreground text-sm">Filter functionality coming soon...</p>
    </div>
  );
}
