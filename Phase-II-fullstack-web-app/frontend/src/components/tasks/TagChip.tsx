// @spec: specs/002-fullstack-web-app/spec.md
// Tag chip component for displaying tags on tasks

"use client";

import type { Tag } from "@/types";

interface TagChipProps {
  tag: Tag;
  removable?: boolean;
  onRemove?: (tagId: string) => void;
}

export function TagChip({ tag, removable = false, onRemove }: TagChipProps) {
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove(tag.id);
    }
  };

  const backgroundColor = tag.color ? `${tag.color}20` : "#f3f4f6";
  const borderColor = tag.color ? `${tag.color}40` : "#e5e7eb";
  const textColor = tag.color || "#374151";

  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium border"
      style={{
        backgroundColor,
        color: textColor,
        borderColor,
      }}
    >
      {tag.name}
      {removable && (
        <button
          type="button"
          onClick={handleRemove}
          className="inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-black/10 transition-colors"
          aria-label={`Remove tag ${tag.name}`}
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
      )}
    </span>
  );
}
