"use client";

import { type RefObject,useCallback, useEffect, useState } from "react";

import { createSubtopicId } from "@/lib/utils";

type UseTopicScrollOptions = {
  slug: string;
  isSearching: boolean;
  questionCount: number;
  contentRef: RefObject<HTMLDivElement | null>;
  sidebarRef: RefObject<HTMLElement | null>;
};

export function useTopicScroll({ slug, isSearching, questionCount, contentRef, sidebarRef }: UseTopicScrollOptions) {
  const [activeSubtopic, setActiveSubtopic] = useState("");

  useEffect(() => {
    if (isSearching) return;

    const contentContainer = contentRef.current;
    const sidebarContainer = sidebarRef.current;

    if (!contentContainer) return;

    const contentScrollKey = `topic_scroll_${slug}`;
    const sidebarScrollKey = `sub_scroll_${slug}`;

    const updateActiveSubtopic = () => {
      const headings = Array.from(contentContainer.querySelectorAll<HTMLElement>("h2[data-subtopic]"));

      if (!headings.length) return;

      const containerTop = contentContainer.getBoundingClientRect().top;
      let activeHeading = headings[0];

      headings.forEach((heading) => {
        if (heading.getBoundingClientRect().top <= containerTop + 200) {
          activeHeading = heading;
        }
      });

      const nextSubtopic = activeHeading.dataset.subtopic ?? "";

      setActiveSubtopic((currentSubtopic) => (currentSubtopic === nextSubtopic ? currentSubtopic : nextSubtopic));
    };

    const handleContentScroll = () => {
      sessionStorage.setItem(contentScrollKey, String(contentContainer.scrollTop));
      updateActiveSubtopic();
    };

    const handleSidebarScroll = () => {
      if (sidebarContainer) {
        sessionStorage.setItem(sidebarScrollKey, String(sidebarContainer.scrollTop));
      }
    };

    const animationFrame = requestAnimationFrame(() => {
      const savedContentScroll = sessionStorage.getItem(contentScrollKey);
      const savedSidebarScroll = sessionStorage.getItem(sidebarScrollKey);

      if (savedContentScroll !== null) {
        contentContainer.scrollTop = Number(savedContentScroll);
      }

      if (sidebarContainer && savedSidebarScroll !== null) {
        sidebarContainer.scrollTop = Number(savedSidebarScroll);
      }

      updateActiveSubtopic();
    });

    contentContainer.addEventListener("scroll", handleContentScroll, {
      passive: true,
    });
    sidebarContainer?.addEventListener("scroll", handleSidebarScroll, {
      passive: true,
    });

    return () => {
      cancelAnimationFrame(animationFrame);
      contentContainer.removeEventListener("scroll", handleContentScroll);
      sidebarContainer?.removeEventListener("scroll", handleSidebarScroll);
    };
  }, [contentRef, isSearching, questionCount, sidebarRef, slug]);

  const scrollToSubtopic = useCallback(
    (subtopic: string) => {
      const contentContainer = contentRef.current;
      const heading = document.getElementById(createSubtopicId(subtopic));

      if (!contentContainer || !heading) return;

      const containerTop = contentContainer.getBoundingClientRect().top;
      const headingTop = heading.getBoundingClientRect().top;
      const targetScrollTop = contentContainer.scrollTop + headingTop - containerTop - 16;

      setActiveSubtopic(subtopic);
      contentContainer.scrollTo({
        top: targetScrollTop,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      });
    },
    [contentRef],
  );

  return {
    activeSubtopic,
    scrollToSubtopic,
  };
}
