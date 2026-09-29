"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useTopicScroll } from "@/hooks/use-topic-scroll";

import { formatSlugTitle } from "@/lib/utils";

import type { TopicOption, TopicQuestion } from "@/types";

import QuestionList from "./QuestionList";
import SubtopicSidebar from "./SubtopicSidebar";
import { MenuIcon } from "./TopicIcons";
import TopicSearch from "./TopicSearch";
import TopicSelector from "./TopicSelector";

type TopicClientProps = {
  slug: string;
  topics: TopicOption[];
  questions: TopicQuestion[];
};

export default function TopicClient({ slug, topics, questions }: TopicClientProps) {
  const [searchText, setSearchText] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const contentRef = useRef<HTMLDivElement | null>(null);
  const sidebarRef = useRef<HTMLElement | null>(null);
  const debouncedSearchText = useDebouncedValue(searchText, 300);
  const normalizedQuery = debouncedSearchText.trim().toLocaleLowerCase();
  const isSearching = normalizedQuery.length > 0;

  const visibleQuestions = useMemo(() => {
    if (!normalizedQuery) return questions;

    return questions.filter((question) => question.searchableText.includes(normalizedQuery));
  }, [normalizedQuery, questions]);

  const { activeSubtopic, scrollToSubtopic } = useTopicScroll({
    slug,
    isSearching,
    questionCount: questions.length,
    contentRef,
    sidebarRef,
  });

  const handleSelectSubtopic = useCallback(
    (subtopic: string) => {
      scrollToSubtopic(subtopic);
      setIsSidebarOpen(false);
      contentRef.current?.focus({ preventScroll: true });
    },
    [scrollToSubtopic],
  );

  return (
    <section className="reader-shell" aria-label="Notes reader">
      <div className="reader-toolbar">
        <TopicSelector currentSlug={slug} topics={topics} />

        <TopicSearch value={searchText} onChange={setSearchText} />

        {!isSearching ? (
          <button
            type="button"
            onClick={() => setIsSidebarOpen((isOpen) => !isOpen)}
            aria-label="Toggle subtopic navigation"
            aria-expanded={isSidebarOpen}
            aria-controls="subtopic-sidebar"
            className="reader-button sections-toggle"
          >
            <MenuIcon className="size-5" />
            Sections
          </button>
        ) : null}
      </div>

      <div className="reader-layout">
        {!isSearching ? <SubtopicSidebar questions={questions} activeSubtopic={activeSubtopic} isOpen={isSidebarOpen} containerRef={sidebarRef} onSelect={handleSelectSubtopic} /> : null}

        <QuestionList questions={visibleQuestions} isSearching={isSearching} containerRef={contentRef} title={topics.find((topic) => topic.slug === slug)?.title ?? formatSlugTitle(slug)} />
      </div>
    </section>
  );
}
