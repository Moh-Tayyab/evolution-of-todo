"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * @spec: Smart Table Component with Embedded Intelligence
 * @description: Reusable data table with sorting, filtering, and pagination
 */

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  className?: string;
}

export interface SmartTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
  className?: string;
  emptyMessage?: string;
  onRowClick?: (row: T, index: number) => void;
  rowClassName?: (row: T, index: number) => string | undefined;
  enablePagination?: boolean;
  enableSearch?: boolean;
  enableFilter?: boolean;
}

type SortDirection = "asc" | "desc" | null;

/**
 * SmartTable - Intelligent data table with embedded sorting, filtering, and pagination
 *
 * Embedded Intelligence:
 * - Client-side sorting
 * - Client-side filtering
 * - Client-side search
 * - Pagination
 * - Responsive design
 * - Empty state handling
 * - Framer Motion animations
 */
export function SmartTable<T extends Record<string, any>>({
  data,
  columns,
  pageSize = 10,
  className,
  emptyMessage = "No data available",
  onRowClick,
  rowClassName,
  enablePagination = true,
  enableSearch = true,
  enableFilter = true,
}: SmartTableProps<T>) {
  // Local state
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: SortDirection;
  }>({ key: "", direction: null });
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  // Filtered and sorted data
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (searchQuery) {
      result = result.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter((row) =>
          String(row[key])
            .toLowerCase()
            .includes(String(value).toLowerCase())
        );
      }
    });

    // Apply sorting
    if (sortConfig.key && sortConfig.direction) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === bValue) return 0;

        const comparison = aValue > bValue ? 1 : -1;
        return sortConfig.direction === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [data, searchQuery, filters, sortConfig]);

  // Paginated data
  const paginatedData = useMemo(() => {
    if (!enablePagination) return processedData;

    const start = currentPage * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize, enablePagination]);

  // Pagination info
  const totalPages = Math.ceil(processedData.length / pageSize);
  const startIndex = currentPage * pageSize;
  const endIndex = Math.min(startIndex + pageSize, processedData.length);

  // Handle sort
  const handleSort = useCallback(
    (key: string) => {
      setSortConfig((prev) => {
        if (prev.key === key) {
          // Toggle direction
          if (prev.direction === "asc") {
            return { key, direction: "desc" };
          } else if (prev.direction === "desc") {
            return { key: "", direction: null };
          }
        }
        return { key, direction: "asc" };
      });
      setCurrentPage(0);
    },
    []
  );

  // Handle filter change
  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(0);
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchQuery("");
    setCurrentPage(0);
  }, []);

  // Render sort icon
  const renderSortIcon = (column: Column<T>) => {
    if (!column.sortable) return null;

    if (sortConfig.key !== column.key) {
      return <ChevronsUpDown className="w-4 h-4 text-gray-400" />;
    }

    if (sortConfig.direction === "asc") {
      return <ChevronUp className="w-4 h-4 text-coral-600" />;
    }

    if (sortConfig.direction === "desc") {
      return <ChevronDown className="w-4 h-4 text-coral-600" />;
    }

    return null;
  };

  const hasActiveFilters = searchQuery || Object.values(filters).some(Boolean);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Filters */}
      {(enableSearch || enableFilter) && (
        <div className="space-y-3">
          {/* Search */}
          {enableSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {/* Column Filters */}
          {enableFilter && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {columns
                .filter((col) => col.filterable)
                .map((column) => (
                  <Input
                    key={String(column.key)}
                    type="search"
                    placeholder={`Filter by ${column.label}`}
                    value={filters[String(column.key)] || ""}
                    onChange={(e) =>
                      handleFilterChange(String(column.key), e.target.value)
                    }
                    className="h-9"
                  />
                ))}
            </div>
          )}

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear all filters
            </Button>
          )}
        </div>
      )}

      {/* Results Info */}
      {hasActiveFilters && (
        <p className="text-sm text-gray-500">
          Showing {endIndex - startIndex} of {processedData.length} results
          {processedData.length !== data.length && ` (from ${data.length} total)`}
        </p>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    "px-4 py-3 text-left text-sm font-semibold text-gray-700",
                    column.sortable && "cursor-pointer hover:bg-gray-100 transition-colors",
                    column.className
                  )}
                  onClick={() => column.sortable && handleSort(String(column.key))}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {renderSortIcon(column)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <AnimatePresence mode="popLayout">
              {paginatedData.length === 0 ? (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    {emptyMessage}
                  </td>
                </motion.tr>
              ) : (
                paginatedData.map((row, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => onRowClick?.(row, index)}
                    className={cn(
                      "transition-colors hover:bg-gray-50",
                      onRowClick && "cursor-pointer",
                      rowClassName?.(row, index)
                    )}
                  >
                    {columns.map((column) => (
                      <td
                        key={String(column.key)}
                        className={cn("px-4 py-3 text-sm", column.className)}
                      >
                        {column.render
                          ? column.render(row[column.key as keyof T], row, index)
                          : String(row[column.key as keyof T] ?? "")}
                      </td>
                    ))}
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {enablePagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Page {currentPage + 1} of {totalPages}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <Select
              value={String(currentPage + 1)}
              onValueChange={(value) => setCurrentPage(parseInt(value) - 1)}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: totalPages }, (_, i) => (
                  <SelectItem key={i} value={String(i + 1)}>
                    Page {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
              }
              disabled={currentPage === totalPages - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
