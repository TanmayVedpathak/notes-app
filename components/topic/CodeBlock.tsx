"use client";

import { useEffect, useRef, useState } from "react";

import { CheckIcon, CopyIcon } from "./TopicIcons";

type CodeBlockProps = {
  code: string;
};

export default function CodeBlock({ code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);

      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }

      resetTimerRef.current = setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error("Copy failed", error);
    }
  };

  return (
    <div className="relative rounded-lg border border-gray-200 bg-gray-900 px-3 py-4 text-sm dark:border-gray-700">
      <button type="button" onClick={handleCopy} aria-label={copied ? "Code copied" : "Copy code"} title={copied ? "Copied" : "Copy code"} className="absolute right-2 top-3 cursor-pointer rounded bg-gray-700 p-1.5 text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-400">
        {copied ? <CheckIcon className="size-5" /> : <CopyIcon className="size-5" />}
      </button>

      <pre className="mr-9 overflow-x-auto text-gray-100">
        <code>{code}</code>
      </pre>

      <span className="sr-only" aria-live="polite">
        {copied ? "Code copied to clipboard" : ""}
      </span>
    </div>
  );
}
