import { type CSSProperties, useEffect, useRef } from "react";
import type { DotBox, DotGrid } from "./dotGrid";

const STAGGER_MS = 16;
const MAX_STAGGER_MS = 1100;

function useDropDelays(count: number): readonly number[] {
  const delays = useRef<number[]>([]);
  const settled = useRef(0);
  for (let n = delays.current.length; n < count; n++) {
    delays.current.push(Math.min(MAX_STAGGER_MS, (n - settled.current) * STAGGER_MS));
  }
  useEffect(() => {
    settled.current = count;
    delays.current.length = count;
  });
  return delays.current;
}

export function gridStyle(grid: DotGrid, box: DotBox): CSSProperties {
  return {
    "--step": `${grid.step}px`,
    "--dot-base": `${box.maxStep}px`,
    "--scale": grid.dot / box.maxStep,
    "--pile-inset": `${(box.width - grid.perRow * grid.step + grid.step - grid.dot) / 2}px`,
  } as CSSProperties;
}

function centeredColumn(n: number, count: number, perRow: number): number {
  const row = Math.floor(n / perRow);
  const inRow = Math.min(perRow, count - row * perRow);
  return (n % perRow) + (perRow - inRow) / 2;
}

export function DotPile({ count, perRow }: { count: number; perRow: number }) {
  const delays = useDropDelays(count);
  return (
    <div className="dot-pile" aria-hidden="true">
      {Array.from({ length: count }, (_, n) => (
        <span
          key={n}
          className="dot"
          style={
            {
              "--col": centeredColumn(n, count, perRow),
              "--row": Math.floor(n / perRow),
              "--delay": `${delays[n] ?? 0}ms`,
            } as CSSProperties
          }
        >
          <span className="dot-body" />
        </span>
      ))}
    </div>
  );
}
