import { describe, expect, it } from "vitest";
import { fitZoom } from "./useFitHeight";

describe("fitZoom", () => {
  it.each([
    { name: "leaves content that fits", available: 800, needed: 700, expected: 1 },
    { name: "leaves content that fits exactly", available: 800, needed: 800, expected: 1 },
    { name: "shrinks overflowing content to fit", available: 800, needed: 1000, expected: 0.8 },
    { name: "never shrinks below the floor", available: 400, needed: 1000, expected: 0.6 },
    { name: "ignores empty content", available: 800, needed: 0, expected: 1 },
  ])("$name", ({ available, needed, expected }) => {
    expect(fitZoom(available, needed)).toBe(expected);
  });
});
