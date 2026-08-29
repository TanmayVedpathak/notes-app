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
    <label className="flex min-w-0 items-center gap-2">
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
        className="max-w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-wait disabled:opacity-70 dark:border-gray-700 dark:bg-slate-900 dark:text-white"
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
