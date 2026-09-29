"use client";

import { CloseIcon, SearchIcon } from "./TopicIcons";

type TopicSearchProps = { value: string; onChange: (value: string) => void; };

export default function TopicSearch({ value, onChange }: TopicSearchProps) {
  return (
    <div className="reader-search">
      <SearchIcon className="size-4 shrink-0" />
      <label htmlFor="topic-search" className="sr-only">Search questions and answers</label>
      <input id="topic-search" type="search" placeholder="Search in these notes..." value={value} onChange={(event) => onChange(event.target.value)} onKeyDown={(event) => { if (event.key === "Escape") onChange(""); }} />
      {value ? <button type="button" onClick={() => onChange("")} aria-label="Clear search"><CloseIcon className="size-4" /></button> : null}
    </div>
  );
}
