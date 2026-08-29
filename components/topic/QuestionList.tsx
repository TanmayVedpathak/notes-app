import type { RefObject } from "react";

import type { TopicQuestion } from "@/types";

import QuestionItem from "./QuestionItem";

type QuestionListProps = {
  questions: TopicQuestion[];
  isSearching: boolean;
  containerRef: RefObject<HTMLDivElement | null>;
};

export default function QuestionList({ questions, isSearching, containerRef }: QuestionListProps) {
  return (
    <div ref={containerRef} className={`h-[calc(100vh-145px)] overflow-auto px-2 ${isSearching ? "w-full" : "w-full lg:w-[80%]"}`}>
      {questions.length === 0 ? (
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-gray-500">
          <p className="text-lg font-semibold">{isSearching ? "No results found" : "No questions available"}</p>
          {isSearching ? <p className="mt-1 text-sm">Try different keywords.</p> : null}
        </div>
      ) : (
        <div className="flex flex-col gap-6 pb-6">
          {questions.map((question, index) => {
            const previousQuestion = questions[index - 1];
            const showSubtopic = !isSearching && Boolean(question.subTopic) && (index === 0 || previousQuestion?.subTopic !== question.subTopic);

            return <QuestionItem key={question.id} question={question} index={index} showSubtopic={showSubtopic} />;
          })}
        </div>
      )}
    </div>
  );
}
