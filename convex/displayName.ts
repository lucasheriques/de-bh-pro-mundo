export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 24;

const NAME_PATTERN = /^\p{L}[\p{L}\p{M}' .-]*$/u;

const BLOCKED_WORDS = new Set([
  "porra",
  "caralho",
  "merda",
  "puta",
  "puto",
  "buceta",
  "cu",
  "foda",
  "fdp",
  "viado",
  "bosta",
  "cacete",
  "pau",
  "rola",
  "piroca",
  "xoxota",
  "arrombado",
  "otario",
  "babaca",
  "corno",
  "vagabunda",
  "nazi",
  "nazista",
  "hitler",
  "fuck",
  "shit",
  "bitch",
  "dick",
  "cock",
  "pussy",
  "admin",
]);

const BLOCKED_INSIDE = [
  "caralh",
  "bucet",
  "pirok",
  "piroc",
  "xoxot",
  "arromb",
  "hitler",
  "nazis",
  "fuck",
];

export type NameCheck = { ok: true; name: string } | { ok: false; reason: string };

const fold = (text: string) => text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

function isOffensive(name: string): boolean {
  const folded = fold(name);
  const words = folded.split(/[^a-z]+/).filter(Boolean);
  if (words.some((word) => BLOCKED_WORDS.has(word))) return true;
  const squashed = folded.replace(/[^a-z]/g, "");
  return BLOCKED_INSIDE.some((fragment) => squashed.includes(fragment));
}

export function checkDisplayName(raw: string): NameCheck {
  const name = raw.normalize("NFC").trim().replace(/\s+/g, " ");
  if (name.length < NAME_MIN_LENGTH) return { ok: false, reason: "Nome curto demais" };
  if (name.length > NAME_MAX_LENGTH) return { ok: false, reason: `Até ${NAME_MAX_LENGTH} letras` };
  if (!NAME_PATTERN.test(name)) return { ok: false, reason: "Só letras, por favor" };
  if (isOffensive(name)) return { ok: false, reason: "Escolhe outro nome" };
  return { ok: true, name };
}
