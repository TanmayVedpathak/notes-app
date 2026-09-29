import type { RefObject } from "react";

import type { TopicQuestion } from "@/types";

import QuestionItem from "./QuestionItem";

type QuestionListProps = {
  questions: TopicQuestion[];
  isSearching: boolean;
  containerRef: RefObject<HTMLDivElement | null>;
  title: string;
};

export default function QuestionList({ questions, isSearching, containerRef, title }: QuestionListProps) {
  return (
    <div ref={containerRef} className="reader-content" tabIndex={0} aria-label="Reading area">
      <div className="reading-column">
        <header className="reader-intro">
          <p className="reader-eyebrow">YOUR STUDY NOTES</p>
          <h1>{title}</h1>
          <p role="status">{questions.length} {isSearching ? "matching questions" : "questions to explore"} <span aria-hidden="true">·</span> One concept at a time.</p>
        </header>
        {questions.length === 0 ? (
          <div className="flex min-h-[60vh] flex-col items-center justify-center text-gray-500">
            <p className="text-lg font-semibold">{isSearching ? "No results found" : "No questions available"}</p>
            {isSearching ? <p className="mt-1 text-sm">Try different keywords.</p> : null}
          </div>
        ) : (
          <div className="question-stack">
            {questions.map((question, index) => {
              const previousQuestion = questions[index - 1];
              const showSubtopic = !isSearching && Boolean(question.subTopic) && (index === 0 || previousQuestion?.subTopic !== question.subTopic);

              return <QuestionItem key={question.id} question={question} index={index} showSubtopic={showSubtopic} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
