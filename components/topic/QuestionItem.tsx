import { createSubtopicId } from "@/lib/utils";

import type { TopicQuestion } from "@/types";

import AnswerRenderer from "./AnswerRenderer";

type QuestionItemProps = {
  question: TopicQuestion;
  index: number;
  showSubtopic: boolean;
};

export default function QuestionItem({ question, index, showSubtopic }: QuestionItemProps) {
  return (
    <>
      {showSubtopic && question.subTopic ? (
        <h2 id={createSubtopicId(question.subTopic)} data-subtopic={question.subTopic} className="scroll-mt-4 border-l-4 border-indigo-500 pl-4 text-2xl font-bold text-gray-900 dark:text-white">
          {question.subTopic}
        </h2>
      ) : null}

      <article className="rounded-xl border border-gray-200 bg-gray-100 p-5 shadow-sm dark:border-gray-700 dark:bg-slate-900">
        <header className="mb-3 border-b border-gray-200 pb-2 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            <span className="mr-2 text-indigo-600 dark:text-indigo-400">Q.{index + 1}</span>
            {question.question}
          </h3>
        </header>

        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Answer:</p>

        <AnswerRenderer answer={question.answer} />
      </article>
    </>
  );
}
