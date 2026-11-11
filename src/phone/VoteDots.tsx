import type { CSSProperties } from "react";
import { type DotBox, dotGrid } from "../dots/dotGrid";

export function dotSizeStyle(tallest: number, box: DotBox): CSSProperties {
  const grid = dotGrid(tallest, box);
  return { "--dot": `${grid.dot}px`, "--dot-gap": `${grid.step - grid.dot}px` } as CSSProperties;
}

function YouDot() {
  return (
    <span className="you-tag">
      <span className="vote-dot is-mine" />
      você
    </span>
  );
}

export function VoteDots({ count, mine }: { count: number; mine: boolean }) {
  const others = mine ? count - 1 : count;
  return (
    <span className="vote-dots" aria-hidden="true">
      {mine ? <YouDot /> : null}
      {Array.from({ length: Math.max(0, others) }, (_, n) => (
        <span key={n} className="vote-dot" />
      ))}
    </span>
  );
}
