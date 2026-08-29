"use client";

import { type RefObject,useMemo } from "react";

import type { TopicQuestion } from "@/types";

type SubtopicSidebarProps = {
  questions: TopicQuestion[];
  activeSubtopic: string;
  isOpen: boolean;
  containerRef: RefObject<HTMLElement | null>;
  onSelect: (subtopic: string) => void;
};

export default function SubtopicSidebar({ questions, activeSubtopic, isOpen, containerRef, onSelect }: SubtopicSidebarProps) {
  const subtopics = useMemo(() => {
    const uniqueSubtopics = new Set<string>();

    questions.forEach((question) => {
      if (question.subTopic) {
        uniqueSubtopics.add(question.subTopic);
      }
    });

    return Array.from(uniqueSubtopics);
  }, [questions]);

  return (
    <aside
      id="subtopic-sidebar"
      ref={containerRef}
      aria-label="Subtopics"
      className={`absolute top-0 z-20 h-[calc(100vh-145px)] w-[90%] max-w-sm overflow-auto border-r border-gray-200 bg-gray-100 p-5 shadow-sm transition-[left] duration-300 ease-in-out dark:border-gray-700 dark:bg-slate-900 lg:sticky lg:left-0 lg:w-[20%] lg:max-w-none ${isOpen ? "left-0" : "-left-full"}`}
    >
      <nav className="space-y-1">
        {subtopics.map((subtopic) => {
          const isActive = activeSubtopic === subtopic;

          return (
            <button
              key={subtopic}
              type="button"
              onClick={() => onSelect(subtopic)}
              aria-current={isActive ? "location" : undefined}
              className={`w-full cursor-pointer rounded-md px-3 py-2 text-left text-sm transition ${isActive ? "bg-indigo-100 font-semibold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300" : "text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-slate-800"}`}
            >
              {subtopic}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
