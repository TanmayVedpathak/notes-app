"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useTopicScroll } from "@/hooks/use-topic-scroll";

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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
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

  const handleClearSearch = useCallback(() => {
    setSearchText("");
    setIsSearchOpen(false);
  }, []);

  const handleSelectSubtopic = useCallback(
    (subtopic: string) => {
      scrollToSubtopic(subtopic);
      setIsSidebarOpen(false);
    },
    [scrollToSubtopic],
  );

  return (
    <section className="relative py-2">
      <div className="mb-4 flex items-center gap-3 px-2">
        <TopicSelector currentSlug={slug} topics={topics} />

        <div className="ml-auto flex min-w-0 flex-1 justify-end">
          <TopicSearch value={searchText} isOpen={isSearchOpen} onChange={setSearchText} onOpen={() => setIsSearchOpen(true)} onClear={handleClearSearch} />
        </div>

        {!isSearching ? (
          <button
            type="button"
            onClick={() => setIsSidebarOpen((isOpen) => !isOpen)}
            aria-label="Toggle subtopic navigation"
            aria-expanded={isSidebarOpen}
            aria-controls="subtopic-sidebar"
            className="cursor-pointer rounded bg-gray-700 p-2 text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 lg:hidden"
          >
            <MenuIcon className="size-5" />
          </button>
        ) : null}
      </div>

      <div className="relative flex">
        {!isSearching ? <SubtopicSidebar questions={questions} activeSubtopic={activeSubtopic} isOpen={isSidebarOpen} containerRef={sidebarRef} onSelect={handleSelectSubtopic} /> : null}

        <QuestionList questions={visibleQuestions} isSearching={isSearching} containerRef={contentRef} />
      </div>
    </section>
  );
}
