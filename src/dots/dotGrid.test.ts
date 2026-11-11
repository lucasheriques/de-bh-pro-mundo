import { describe, expect, it } from "vitest";
import { type DotBox, dotGrid, hueOf } from "./dotGrid";

const column: DotBox = { width: 378, height: 228, minStep: 10, maxStep: 96 };

const heightOf = (count: number, box: DotBox) => {
  const grid = dotGrid(count, box);
  return Math.ceil(count / grid.perRow) * grid.step;
};

describe("dotGrid", () => {
  it.each([0, 1, 3])("%i dots get the largest step", (count) => {
    expect(dotGrid(count, column).step).toBe(column.maxStep);
  });

  it.each([
    12, 30, 80, 200, 600,
  ])("%i dots fit the box with the largest step that fits", (count) => {
    const grid = dotGrid(count, column);
    expect(grid.perRow * grid.step).toBeLessThanOrEqual(column.width);
    expect(heightOf(count, column)).toBeLessThanOrEqual(column.height);
    const bigger = { ...column, minStep: grid.step + 1 };
    expect(heightOf(count, bigger)).toBeGreaterThan(column.height);
  });

  it("shrinks dots as the tallest pile grows", () => {
    const steps = [3, 30, 200].map((count) => dotGrid(count, column).step);
    expect(steps[0]).toBeGreaterThan(steps[1] ?? 0);
    expect(steps[1]).toBeGreaterThan(steps[2] ?? 0);
  });

  it("never goes below the minimum step, even when the box overflows", () => {
    expect(dotGrid(5000, column).step).toBe(column.minStep);
  });

  it("keeps a visible gap between dots", () => {
    const grid = dotGrid(30, column);
    expect(grid.dot).toBeLessThan(grid.step);
    expect(grid.dot).toBeGreaterThan(grid.step * 0.7);
  });
});

describe("hueOf", () => {
  it.each([
    [0, 1],
    [3, 4],
    [4, 1],
  ])("option %i gets hue %i", (index, hue) => {
    expect(hueOf(index)).toBe(hue);
  });
});
