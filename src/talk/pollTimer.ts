import { slides } from "./slides";
import type { Interaction } from "./types";

type Poll = Exclude<Interaction, { kind: "questions" }>;

/** How long the room votes before the result reveals itself; votes stay open after. */
export const POLL_SECONDS: Record<Poll["kind"], number> = { choice: 30, guess: 45, match: 45 };

export type TimedPoll = { pollId: string; seconds: number };

/** The poll a results slide counts down for, or null for every other slide. */
export function timedPollAt(index: number): TimedPoll | null {
  const slide = slides[index];
  const interaction = slide?.interaction;
  if (slide?.visual.kind !== "results" || !interaction || interaction.kind === "questions")
    return null;
  return { pollId: interaction.pollId, seconds: POLL_SECONDS[interaction.kind] };
}

export function timedPoll(pollId: string): TimedPoll | null {
  for (let index = 0; index < slides.length; index++) {
    const timed = timedPollAt(index);
    if (timed?.pollId === pollId) return timed;
  }
  return null;
}

export function secondsLeft(openedAt: number, seconds: number, now: number): number {
  return Math.max(0, Math.ceil((openedAt + seconds * 1000 - now) / 1000));
}
