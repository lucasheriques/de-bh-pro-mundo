import { encodeMatch, parseMatch } from "../src/talk/match";
import { slides } from "../src/talk/slides";
import type { Interaction } from "../src/talk/types";

type Poll = Exclude<Interaction, { kind: "questions" }>;

const polls = new Map<string, Poll>(
  slides.flatMap((slide) => {
    const interaction = slide.interaction;
    return interaction && interaction.kind !== "questions"
      ? [[interaction.pollId, interaction] as const]
      : [];
  }),
);

/**
 * The vote as it should be stored, or null when it is not an answer this poll can take:
 * an unknown poll, an option that does not exist, a guess outside the slider, a bad match.
 */
export function acceptVote(pollId: string, value: string | number): string | number | null {
  const poll = polls.get(pollId);
  if (!poll) return null;
  if (poll.kind === "choice") {
    return typeof value === "string" && poll.options.some((option) => option.id === value)
      ? value
      : null;
  }
  if (poll.kind === "guess") {
    return typeof value === "number" &&
      Number.isFinite(value) &&
      value >= poll.min &&
      value <= poll.max
      ? value
      : null;
  }
  const picks = parseMatch(value);
  const valid = Object.entries(picks).every(
    ([item, target]) =>
      poll.items.some((candidate) => candidate.id === item) &&
      poll.targets.some((candidate) => candidate.id === target),
  );
  return valid && Object.keys(picks).length > 0 ? encodeMatch(picks) : null;
}
