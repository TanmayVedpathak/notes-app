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
      className={`reader-sidebar ${isOpen ? "is-open" : ""}`}
    >
      <p className="sidebar-heading">CONTENTS <span>{subtopics.length} sections</span></p>
      <nav aria-label="Note sections">
        {subtopics.map((subtopic, index) => {
          const isActive = activeSubtopic === subtopic;

          return (
            <button
              key={subtopic}
              type="button"
              onClick={() => onSelect(subtopic)}
              aria-current={isActive ? "location" : undefined}
              className={`section-link ${isActive ? "is-active" : ""}`}
            >
              <span className="section-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <span>{subtopic}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
