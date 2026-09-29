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
        <h2 id={createSubtopicId(question.subTopic)} data-subtopic={question.subTopic} className="section-heading">
          {question.subTopic}
        </h2>
      ) : null}

      <article className="question-card">
        <header>
          <span className="question-number">QUESTION {String(index + 1).padStart(2, "0")}</span>
          <h3>
            {question.question}
          </h3>
        </header>

        <p className="answer-label">Answer</p>
        <AnswerRenderer answer={question.answer} />
      </article>
    </>
  );
}
