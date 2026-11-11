import type { CSSProperties } from "react";
import { tallyMatch } from "../../talk/match";
import type { Interaction } from "../../talk/types";
import { ResultsHeader, type StatusWords, usePoll } from "./resultsParts";

const WORDS: StatusWords = {
  empty: "Esperando as primeiras ligações",
  one: "pessoa já ligou",
  many: "pessoas já ligaram",
};

const TARGET_HUE: Record<string, number> = { "1": 4, "2": 3, "3": 1 };

type MatchInteraction = Extract<Interaction, { kind: "match" }>;

export function MatchResults({
  interaction,
  eyebrow,
}: {
  interaction: MatchInteraction;
  eyebrow?: string;
}) {
  const { values, revealed } = usePoll(interaction.pollId);
  const rows = tallyMatch(values, interaction);
  return (
    <div className={`v-results v-match ${revealed ? "is-revealed" : "is-hidden"}`}>
      <ResultsHeader
        eyebrow={eyebrow}
        question={interaction.question}
        count={values.length}
        revealed={revealed}
        words={WORDS}
      />
      <ol className="match-columns">
        {rows.map((row) => (
          <li key={row.item.id} className="match-column">
            <span className="match-column-logo">
              <img src={row.item.logo} alt="" />
            </span>
            <span className="match-column-name">{row.item.name}</span>
            <ol className="match-bars">
              {interaction.targets.map((target) => {
                const count = row.counts[target.id] ?? 0;
                const share = row.total ? count / row.total : 0;
                const isAnswer = revealed && row.item.answer === target.id;
                return (
                  <li
                    key={target.id}
                    className="match-bar"
                    data-state={revealed ? (isAnswer ? "answer" : "dimmed") : "live"}
                    style={{ "--hue": `var(--hue-${TARGET_HUE[target.id] ?? 2})` } as CSSProperties}
                  >
                    <span className="match-bar-label">{target.label}</span>
                    <span className="match-bar-track">
                      <span className="match-bar-fill" style={{ transform: `scaleX(${share})` }} />
                    </span>
                    <span className="match-bar-value tabular">{count}</span>
                  </li>
                );
              })}
            </ol>
            {revealed ? (
              <span className="match-verdict">{Math.round(row.correctShare * 100)}% acertaram</span>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
