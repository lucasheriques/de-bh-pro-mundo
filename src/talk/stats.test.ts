import { describe, expect, it } from "vitest";
import { formatValue } from "./format";
import { countChoices, histogram, median } from "./stats";

describe("formatValue", () => {
  it.each([
    [18000, "brl-month", "R$ 18 mil/mês"],
    [12500, "brl-month", "R$ 12,5 mil/mês"],
    [900, "brl-month", "R$ 900/mês"],
    [42, "percent", "42%"],
    [12345, "number", "12.345"],
  ] as const)("%d as %s -> %s", (value, format, expected) => {
    expect(formatValue(value, format).replaceAll(" ", " ")).toBe(expected);
  });
});

describe("median", () => {
  it.each([
    [[], null],
    [[3], 3],
    [[5, 1, 3], 3],
    [[1, 2, 3, 10], 2.5],
  ])("%j -> %j", (values, expected) => {
    expect(median(values)).toBe(expected);
  });
});

describe("histogram", () => {
  it.each([
    ["spreads values across bins", [0, 4, 9, 10], [2, 2]],
    ["clamps out-of-range values to the edges", [-50, 500], [1, 1]],
    ["empty input", [], [0, 0]],
  ])("%s", (_label, values, expected) => {
    expect(histogram(values, { min: 0, max: 10 }, 2)).toEqual(expected);
  });
});

describe("countChoices", () => {
  it("counts known options and ignores unknown values", () => {
    const options = [
      { id: "a", label: "A" },
      { id: "b", label: "B" },
    ];
    expect(countChoices(["a", "a", "b", "zzz", 3], options)).toEqual([
      { id: "a", label: "A", count: 2, share: 2 / 3 },
      { id: "b", label: "B", count: 1, share: 1 / 3 },
    ]);
  });
});
