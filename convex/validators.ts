import { ConvexError, v } from "convex/values";

export const REACTION_KINDS = ["sense", "spicy", "more", "wow"] as const;
export type ReactionKind = (typeof REACTION_KINDS)[number];
export const reactionKind = v.union(...REACTION_KINDS.map((kind) => v.literal(kind)));
/** One reaction per person this often, so the stage never fills up. */
export const REACTION_COOLDOWN_MS = 10_000;

export const DEFAULT_SESSION = {
  slideIndex: 0,
  revealed: {} as Record<string, boolean>,
  voiceEnabled: false,
  pollOpenedAt: {} as Record<string, number>,
};

export { QUESTION_MAX_LENGTH } from "./moderation";

const ID_PATTERN = /^[A-Za-z0-9-]{8,64}$/;
const POLL_ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,63}$/;

export function parseClientId(clientId: string): string {
  if (!ID_PATTERN.test(clientId)) throw new ConvexError("clientId inválido");
  return clientId;
}

export function parsePollId(pollId: string): string {
  if (!POLL_ID_PATTERN.test(pollId)) throw new ConvexError("pollId inválido");
  return pollId;
}

/** The single presence room every phone joins. */
export const PRESENCE_ROOM = "sala";
