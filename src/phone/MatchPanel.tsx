import { useState } from "react";
import { encodeMatch, type MatchPicks, parseMatch, scoreMatch, tallyMatch } from "../talk/match";
import type { MatchItem, PollOption } from "../talk/types";
import type { PanelProps } from "./PhonePage";
import { usePollVote } from "./usePollVote";

type RowState = { picked: string | undefined; revealed: boolean; counts?: Record<string, number> };

function targetClass(target: PollOption, item: MatchItem, { picked, revealed }: RowState): string {
  const classes = ["match-target"];
  if (picked === target.id) classes.push("is-picked");
  if (revealed && item.answer === target.id) classes.push("is-answer");
  if (revealed && picked === target.id && item.answer !== target.id) classes.push("is-wrong");
  return classes.join(" ");
}

function MatchRowView({
  item,
  targets,
  state,
  onPick,
}: {
  item: MatchItem;
  targets: readonly PollOption[];
  state: RowState;
  onPick: (target: string) => void;
}) {
  return (
    <li className="match-row">
      <span className="match-company">
        <span className="match-logo">
          <img src={item.logo} alt="" />
        </span>
        {item.name}
      </span>
      <fieldset className="match-targets" aria-label={`Tier de ${item.name}`}>
        {targets.map((target) => (
          <button
            key={target.id}
            type="button"
            className={targetClass(target, item, state)}
            aria-pressed={state.picked === target.id}
            disabled={state.revealed}
            onClick={() => onPick(target.id)}
          >
            {target.label}
            {state.counts ? (
              <span className="match-count mono">{state.counts[target.id] ?? 0}</span>
            ) : null}
          </button>
        ))}
      </fieldset>
    </li>
  );
}

function matchNote(revealed: boolean, complete: boolean, score: number, total: number): string {
  if (revealed)
    return complete ? `Você acertou ${score} de ${total}.` : "Você não ligou todas dessa vez.";
  if (complete) return "Enviado. Pode trocar até o resultado sair.";
  return "Ligue cada empresa ao tier dela.";
}

export function MatchPanel({ interaction }: PanelProps<"match">) {
  const { mine, tally, revealed, vote } = usePollVote(interaction.pollId);
  const [draft, setDraft] = useState<MatchPicks | null>(null);
  const picks = draft ?? parseMatch(mine);
  const complete = interaction.items.every((item) => picks[item.id] !== undefined);
  const rows = complete || revealed ? tallyMatch(tally, interaction) : null;

  const pick = (itemId: string, target: string) => {
    const next = { ...picks, [itemId]: target };
    setDraft(next);
    if (interaction.items.every((item) => next[item.id] !== undefined))
      void vote(encodeMatch(next));
  };

  return (
    <section className="panel">
      <p className="eyebrow">{revealed ? "Resposta" : "Ligue os pontos"}</p>
      <h1 className="panel-question">{interaction.question}</h1>
      <ol className="match-list">
        {interaction.items.map((item, i) => (
          <MatchRowView
            key={item.id}
            item={item}
            targets={interaction.targets}
            state={{ picked: picks[item.id], revealed, counts: rows?.[i]?.counts }}
            onPick={(target) => pick(item.id, target)}
          />
        ))}
      </ol>
      <p className="panel-note" data-testid={revealed ? "phone-result" : undefined}>
        {matchNote(revealed, complete, scoreMatch(picks, interaction), interaction.items.length)}
      </p>
    </section>
  );
}
