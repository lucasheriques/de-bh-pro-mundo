/** Text rules for anything the audience can put on the projector: names and questions. */

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

export const fold = (text: string) => text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

export function isOffensive(text: string): boolean {
  const folded = fold(text);
  const words = folded.split(/[^a-z]+/).filter(Boolean);
  if (words.some((word) => BLOCKED_WORDS.has(word))) return true;
  const squashed = folded.replace(/[^a-z]/g, "");
  return BLOCKED_INSIDE.some((fragment) => squashed.includes(fragment));
}

export const QUESTION_MIN_LETTERS = 3;
export const QUESTION_MAX_LENGTH = 280;

const INVISIBLE = /[\p{Cc}\p{Cf}]/gu;
const LINK = /(https?:\/\/|www\.|\b[\w-]+\.(com|net|org|io|br|xyz|ly|gg|me|co|app)\b)/i;
const LONG_RUN = /(.)\1{7,}/u;
const LETTER = /\p{L}/gu;

export type TextCheck = { ok: true; text: string } | { ok: false; reason: string };

export function checkQuestion(raw: string): TextCheck {
  const text = raw.normalize("NFC").replace(INVISIBLE, " ").trim().replace(/\s+/g, " ");
  if ((text.match(LETTER) ?? []).length < QUESTION_MIN_LETTERS)
    return { ok: false, reason: "Escreve a pergunta com palavras" };
  if (text.length > QUESTION_MAX_LENGTH)
    return { ok: false, reason: `Até ${QUESTION_MAX_LENGTH} caracteres` };
  if (LINK.test(text)) return { ok: false, reason: "Sem links, por favor" };
  if (LONG_RUN.test(text)) return { ok: false, reason: "Pergunta inválida" };
  if (isOffensive(text)) return { ok: false, reason: "Reformula sem palavrão" };
  return { ok: true, text };
}
