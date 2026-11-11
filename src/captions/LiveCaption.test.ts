import { describe, expect, it } from "vitest";
import { toParagraphs } from "./LiveCaption";

const line = (id: string, text: string, breakBefore = false) => ({ _id: id, text, breakBefore });

describe("toParagraphs", () => {
  it.each([
    {
      name: "joins phrases spoken without a long pause",
      lines: [line("a", "oi"), line("b", "tudo bem")],
      draft: "",
      draftBreak: false,
      expected: [["oi tudo bem", ""]],
    },
    {
      name: "starts a new paragraph after a long pause",
      lines: [line("a", "oi"), line("b", "próximo assunto", true)],
      draft: "",
      draftBreak: false,
      expected: [
        ["oi", ""],
        ["próximo assunto", ""],
      ],
    },
    {
      name: "continues the last paragraph with the draft",
      lines: [line("a", "oi")],
      draft: "e mais",
      draftBreak: false,
      expected: [["oi", "e mais"]],
    },
    {
      name: "opens a new paragraph when the draft follows a pause",
      lines: [line("a", "oi")],
      draft: "depois",
      draftBreak: true,
      expected: [
        ["oi", ""],
        ["", "depois"],
      ],
    },
    {
      name: "shows a lone draft",
      lines: [],
      draft: "começando",
      draftBreak: false,
      expected: [["", "começando"]],
    },
  ])("$name", ({ lines, draft, draftBreak, expected }) => {
    const paragraphs = toParagraphs(lines, draft, draftBreak);
    expect(paragraphs.map((p) => [p.finals.join(" "), p.draft])).toEqual(expected);
  });
});
