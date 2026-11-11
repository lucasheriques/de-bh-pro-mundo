import { type CSSProperties, useState } from "react";
import { formatValue } from "../talk/format";
import { GuessStrip } from "./GuessStrip";
import type { PanelProps } from "./PhonePage";
import { usePollVote } from "./usePollVote";

type Guess = PanelProps<"guess">["interaction"];

function GuessForm({
  interaction,
  submitted,
  onSubmit,
}: {
  interaction: Guess;
  submitted: number | null;
  onSubmit: (value: number) => void;
}) {
  const { min, max, step, format } = interaction;
  const [draft, setDraft] = useState<number | null>(null);
  const value = draft ?? submitted ?? Math.round((min + max) / 2 / step) * step;
  const dirty = draft !== null && draft !== submitted;
  return (
    <>
      <output className="guess-value" htmlFor="guess-range">
        {formatValue(value, format)}
      </output>
      <input
        id="guess-range"
        className="guess-range"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => setDraft(Number(event.target.value))}
        style={{ "--fill": `${((value - min) / (max - min)) * 100}%` } as CSSProperties}
      />
      <div className="guess-scale">
        <span>{formatValue(min, format)}</span>
        <span>{formatValue(max, format)}</span>
      </div>
      <button
        type="button"
        className={`primary ${submitted !== null && !dirty ? "is-done" : ""}`}
        disabled={submitted !== null && !dirty}
        onClick={() => {
          onSubmit(value);
          setDraft(null);
        }}
      >
        {submitted === null ? "Enviar chute" : dirty ? "Atualizar chute" : "Chute enviado"}
      </button>
    </>
  );
}

function revealNote(submitted: number | null, interaction: Guess): string {
  const answer = formatValue(interaction.answer, interaction.format);
  if (submitted === null) return `Você não chutou. A resposta é ${answer}.`;
  return `Você chutou ${formatValue(submitted, interaction.format)}, a resposta é ${answer}.`;
}

export function GuessPanel({ interaction }: PanelProps<"guess">) {
  const { mine, tally, revealed, vote } = usePollVote(interaction.pollId);
  const submitted = typeof mine === "number" ? mine : null;
  const strip = (
    <GuessStrip interaction={interaction} tally={tally} mine={submitted} revealed={revealed} />
  );

  if (revealed) {
    return (
      <section className="panel">
        <p className="eyebrow">Resposta</p>
        <h1 className="panel-question">{interaction.question}</h1>
        <p className="guess-value accent">{formatValue(interaction.answer, interaction.format)}</p>
        <p className="panel-note" data-testid="phone-result">
          {revealNote(submitted, interaction)}
        </p>
        {strip}
      </section>
    );
  }

  return (
    <section className="panel">
      <p className="eyebrow">Chute</p>
      <h1 className="panel-question">{interaction.question}</h1>
      <GuessForm
        interaction={interaction}
        submitted={submitted}
        onSubmit={(value) => void vote(value)}
      />
      {submitted !== null ? strip : null}
    </section>
  );
}
