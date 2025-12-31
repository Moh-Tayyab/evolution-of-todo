// @spec: specs/002-fullstack-web-app/spec.md
// Tag input component with autocomplete for adding/removing tags

"use client";

import { useState, useRef, useEffect } from "react";
import type { Tag, TagWithCount } from "@/types";
import { TagChip } from "./TagChip";

interface NewTagOption {
  id: "__new__";
  name: string;
  isNew: true;
}

type SuggestionItem = TagWithCount | NewTagOption;

interface TagInputProps {
  selectedTags: Tag[];
  availableTags: TagWithCount[];
  onAddTag: (tag: Tag) => void;
  onRemoveTag: (tagId: string) => void;
  onCreateTag?: (name: string) => void;
  error?: string;
}

export function TagInput({
  selectedTags,
  availableTags,
  onAddTag,
  onRemoveTag,
  onCreateTag,
  error,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Filter available tags to show only unselected tags
  const unselectedTags = availableTags.filter(
    (tag) => !selectedTags.some((t) => t.id === tag.id)
  );

  // Filter suggestions based on input
  const suggestions: SuggestionItem[] = inputValue.trim()
    ? [
        // Show matching existing tags first
        ...unselectedTags.filter((tag) =>
          tag.name.toLowerCase().includes(inputValue.toLowerCase())
        ),
        // Show "Create new tag" option if allowed
        ...(onCreateTag && inputValue.length > 0
          ? [{ id: "__new__", name: inputValue, isNew: true } as const]
          : []),
      ]
    : unselectedTags;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && e.key !== "Escape") {
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          Math.min(prev + 1, suggestions.length - 1)
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (suggestions[selectedIndex]) {
          selectTag(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const selectTag = (tag: SuggestionItem) => {
    if ("isNew" in tag && tag.isNew) {
      if (onCreateTag) {
        onCreateTag(tag.name);
      }
    } else {
      onAddTag(tag as Tag);
    }
    setInputValue("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Tags
      </label>

      {/* Selected tags display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          {selectedTags.map((tag) => (
            <TagChip
              key={tag.id}
              tag={tag}
              removable
              onRemove={onRemoveTag}
            />
          ))}
        </div>
      )}

      {/* Input field */}
      <div ref={wrapperRef} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
            setSelectedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Type to search or create tags..."
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            error ? "border-red-300 focus:ring-red-500" : "border-gray-300"
          }`}
          autoComplete="off"
        />

        {/* Autocomplete dropdown */}
        {isOpen && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
            {suggestions.map((tag, index) => {
              const isNew = "isNew" in tag && tag.isNew;
              return (
                <button
                  key={tag.id}
                  type="button"
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-primary-50 focus:bg-primary-50 transition-colors ${
                    index === selectedIndex ? "bg-primary-50" : ""
                  }`}
                  onClick={() => selectTag(tag)}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {isNew && (
                        <svg
                          className="w-4 h-4 text-primary-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      )}
                      <span>{tag.name}</span>
                    </span>
                    {!isNew && "task_count" in tag && (
                      <span className="text-xs text-gray-400">
                        {tag.task_count} tasks
                      </span>
                    )}
                    {isNew && (
                      <span className="text-xs text-primary-600 font-medium">
                        Create new
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Empty state for dropdown */}
        {isOpen && inputValue.trim() && suggestions.length === 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4 text-center text-sm text-gray-500">
            No matching tags found
            {onCreateTag && (
              <p className="mt-1 text-primary-600">
                Press Enter to create &ldquo;{inputValue}&rdquo;
              </p>
            )}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Available tags quick select */}
      {unselectedTags.length > 0 && !inputValue && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-500 py-1">Quick add:</span>
          {unselectedTags.slice(0, 5).map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => onAddTag(tag)}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              {tag.name}
            </button>
          ))}
          {unselectedTags.length > 5 && (
            <span className="text-xs text-gray-400 py-1">
              +{unselectedTags.length - 5} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}
