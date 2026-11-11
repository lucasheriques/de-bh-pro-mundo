import { useMutation, useQuery } from "convex/react";
import { useMemo } from "react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { clientId } from "../live/env";
import { useFlip } from "../live/useFlip";

function useToggleVote() {
  const rawToggle = useMutation(api.questions.toggleVote);
  return useMemo(
    () =>
      rawToggle.withOptimisticUpdate((store, { questionId }) => {
        const voted = store.getQuery(api.questions.myVotes, { clientId }) ?? [];
        const had = voted.includes(questionId);
        store.setQuery(
          api.questions.myVotes,
          { clientId },
          had ? voted.filter((id) => id !== questionId) : [...voted, questionId],
        );
        const list = store.getQuery(api.questions.list, { clientId });
        if (!list) return;
        const updated = list.map((question) =>
          question._id === questionId
            ? { ...question, voteCount: question.voteCount + (had ? -1 : 1) }
            : question,
        );
        store.setQuery(
          api.questions.list,
          { clientId },
          updated.sort((a, b) => b.voteCount - a.voteCount),
        );
      }),
    [rawToggle],
  );
}

function UpvoteButton({
  questionId,
  voteCount,
  voted,
}: {
  questionId: Id<"questions">;
  voteCount: number;
  voted: boolean;
}) {
  const toggle = useToggleVote();
  return (
    <button
      type="button"
      className={`upvote ${voted ? "is-voted" : ""}`}
      aria-pressed={voted}
      aria-label={voted ? "Tirar voto" : "Votar nessa pergunta"}
      onClick={() => void toggle({ clientId, questionId }).catch(() => undefined)}
    >
      <svg viewBox="0 0 256 256" aria-hidden="true">
        <polyline
          points="48 160 128 80 208 160"
          fill="none"
          stroke="currentColor"
          strokeWidth="24"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span key={voteCount} className="mono vote-count">
        {voteCount}
      </span>
    </button>
  );
}

function DeleteButton({ questionId }: { questionId: Id<"questions"> }) {
  const remove = useMutation(api.questions.remove);
  return (
    <button
      type="button"
      className="question-delete"
      aria-label="Apagar minha pergunta"
      onClick={() => {
        if (window.confirm("Apagar sua pergunta?")) {
          void remove({ clientId, questionId }).catch(() => undefined);
        }
      }}
    >
      Apagar
    </button>
  );
}

export function QuestionList({ limit }: { limit?: number }) {
  const all = useQuery(api.questions.list, { clientId }) ?? [];
  const questions = limit ? all.slice(0, limit) : all;
  const myVotes = new Set(useQuery(api.questions.myVotes, { clientId }) ?? []);
  const listRef = useFlip<HTMLOListElement>(
    questions.map((question) => `${question._id}:${question.voteCount}`).join(),
  );

  if (questions.length === 0) {
    return <p className="panel-note muted">Nenhuma pergunta ainda. Seja a primeira pessoa.</p>;
  }
  return (
    <ol ref={listRef} className="question-list">
      {questions.map((question) => (
        <li key={question._id} data-flip-id={question._id}>
          <p>
            {question.text}
            {question.authorName ? (
              <span className="question-author"> · {question.authorName}</span>
            ) : null}
            {question.mine ? <DeleteButton questionId={question._id} /> : null}
          </p>
          <UpvoteButton
            questionId={question._id}
            voteCount={question.voteCount}
            voted={myVotes.has(question._id)}
          />
        </li>
      ))}
    </ol>
  );
}
