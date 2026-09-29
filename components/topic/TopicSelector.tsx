"use client";

import { type ChangeEvent,useTransition } from "react";

import { useRouter } from "next/navigation";

import { formatSlugTitle } from "@/lib/utils";

import type { TopicOption } from "@/types";

type TopicSelectorProps = {
  currentSlug: string;
  topics: TopicOption[];
};

export default function TopicSelector({ currentSlug, topics }: TopicSelectorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const hasCurrentTopic = topics.some((topic) => topic.slug === currentSlug);

  return (
    <label className="reader-topic">
      <span className="sr-only">Select topic</span>
      <select
        value={currentSlug}
        disabled={isPending}
        aria-label="Select topic"
        onChange={(event: ChangeEvent<HTMLSelectElement>) => {
          const nextSlug = event.target.value;

          startTransition(() => {
            router.push(`/topic/${encodeURIComponent(nextSlug)}`);
          });
        }}
        className="topic-select"
      >
        {!hasCurrentTopic ? <option value={currentSlug}>{formatSlugTitle(currentSlug)}</option> : null}

        {topics.map((topic) => (
          <option key={topic.slug} value={topic.slug}>
            {topic.title}
          </option>
        ))}
      </select>
    </label>
  );
}
