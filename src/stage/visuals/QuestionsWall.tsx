import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useFlip } from "../../live/useFlip";
import { Eyebrow } from "./static";

const WALL_SIZE = 6;

export function QuestionsWall() {
  const questions = (useQuery(api.questions.list, {}) ?? []).slice(0, WALL_SIZE);
  const listRef = useFlip<HTMLOListElement>(
    questions.map((question) => `${question._id}:${question.voteCount}`).join(),
  );
  return (
    <div className="v-wall">
      <Eyebrow>Perguntas · mande pelo celular</Eyebrow>
      {questions.length === 0 ? (
        <h2 className="v-wall-empty">Manda a sua. As mais votadas sobem.</h2>
      ) : null}
      <ol ref={listRef} className="wall-list">
        {questions.map((question) => (
          <li key={question._id} data-flip-id={question._id}>
            <span className="wall-votes">
              <span key={question.voteCount} className="vote-count">
                {question.voteCount}
              </span>
            </span>
            <p>
              {question.text}
              {question.authorName ? (
                <span className="question-author"> · {question.authorName}</span>
              ) : null}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
