import { describe, expect, it } from "vitest";
import { encodeMatch, parseMatch, scoreMatch, tallyMatch } from "./match";
import type { Interaction } from "./types";

const interaction: Extract<Interaction, { kind: "match" }> = {
  kind: "match",
  pollId: "dots",
  question: "Ligue",
  targets: [
    { id: "1", label: "Tier 1" },
    { id: "2", label: "Tier 2" },
    { id: "3", label: "Tier 3" },
  ],
  items: [
    { id: "dti", name: "dti", logo: "", answer: "1" },
    { id: "nubank", name: "Nubank", logo: "", answer: "2" },
  ],
};

describe("match encoding", () => {
  it.each([
    ["round trip", { dti: "1", nubank: "2" }],
    ["partial picks", { nubank: "3" }],
  ])("%s", (_label, picks) => {
    expect(parseMatch(encodeMatch(picks))).toEqual(picks);
  });

  it.each([
    ["a number", 3],
    ["garbage", "x;;=2;dti="],
  ])("ignores %s", (_label, value) => {
    expect(parseMatch(value)).toEqual({});
  });
});

describe("tallyMatch", () => {
  it("counts picks per item and the share that got it right", () => {
    const rows = tallyMatch(["dti=1;nubank=3", "dti=1;nubank=2", "dti=2"], interaction);
    expect(rows.map((row) => [row.item.id, row.counts, row.total, row.correctShare])).toEqual([
      ["dti", { 1: 2, 2: 1, 3: 0 }, 3, 2 / 3],
      ["nubank", { 1: 0, 2: 1, 3: 1 }, 2, 0.5],
    ]);
  });
});

describe("scoreMatch", () => {
  it.each([
    ["all right", { dti: "1", nubank: "2" }, 2],
    ["one right", { dti: "1", nubank: "3" }, 1],
    ["none", {}, 0],
  ])("%s", (_label, picks, score) => {
    expect(scoreMatch(picks, interaction)).toBe(score);
  });
});
