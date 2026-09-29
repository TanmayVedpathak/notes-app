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
    <div className="code-block">
      <button type="button" onClick={handleCopy} aria-label={copied ? "Code copied" : "Copy code"} title={copied ? "Copied" : "Copy code"} className="code-copy">
        {copied ? <CheckIcon className="size-5" /> : <CopyIcon className="size-5" />}
      </button>

      <div className="code-label">Code example</div>
      <pre tabIndex={0} aria-label="Code example" className="code-content">
        <code>{code}</code>
      </pre>

      <span className="sr-only" aria-live="polite">
        {copied ? "Code copied to clipboard" : ""}
      </span>
    </div>
  );
}
