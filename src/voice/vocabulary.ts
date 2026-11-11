import { slides } from "../talk/slides";

/** Terms the recognizer should favour: names it reliably mangles, plus every slide cue. */
const TALK_TERMS = [
  "PostHog",
  "NaGringa",
  "G2i",
  "Coinbase",
  "Brex",
  "Increment",
  "ioasys",
  "Rock Content",
  "Vercel",
  "NVIDIA",
  "Nubank",
  "iFood",
  "Mercado Livre",
  "tier 1",
  "tier 2",
  "tier 3",
  "product engineer",
  "contractor",
  "Belo Horizonte",
  "PUC Minas",
  "Coração Eucarístico",
  "próximo slide",
  "volta um",
  "mostra o resultado",
];

export const BIAS_PHRASES: readonly string[] = [
  ...new Set([...TALK_TERMS, ...slides.flatMap((slide) => slide.cues ?? [])]),
];

const CORRECTIONS: readonly [RegExp, string][] = [
  [/\bpost[\s-]?(hog|og|rog|hoag)\b/gi, "PostHog"],
  [/\bpos[\s-]?thog\b/gi, "PostHog"],
  [/\bna[\s-]gringa\b/gi, "NaGringa"],
  [/\bg[\s-]?(2|dois)[\s-]?(i|ai)\b/gi, "G2i"],
  [/\bcoin[\s-]?base\b/gi, "Coinbase"],
  [/\b(brecks|brex|breques)\b/gi, "Brex"],
  [/\bi[\s-]?food\b/gi, "iFood"],
  [/\bin[\s-]?vidia\b/gi, "NVIDIA"],
  [/\b(tir|teer|tear)\s+(s|a|b)\b/gi, "tier $2"],
  [/\bproduct[\s-]?engine?er\b/gi, "product engineer"],
  [/\bpuc\b/gi, "PUC"],
];

export function correctTranscript(text: string): string {
  return CORRECTIONS.reduce(
    (current, [pattern, replacement]) => current.replace(pattern, replacement),
    text,
  );
}
