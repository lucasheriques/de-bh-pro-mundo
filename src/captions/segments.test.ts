import { describe, expect, it } from "vitest";
import { MAX_DRAFT_CHARS, splitLongPartial } from "./segments";

const sentence =
  "A mesma pessoa, com a mesma stack, ganha quase cinco vezes mais dependendo do mercado.";
const long = `${sentence} ${sentence} ${sentence}`;

describe("splitLongPartial", () => {
  it.each([
    { name: "keeps a short draft", partial: "Boa noite, pessoal.", consumed: 0, commit: null },
    {
      name: "commits a long draft at its last sentence end",
      partial: long,
      consumed: 0,
      commit: `${sentence} ${sentence}`,
    },
    {
      name: "only looks past what was already published",
      partial: `${sentence} ${long}`,
      consumed: sentence.length,
      commit: `${sentence} ${sentence}`,
    },
  ])("$name", ({ partial, consumed, commit }) => {
    expect(splitLongPartial(partial, consumed).commit).toBe(commit);
  });

  it("falls back to the last word when there is no sentence end", () => {
    const words = "palavra ".repeat(40).trim();
    const split = splitLongPartial(words, 0);
    expect(split.commit?.length).toBeLessThanOrEqual(MAX_DRAFT_CHARS);
    expect(split.commit?.endsWith("palavra")).toBe(true);
    expect(`${split.commit} ${split.rest}`).toBe(words);
  });

  it("leaves the remainder as the live draft and advances what was consumed", () => {
    const split = splitLongPartial(long, 0);
    expect(split.rest).toBe(sentence);
    expect(long.slice(split.consumed).trim()).toBe(sentence);
  });
});
