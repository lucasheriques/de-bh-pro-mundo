import { describe, expect, it } from "vitest";
import { applySlideEdits, editableFields, setText } from "./slideEdits";
import type { Slide } from "./types";

const slide: Slide = {
  id: "demo",
  section: "1. Teste",
  visual: { kind: "list", title: "Título", items: [{ title: "Um", body: "Corpo" }] },
  interaction: {
    kind: "choice",
    pollId: "demo-poll",
    question: "Qual?",
    options: [{ id: "a", label: "A" }],
  },
  notes: "Notas",
  cues: ["fala isso"],
};

describe("editableFields", () => {
  it("lists every text leaf and skips structural ids", () => {
    const paths = editableFields(slide).map((field) => field.path);
    expect(paths).toEqual([
      "visual.title",
      "visual.items.0.title",
      "visual.items.0.body",
      "interaction.question",
      "interaction.options.0.label",
      "notes",
      "cues.0",
    ]);
  });
});

describe("setText", () => {
  it.each([
    ["a title", "visual.title", true],
    ["a nested item", "visual.items.0.body", true],
    ["a cue in an array", "cues.0", true],
    ["a locked id", "interaction.pollId", false],
    ["a path that does not exist", "visual.subtitle", false],
    ["a non-string leaf", "visual.items", false],
  ])("%s", (_label, path, applied) => {
    const copy = structuredClone(slide);
    expect(setText(copy as never, path, "novo")).toBe(applied);
  });
});

describe("applySlideEdits", () => {
  it("rebuilds in place from the pristine copy so removed edits revert", () => {
    const live = [structuredClone(slide)];
    applySlideEdits(live, [slide], [{ slideId: "demo", path: "visual.title", value: "Editado" }]);
    expect(live[0]?.visual).toMatchObject({ title: "Editado" });
    applySlideEdits(live, [slide], []);
    expect(live[0]?.visual).toMatchObject({ title: "Título" });
    expect(slide.visual).toMatchObject({ title: "Título" });
  });
});
