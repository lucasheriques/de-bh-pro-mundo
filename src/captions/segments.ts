/** A phrase longer than this without a pause is committed early, so the draft never freezes. */
export const MAX_DRAFT_CHARS = 200;
const MIN_COMMIT_CHARS = 40;

export type Split = {
  /** Text to publish now as a finished caption, if the draft got too long. */
  commit: string | null;
  /** How many characters of the model's running phrase are already published. */
  consumed: number;
  /** What is still being spoken, shown as the live draft. */
  rest: string;
};

/**
 * The model's partial text grows for as long as the speaker doesn't pause. Past the limit,
 * publish it up to the last sentence end (or word, if there is none) and keep the remainder.
 */
export function splitLongPartial(partial: string, consumed: number): Split {
  const rest = partial.slice(consumed).trimStart();
  if (rest.length <= MAX_DRAFT_CHARS) return { commit: null, consumed, rest };
  const offset = partial.length - rest.length;
  const sentenceEnds = [...rest.matchAll(/[.!?](?=\s)/g)].map((match) => match.index + 1);
  const sentenceEnd = sentenceEnds.filter((end) => end >= MIN_COMMIT_CHARS).at(-1);
  const end = sentenceEnd ?? rest.lastIndexOf(" ", MAX_DRAFT_CHARS);
  if (end < MIN_COMMIT_CHARS) return { commit: null, consumed, rest };
  return {
    commit: rest.slice(0, end).trim(),
    consumed: offset + end,
    rest: rest.slice(end).trim(),
  };
}
