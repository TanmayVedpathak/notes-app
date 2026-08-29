"use client";

import { type ChangeEvent, type KeyboardEvent,useEffect, useRef } from "react";

import { CloseIcon, SearchIcon } from "./TopicIcons";

type TopicSearchProps = {
  value: string;
  isOpen: boolean;
  onChange: (value: string) => void;
  onOpen: () => void;
  onClear: () => void;
};

export default function TopicSearch({ value, isOpen, onChange, onOpen, onClear }: TopicSearchProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) {
    return (
      <button type="button" onClick={onOpen} aria-label="Open question search" className="cursor-pointer rounded-full bg-gray-700 p-2 text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
        <SearchIcon className="size-4" />
      </button>
    );
  }

  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <label htmlFor="topic-search" className="sr-only">
        Search questions
      </label>

      <input
        ref={inputRef}
        id="topic-search"
        type="search"
        placeholder="Search questions..."
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
        onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
          if (event.key === "Escape") {
            onClear();
          }
        }}
        className="min-w-0 flex-1 rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-slate-900 dark:text-gray-100"
      />

      <button type="button" onClick={onClear} aria-label="Clear and close search" className="cursor-pointer rounded-md bg-gray-300 p-2 text-gray-800 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
        <CloseIcon className="size-5" />
      </button>
    </div>
  );
}
