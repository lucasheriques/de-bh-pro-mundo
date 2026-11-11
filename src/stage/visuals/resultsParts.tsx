import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useSession } from "../../live/useDeck";
import { CountUp } from "./CountUp";
import { Eyebrow } from "./static";

export function usePoll(pollId: string) {
  const values = useQuery(api.votes.tally, { pollId }) ?? [];
  const revealed = useSession().revealed[pollId] ?? false;
  return { values, revealed };
}

export type StatusWords = { empty: string; one: string; many: string };

type HeaderProps = {
  eyebrow?: string;
  question: string;
  count: number;
  revealed: boolean;
  words: StatusWords;
};

function StatusLine({ count, revealed, words }: Omit<HeaderProps, "eyebrow" | "question">) {
  if (count === 0 && !revealed) {
    return (
      <p className="results-status" data-phase="empty">
        <span className="wait-dot" aria-hidden="true" />
        {words.empty}
      </p>
    );
  }
  return (
    <p className="results-status" data-phase={revealed ? "final" : "live"}>
      <CountUp value={count} className="tabular" /> {count === 1 ? words.one : words.many}
    </p>
  );
}

export function ResultsHeader({ eyebrow, question, ...status }: HeaderProps) {
  return (
    <header className="results-head">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2>{question}</h2>
      <StatusLine {...status} />
    </header>
  );
}
