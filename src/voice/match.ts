export const WINDOW_SIZE = 25;
export const MAX_GAP = 2;
export const LOCK_MS = 2000;
const FUZZY_MIN_LENGTH = 5;

export function normalize(text: string): string[] {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function wordsNeeded(count: number): number {
  return count <= 3 ? count : Math.max(3, Math.ceil((count * 3) / 5));
}

function withinOneEdit(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  let common = 0;
  while (common < a.length && a[common] === b[common]) common++;
  const restA = a.slice(common);
  const restB = b.slice(common);
  return (
    restA === restB ||
    restA.slice(1) === restB.slice(1) ||
    restA.slice(1) === restB ||
    restA === restB.slice(1)
  );
}

export function wordMatches(heard: string, expected: string): boolean {
  if (heard === expected) return true;
  return (
    Math.min(heard.length, expected.length) >= FUZZY_MIN_LENGTH && withinOneEdit(heard, expected)
  );
}

function followsInOrder(
  window: readonly string[],
  start: number,
  rest: readonly string[],
): boolean {
  const [word, ...after] = rest;
  if (word === undefined) return true;
  const last = Math.min(window.length - 1, start + MAX_GAP);
  for (let i = start; i <= last; i++) {
    const heard = window[i];
    if (heard !== undefined && wordMatches(heard, word) && followsInOrder(window, i + 1, after)) {
      return true;
    }
  }
  return false;
}

export function containsCue(
  window: readonly string[],
  cue: readonly string[],
  words = cue.length,
): boolean {
  const [first, ...rest] = cue.slice(0, words);
  return (
    first !== undefined &&
    window.some((heard, i) => wordMatches(heard, first) && followsInOrder(window, i + 1, rest))
  );
}

const heardCue = (window: readonly string[], cue: readonly string[]): boolean =>
  containsCue(window, cue, wordsNeeded(cue.length));

export type VoiceState = {
  finalTokens: readonly string[];
  interimTokens: readonly string[];
  muteUntilFinal: boolean;
  lock: { slideIndex: number; until: number } | null;
};

export type VoiceInput = {
  text: string;
  isFinal: boolean;
  now: number;
  slideIndex: number;
  cues: readonly string[] | undefined;
  nextCues: readonly string[] | undefined;
};

export type Steps = -1 | 0 | 1 | 2;

export type VoiceMove = { steps: Steps; reveal: boolean };

const NO_MOVE: VoiceMove = { steps: 0, reveal: false };

const COMMANDS: readonly { phrases: readonly string[]; move: VoiceMove }[] = [
  { phrases: ["proximo slide", "pra frente", "slide seguinte"], move: { steps: 1, reveal: false } },
  { phrases: ["volta um", "volta slide", "slide anterior"], move: { steps: -1, reveal: false } },
  { phrases: ["mostra o resultado", "mostrar o resultado"], move: { steps: 0, reveal: true } },
];

function commandHeard(window: readonly string[]): VoiceMove | null {
  const command = COMMANDS.find(({ phrases }) =>
    phrases.some((phrase) => containsCue(window, normalize(phrase))),
  );
  return command?.move ?? null;
}

export const initialVoiceState: VoiceState = {
  finalTokens: [],
  interimTokens: [],
  muteUntilFinal: false,
  lock: null,
};

const EMPTY_WINDOW = { finalTokens: [], interimTokens: [] };

const NO_SLIDE = -1;

export const clearHeard = (state: VoiceState): VoiceState => ({ ...state, ...EMPTY_WINDOW });

function moveHeard(window: readonly string[], input: VoiceInput): VoiceMove {
  const command = commandHeard(window);
  if (command) return command;
  if ((input.cues ?? []).some((cue) => heardCue(window, normalize(cue)))) {
    return { steps: 1, reveal: false };
  }
  const nextHeardWhole = (input.nextCues ?? []).some((cue) => containsCue(window, normalize(cue)));
  return nextHeardWhole ? { steps: 2, reveal: false } : NO_MOVE;
}

function isLocked(lock: VoiceState["lock"], input: VoiceInput): boolean {
  if (!lock) return false;
  return lock.slideIndex === input.slideIndex || input.now < lock.until;
}

const isStill = (move: VoiceMove): boolean => move.steps === 0 && !move.reveal;

export function voiceStep(state: VoiceState, input: VoiceInput): { state: VoiceState } & VoiceMove {
  if (state.muteUntilFinal) {
    return { state: { ...state, ...EMPTY_WINDOW, muteUntilFinal: !input.isFinal }, ...NO_MOVE };
  }
  if (isLocked(state.lock, input)) {
    return { state: { ...state, ...EMPTY_WINDOW }, ...NO_MOVE };
  }

  const tokens = normalize(input.text);
  const finalTokens = input.isFinal
    ? [...state.finalTokens, ...tokens].slice(-WINDOW_SIZE)
    : state.finalTokens;
  const interimTokens = input.isFinal ? [] : tokens;
  const window = [...finalTokens, ...interimTokens].slice(-WINDOW_SIZE);
  const move = moveHeard(window, input);

  if (isStill(move)) {
    return { state: { ...state, finalTokens, interimTokens, lock: null }, ...move };
  }
  const lockedSlide = move.reveal ? NO_SLIDE : input.slideIndex;
  return {
    state: {
      ...EMPTY_WINDOW,
      muteUntilFinal: !input.isFinal,
      lock: { slideIndex: lockedSlide, until: input.now + LOCK_MS },
    },
    ...move,
  };
}
