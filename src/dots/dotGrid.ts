export type DotBox = { width: number; height: number; minStep: number; maxStep: number };

export type DotGrid = { step: number; perRow: number; dot: number };

export const TALLEST_PILE_SHARE = 0.75;

const DOT_SHARE_OF_STEP = 0.86;
const HUE_COUNT = 4;

function gridAt(step: number, width: number): DotGrid {
  return {
    step,
    perRow: Math.max(1, Math.floor(width / step)),
    dot: Math.round(step * DOT_SHARE_OF_STEP),
  };
}

export function dotGrid(count: number, box: DotBox): DotGrid {
  for (let step = box.maxStep; step > box.minStep; step--) {
    const grid = gridAt(step, box.width);
    if (Math.ceil(count / grid.perRow) * step <= box.height) return grid;
  }
  return gridAt(box.minStep, box.width);
}

export function hueOf(index: number): number {
  return (index % HUE_COUNT) + 1;
}
