import type { CSSProperties } from "react";
import { formatValue } from "../talk/format";
import { binOf, GUESS_BINS, histogram, median, numericValues } from "../talk/stats";
import type { Interaction } from "../talk/types";
import { dotSizeStyle } from "./VoteDots";

const BIN_BOX = { width: 38, height: 84, minStep: 4, maxStep: 16 };

type Guess = Extract<Interaction, { kind: "guess" }>;

type StripProps = {
  interaction: Guess;
  tally: readonly (string | number)[];
  mine: number | null;
  revealed: boolean;
};

function Bin({ count, mine }: { count: number; mine: boolean }) {
  const others = mine ? count - 1 : count;
  return (
    <li className="strip-bin">
      {Array.from({ length: Math.max(0, others) }, (_, n) => (
        <span key={n} className="vote-dot" />
      ))}
      {mine ? (
        <>
          <span className="vote-dot is-mine" />
          <span className="you-tag">você</span>
        </>
      ) : null}
    </li>
  );
}

export function GuessStrip({ interaction, tally, mine, revealed }: StripProps) {
  const guesses = numericValues(tally);
  const bins = histogram(guesses, interaction, GUESS_BINS);
  const myBin = mine === null ? -1 : binOf(mine, interaction, GUESS_BINS);
  const crowd = median(guesses);
  const { format } = interaction;
  const answerAt = (interaction.answer - interaction.min) / (interaction.max - interaction.min);
  return (
    <figure className="guess-strip" data-hue="3">
      <figcaption className="panel-status">
        {guesses.length} {guesses.length === 1 ? "chute" : "chutes"} na sala
        {crowd !== null ? ` · mediana ${formatValue(crowd, format)}` : ""}
      </figcaption>
      <div
        className="strip-chart"
        style={
          { ...dotSizeStyle(Math.max(0, ...bins), BIN_BOX), "--bins": GUESS_BINS } as CSSProperties
        }
      >
        <ol className="strip-bins" aria-hidden="true">
          {bins.map((count, bin) => (
            <Bin key={bin} count={count} mine={bin === myBin} />
          ))}
        </ol>
        {revealed ? (
          <span
            className="strip-answer"
            style={{ left: `${answerAt * 100}%` }}
            aria-hidden="true"
          />
        ) : null}
      </div>
      <div className="strip-scale">
        <span>{formatValue(interaction.min, format)}</span>
        <span>{formatValue(interaction.max, format)}</span>
      </div>
    </figure>
  );
}
