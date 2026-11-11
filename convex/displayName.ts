import { fold, isOffensive } from "./moderation";

export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 24;

const NAME_PATTERN = /^\p{L}[\p{L}\p{M}' .-]*$/u;

export type NameCheck = { ok: true; name: string } | { ok: false; reason: string };

const RESERVED = new Set(["admin", "apresentador", "moderador"]);

export function checkDisplayName(raw: string): NameCheck {
  const name = raw.normalize("NFC").trim().replace(/\s+/g, " ");
  if (name.length < NAME_MIN_LENGTH) return { ok: false, reason: "Nome curto demais" };
  if (name.length > NAME_MAX_LENGTH) return { ok: false, reason: `Até ${NAME_MAX_LENGTH} letras` };
  if (!NAME_PATTERN.test(name)) return { ok: false, reason: "Só letras, por favor" };
  if (isOffensive(name) || RESERVED.has(fold(name)))
    return { ok: false, reason: "Escolhe outro nome" };
  return { ok: true, name };
}
