import type { CSSProperties } from "react";
import { DotPile, gridStyle } from "../../dots/DotPile";
import { type DotBox, dotGrid, hueOf, TALLEST_PILE_SHARE } from "../../dots/dotGrid";
import { type ChoiceCount, countChoices } from "../../talk/stats";
import type { Interaction } from "../../talk/types";
import { ResultsHeader, type StatusWords, usePoll } from "./resultsParts";

const CHART_WIDTH = 1640;
const COLUMN_GAP = 56;
const PILE_HEIGHT = 320;
const PILE_BOX = { height: PILE_HEIGHT * TALLEST_PILE_SHARE, minStep: 8, maxStep: 120 };

const WORDS: StatusWords = {
  empty: "Esperando os primeiros votos",
  one: "pessoa já votou",
  many: "pessoas já votaram",
};

type ColumnState = "live" | "winner" | "dimmed";

function columnBox(columns: number): DotBox {
  return { ...PILE_BOX, width: (CHART_WIDTH - COLUMN_GAP * (columns - 1)) / columns };
}

type ColumnProps = {
  option: ChoiceCount;
  index: number;
  perRow: number;
  state: ColumnState;
  total: number;
};

function Column({ option, index, perRow, state, total }: ColumnProps) {
  return (
    <li className="unit-col" data-hue={hueOf(index)} data-state={state}>
      <DotPile count={option.count} perRow={perRow} />
      <div className="unit-caption">
        <span className="unit-label-row">
          <span className="unit-label">{option.label}</span>
        </span>
        <span className="unit-figures">
          <span className="unit-count">{option.count}</span>
          <span className="unit-share">
            {total > 0 ? `${Math.round(option.share * 100)}%` : ""}
          </span>
        </span>
      </div>
    </li>
  );
}

export function ChoiceResults({
  interaction,
  eyebrow,
}: {
  interaction: Extract<Interaction, { kind: "choice" }>;
  eyebrow?: string;
}) {
  const { values, revealed } = usePoll(interaction.pollId);
  const counts = countChoices(values, interaction.options);
  const total = counts.reduce((sum, option) => sum + option.count, 0);
  const top = Math.max(0, ...counts.map((option) => option.count));
  const box = columnBox(counts.length);
  const grid = dotGrid(top, box);
  const stateOf = (count: number): ColumnState => {
    if (!revealed) return "live";
    return count === top && top > 0 ? "winner" : "dimmed";
  };
  return (
    <div className="v-results" data-revealed={revealed}>
      <ResultsHeader
        eyebrow={eyebrow}
        question={interaction.question}
        count={total}
        revealed={revealed}
        words={WORDS}
      />
      <ol
        className="unit-columns"
        style={
          {
            ...gridStyle(grid, box),
            "--pile-height": `${PILE_HEIGHT}px`,
            "--columns": counts.length,
          } as CSSProperties
        }
      >
        {counts.map((option, index) => (
          <Column
            key={option.id}
            option={option}
            index={index}
            perRow={grid.perRow}
            state={stateOf(option.count)}
            total={total}
          />
        ))}
      </ol>
    </div>
  );
}
