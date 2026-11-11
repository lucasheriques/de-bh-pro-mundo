import type { CSSProperties } from "react";
import { DotPile, gridStyle } from "../../dots/DotPile";
import { dotGrid, TALLEST_PILE_SHARE } from "../../dots/dotGrid";
import { formatValue } from "../../talk/format";
import { binOf, GUESS_BINS, histogram, median, numericValues, type Range } from "../../talk/stats";
import type { Interaction } from "../../talk/types";
import { ResultsHeader, type StatusWords, usePoll } from "./resultsParts";

const CHART_WIDTH = 1640;
const BIN_GAP = 16;
const PILE_HEIGHT = 300;
const PILE_BOX = {
  width: (CHART_WIDTH - BIN_GAP * (GUESS_BINS - 1)) / GUESS_BINS,
  height: PILE_HEIGHT * TALLEST_PILE_SHARE,
  minStep: 6,
  maxStep: 72,
};
const GUESS_HUE = 3;

const WORDS: StatusWords = {
  empty: "Esperando os primeiros chutes",
  one: "pessoa já chutou",
  many: "pessoas já chutaram",
};

type GuessInteraction = Extract<Interaction, { kind: "guess" }>;

function Marker({ kind, at, label }: { kind: "median" | "answer"; at: number; label: string }) {
  const align = at < 0.12 ? "start" : at > 0.88 ? "end" : "center";
  return (
    <span
      className={`marker marker-${kind}`}
      data-align={align}
      style={{ transform: `translateX(${at * CHART_WIDTH}px)` }}
    >
      <span className="marker-label">{label}</span>
    </span>
  );
}

function fractionOf(value: number, { min, max }: Range): number {
  return (Math.min(max, Math.max(min, value)) - min) / (max - min);
}

export function GuessResults({
  interaction,
  eyebrow,
}: {
  interaction: GuessInteraction;
  eyebrow?: string;
}) {
  const { values, revealed } = usePoll(interaction.pollId);
  const guesses = numericValues(values);
  const { answer, format } = interaction;
  const bins = histogram(guesses, interaction, GUESS_BINS);
  const grid = dotGrid(Math.max(0, ...bins), PILE_BOX);
  const crowd = median(guesses);
  const answerBin = binOf(answer, interaction, GUESS_BINS);
  const stateOf = (bin: number) => {
    if (!revealed) return "live";
    return bin === answerBin ? "winner" : "dimmed";
  };
  return (
    <div className="v-results v-guess" data-revealed={revealed}>
      <ResultsHeader
        eyebrow={eyebrow}
        question={interaction.question}
        count={guesses.length}
        revealed={revealed}
        words={WORDS}
      />
      <div
        className="guess-chart"
        style={
          {
            ...gridStyle(grid, PILE_BOX),
            "--pile-height": `${PILE_HEIGHT}px`,
            "--bins": GUESS_BINS,
          } as CSSProperties
        }
      >
        <ol className="guess-bins" data-hue={GUESS_HUE}>
          {bins.map((count, bin) => (
            <li key={bin} className="guess-bin" data-state={stateOf(bin)}>
              <DotPile count={count} perRow={grid.perRow} />
            </li>
          ))}
        </ol>
        <div className="guess-axis">
          <span>{formatValue(interaction.min, format)}</span>
          <span>{formatValue(interaction.max, format)}</span>
        </div>
        {crowd !== null ? (
          <Marker
            kind="median"
            at={fractionOf(crowd, interaction)}
            label={`Mediana da sala · ${formatValue(crowd, format)}`}
          />
        ) : null}
        {revealed ? (
          <Marker
            kind="answer"
            at={fractionOf(answer, interaction)}
            label={`Resposta · ${formatValue(answer, format)}`}
          />
        ) : null}
      </div>
    </div>
  );
}
