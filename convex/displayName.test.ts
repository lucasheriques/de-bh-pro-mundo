import { describe, expect, it } from "vitest";
import { checkDisplayName } from "./displayName";

describe("checkDisplayName", () => {
  it.each([
    ["plain first name", "Ana", "Ana"],
    ["accents", "João", "João"],
    ["full name with spaces trimmed", "  Maria   Clara  ", "Maria Clara"],
    ["apostrophe and hyphen", "D'Ávila-Souza", "D'Ávila-Souza"],
    ["a name shared with the speaker", "Lucas", "Lucas"],
  ])("accepts %s", (_label, raw, expected) => {
    expect(checkDisplayName(raw)).toEqual({ ok: true, name: expected });
  });

  it.each([
    ["too short", "A", "Nome curto demais"],
    ["too long", "Abcdefghijklmnopqrstuvwxyz", "Até 24 letras"],
    ["digits", "Ana2000", "Só letras, por favor"],
    ["a url", "site.com/x", "Só letras, por favor"],
    ["emoji", "Ana 😀", "Só letras, por favor"],
    ["starts with punctuation", "-Ana", "Só letras, por favor"],
    ["a swear word", "Seu Caralho", "Escolhe outro nome"],
    ["a swear word with accents", "Otário", "Escolhe outro nome"],
    ["a squashed swear word", "c a r a l h o", "Escolhe outro nome"],
  ])("rejects %s", (_label, raw, reason) => {
    expect(checkDisplayName(raw)).toEqual({ ok: false, reason });
  });
});
