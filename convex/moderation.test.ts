import { describe, expect, it } from "vitest";
import { checkQuestion } from "./moderation";
import { acceptVote } from "./pollRules";

describe("checkQuestion", () => {
  it.each([
    { input: "Como você conseguiu a primeira vaga?", ok: true },
    { input: "  Vale   a pena  PJ?  ", ok: true, text: "Vale a pena PJ?" },
    { input: "??? !!!", ok: false },
    { input: "ok", ok: false },
    { input: "entra em www.golpe.com agora", ok: false },
    { input: "olha https://bit.ly/x", ok: false },
    { input: "kkkkkkkkkkkkkkkk", ok: false },
    { input: "que porra é essa", ok: false },
    { input: "c a r a l h o", ok: false },
    { input: `${"palavra ".repeat(40)}`, ok: false },
    { input: "pergunta​ invisível\u0007", ok: true, text: "pergunta invisível" },
  ])("$input -> ok: $ok", ({ input, ok, text }) => {
    const check = checkQuestion(input);
    expect(check.ok).toBe(ok);
    if (text && check.ok) expect(check.text).toBe(text);
  });
});

describe("acceptVote", () => {
  it.each([
    { name: "a real choice option", pollId: "abroad", value: "want", expected: "want" },
    { name: "an option that does not exist", pollId: "abroad", value: "lol", expected: null },
    { name: "a number on a choice poll", pollId: "abroad", value: 3, expected: null },
    { name: "an unknown poll", pollId: "nope", value: "want", expected: null },
    { name: "a guess inside the slider", pollId: "senior-guess", value: 20000, expected: 20000 },
    { name: "a guess above the slider", pollId: "senior-guess", value: 1e12, expected: null },
    { name: "a text guess", pollId: "senior-guess", value: "20000", expected: null },
    {
      name: "a full match",
      pollId: "connect-dots",
      value: "dti=1;nubank=2;google=3",
      expected: "dti=1;nubank=2;google=3",
    },
    {
      name: "a match with an unknown company",
      pollId: "connect-dots",
      value: "evil=1",
      expected: null,
    },
    {
      name: "a match with an unknown tier",
      pollId: "connect-dots",
      value: "dti=9",
      expected: null,
    },
  ])("$name", ({ pollId, value, expected }) => {
    expect(acceptVote(pollId, value)).toEqual(expected);
  });
});
