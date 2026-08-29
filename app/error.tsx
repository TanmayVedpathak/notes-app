"use client";

import { useEffect } from "react";

type TopicErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function TopicError({ error, reset }: TopicErrorProps) {
  useEffect(() => {
    console.error("Unable to load topic page", error);
  }, [error]);

  return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
        Unable to load this topic
      </h2>
      <p className="max-w-lg text-gray-600 dark:text-gray-300">
        The topic API could not be reached. Check your API URL and try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="cursor-pointer rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Try again
      </button>
    </div>
  );
}
