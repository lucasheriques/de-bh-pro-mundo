import { describe, expect, it } from "vitest";
import { slides } from "../talk/slides";
import {
  clearHeard,
  containsCue,
  initialVoiceState,
  LOCK_MS,
  normalize,
  type VoiceInput,
  type VoiceState,
  voiceStep,
  wordMatches,
  wordsNeeded,
} from "./match";

describe("normalize", () => {
  it.each([
    ["Vamos começar!", ["vamos", "comecar"]],
    ["  O QUE   ficou CARO?  ", ["o", "que", "ficou", "caro"]],
    ["IA, produto & código.", ["ia", "produto", "codigo"]],
    ["", []],
  ])("%j -> %j", (text, tokens) => {
    expect(normalize(text)).toEqual(tokens);
  });
});

describe("wordsNeeded", () => {
  it.each([
    [1, 1],
    [2, 2],
    [3, 3],
    [4, 3],
    [5, 3],
    [6, 4],
    [7, 5],
    [8, 5],
    [9, 6],
    [10, 6],
  ])("a cue of %i words needs %i", (count, needed) => {
    expect(wordsNeeded(count)).toBe(needed);
  });
});

describe("wordMatches", () => {
  it.each([
    ["salário", "salario", true],
    ["julgamento", "julgamentos", true],
    ["repositorio", "repositorios", true],
    ["posthog", "posthoc", true],
    ["comecar", "comecou", false],
    ["bora", "bola", false],
    ["que", "qui", false],
    ["caro", "caros", false],
    ["julgamento", "julgar", false],
  ])("%s ~ %s -> %s", (heard, expected, matches) => {
    expect(wordMatches(...(normalize(`${heard} ${expected}`) as [string, string]))).toBe(matches);
  });
});

describe("containsCue", () => {
  it.each([
    ["exact", "o que ficou caro", "o que ficou caro", true],
    ["accents and case on both sides", "então, VAMOS COMEÇAR agora", "vamos começar", true],
    ["punctuation between words", "o que... ficou, caro?", "o que ficou caro", true],
    ["gap of two tokens", "vamos então já começar", "vamos começar", true],
    ["gap of three tokens is too far", "vamos então eu acho começar", "vamos começar", false],
    ["out of order", "começar vamos", "vamos começar", false],
    ["partial cue", "o que ficou", "o que ficou caro", false],
    ["similar but different word", "vamos comer", "vamos começar", false],
    [
      "later occurrence satisfies the gap",
      "vamos lá pessoal bora vamos começar",
      "vamos começar",
      true,
    ],
    ["empty cue never matches", "qualquer coisa", "", false],
    ["a long word with one typo", "o julgamentos forte", "o julgamento forte", true],
    ["a short word with one typo", "bola começar", "bora começar", false],
  ])("%s", (_label, spoken, cue, expected) => {
    expect(containsCue(normalize(spoken), normalize(cue))).toBe(expected);
  });
});

function run(inputs: Array<Partial<VoiceInput> & { text: string }>) {
  let state = initialVoiceState;
  return inputs.map((input) => {
    const result = voiceStep(state, {
      isFinal: false,
      now: 0,
      slideIndex: 0,
      cues: ["o que ficou caro"],
      nextCues: undefined,
      ...input,
    });
    state = result.state;
    return result.steps > 0;
  });
}

describe("voiceStep", () => {
  it.each([
    ["cue in one interim", [{ text: "e aí o que ficou caro" }], [true]],
    [
      "cue split across interim updates fires at 60% and ignores the rest",
      [{ text: "o que" }, { text: "o que ficou" }, { text: "o que ficou caro" }],
      [false, true, false],
    ],
    [
      "cue split across a final and the next interim",
      [{ text: "bom o que", isFinal: true }, { text: "ficou caro" }],
      [false, true],
    ],
    ["slide without cues never advances", [{ text: "o que ficou caro", cues: [] }], [false]],
    [
      "any of several cues",
      [{ text: "próximo slide", cues: ["o que ficou caro", "próximo slide"] }],
      [true],
    ],
    [
      "the rest of the triggering utterance is ignored",
      [
        { text: "o que ficou caro" },
        { text: "o que ficou caro né", slideIndex: 1, now: 2500 },
        { text: "o que ficou caro né", isFinal: true, slideIndex: 1, now: 2600 },
        { text: "o que ficou caro", slideIndex: 1, now: 2700 },
      ],
      [true, false, false, true],
    ],
    [
      "locked until the slide index changes",
      [
        { text: "o que ficou caro" },
        { text: "x", isFinal: true },
        { text: "o que ficou caro", now: 5000 },
      ],
      [true, false, false],
    ],
    [
      "locked for two seconds after the index changes",
      [
        { text: "o que ficou caro" },
        { text: "x", isFinal: true, slideIndex: 1, now: 100 },
        { text: "o que ficou caro", slideIndex: 1, now: 1900 },
        { text: "o que ficou caro", slideIndex: 1, now: 2100 },
      ],
      [true, false, false, true],
    ],
    [
      "speech during the lock does not carry over",
      [
        { text: "o que ficou caro" },
        { text: "x", isFinal: true, slideIndex: 1, now: 100 },
        { text: "o que ficou", isFinal: true, slideIndex: 1, now: 1000 },
        { text: "caro", slideIndex: 1, now: 2100 },
      ],
      [true, false, false, false],
    ],
  ])("%s", (_label, inputs, expected) => {
    expect(run(inputs)).toEqual(expected);
  });

  it("keeps only the last 25 tokens in the window", () => {
    const filler = Array.from({ length: 30 }, (_, i) => `p${i}`).join(" ");
    const steps = run([
      { text: "o que", isFinal: true },
      { text: filler, isFinal: true },
      { text: "ficou caro" },
    ]);
    expect(steps).toEqual([false, false, false]);
  });
});

const NEXT_CUE = ["provar com salário agora mesmo"];

function stepsFor(spoken: string, overrides: Partial<VoiceInput> = {}): number {
  return voiceStep(initialVoiceState, {
    text: spoken,
    isFinal: true,
    now: 0,
    slideIndex: 0,
    cues: ["vai ser o de vocês"],
    nextCues: NEXT_CUE,
    ...overrides,
  }).steps;
}

describe("partial cues", () => {
  it.each([
    ["60% in order fires", "vai ser o", 1],
    ["the full cue fires", "vai ser o de vocês", 1],
    ["2 of 5 words does not fire", "vai ser", 0],
    ["words out of order do not fire", "o ser vai", 0],
  ])("%s", (_label, spoken, steps) => {
    expect(stepsFor(spoken)).toBe(steps);
  });
});

describe("lookahead recovery", () => {
  it.each([
    ["own cue wins", "vai ser o de vocês provar com salário agora mesmo", 1],
    ["next cue heard whole skips two", "então vamos provar com salário agora mesmo", 2],
    ["next cue fuzzy", "provar com salarios agora mesmos", 2],
    ["next cue partly heard does not skip", "provar com salário agora", 0],
  ])("%s", (_label, spoken, steps) => {
    expect(stepsFor(spoken, { isFinal: false })).toBe(steps);
  });

  it("never looks ahead without next cues", () => {
    expect(stepsFor("provar com salário agora mesmo", { nextCues: undefined })).toBe(0);
  });

  it("a corrected interim resend cannot fire twice", () => {
    const spoken = [
      "provar com salário agora mesmo",
      "provar com salários agora mesmo",
      "provar com salário agora mesmo né",
    ];
    let state: VoiceState = initialVoiceState;
    const results = spoken.map((text, i) => {
      const result = voiceStep(state, {
        text,
        isFinal: false,
        now: i * 100,
        slideIndex: 0,
        cues: ["vai ser o de vocês"],
        nextCues: NEXT_CUE,
      });
      state = result.state;
      return result.steps;
    });
    expect(results).toEqual([2, 0, 0]);
  });
});

describe("clearHeard", () => {
  it("forgets heard words but keeps the lock", () => {
    const heard: VoiceState = {
      finalTokens: ["vai", "ser"],
      interimTokens: ["o"],
      muteUntilFinal: true,
      lock: { slideIndex: 3, until: 100 },
    };
    expect(clearHeard(heard)).toEqual({ ...heard, finalTokens: [], interimTokens: [] });
  });
});

const WORD_MS = 250;
const UTTERANCE_WORDS = 7;
const COMMAND_PAUSE_MS = 3000;

type Chunk = { slide: number; words: string[] };
type Replay = { visited: number[]; aheadOfSpeaker: boolean };

function scriptOf(skippedCueOf?: number): Chunk[] {
  return slides.map((slide, index) => {
    const notes = slide.notes.join(". ");
    const spoken = index === skippedCueOf ? notes : `${notes} ${slide.cues?.[0] ?? ""}`;
    return { slide: index, words: spoken.split(/\s+/).filter(Boolean) };
  });
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function garble(word: string, random: () => number): string {
  const at = Math.floor(random() * word.length);
  const letter = String.fromCharCode(97 + Math.floor(random() * 26));
  return word.slice(0, at) + letter + word.slice(at + 1);
}

function noisy(chunks: Chunk[], seed: number): Chunk[] {
  const random = mulberry32(seed);
  return chunks.map(({ slide, words }) => ({
    slide,
    words: words
      .filter(() => random() >= 0.08)
      .map((word) => (random() < 0.06 ? garble(word, random) : word)),
  }));
}

function replay(chunks: Chunk[]): Replay {
  let state: VoiceState = initialVoiceState;
  let index = 0;
  let now = 0;
  const visited = [0];
  let aheadOfSpeaker = false;

  const moveTo = (target: number, speaker: number) => {
    index = Math.min(target, slides.length - 1);
    state = clearHeard(state);
    visited.push(index);
    aheadOfSpeaker ||= index > speaker + 1;
  };
  const hear = (text: string, isFinal: boolean, speaker: number) => {
    now += WORD_MS;
    const result = voiceStep(state, {
      text,
      isFinal,
      now,
      slideIndex: index,
      cues: slides[index]?.cues,
      nextCues: slides[index + 1]?.cues,
    });
    state = result.state;
    if (result.steps > 0) moveTo(index + result.steps, speaker);
  };

  for (const { slide, words } of chunks) {
    for (let from = 0; from < words.length; from += UTTERANCE_WORDS) {
      const utterance = words.slice(from, from + UTTERANCE_WORDS);
      for (let spoken = 1; spoken <= utterance.length; spoken++) {
        hear(utterance.slice(0, spoken).join(" "), false, slide);
      }
      hear(utterance.join(" "), true, slide);
    }
    // A missed cue is what "próximo slide" is for: the speaker pauses, then says it.
    if (index === slide && slide < slides.length - 1) {
      now += COMMAND_PAUSE_MS;
      hear("próximo slide", true, slide);
    }
  }
  return { visited, aheadOfSpeaker };
}

const ascending = (visited: number[]) =>
  visited.every((v, i) => i === 0 || v > (visited[i - 1] ?? 0));

describe("script replay", () => {
  it("visits every slide in order and never runs ahead", () => {
    const { visited, aheadOfSpeaker } = replay(scriptOf());
    expect(aheadOfSpeaker).toBe(false);
    expect(visited).toEqual(slides.map((_, i) => i));
  });

  const cued = slides.flatMap((slide, i) => (slide.cues?.length ? [[slide.id, i] as const] : []));
  it.each(cued)("with the cue of %s skipped the deck never runs ahead", (_id, skipped) => {
    const { visited, aheadOfSpeaker } = replay(scriptOf(skipped));
    expect(aheadOfSpeaker).toBe(false);
    expect(ascending(visited)).toBe(true);
  });

  const seeds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const noisyRuns = seeds.map((seed) => replay(noisy(scriptOf(), seed)));

  it.each(
    seeds,
  )("noisy speech (8%% dropped, 6%% garbled) with seed %i never runs ahead", (seed) => {
    const { visited, aheadOfSpeaker } = noisyRuns[seed - 1] ?? {
      visited: [],
      aheadOfSpeaker: true,
    };
    expect(aheadOfSpeaker).toBe(false);
    expect(ascending(visited)).toBe(true);
  });

  it("noisy speech still reaches the last slide on most seeds", () => {
    const reachedEnd = noisyRuns.filter(({ visited }) => visited.includes(slides.length - 1));
    expect(reachedEnd.length).toBeGreaterThanOrEqual(7);
  });
});

describe("spoken commands", () => {
  const moveFor = (spoken: string, cues?: string[]) =>
    voiceStep(initialVoiceState, {
      text: spoken,
      isFinal: true,
      now: 0,
      slideIndex: 3,
      cues,
      nextCues: undefined,
    });

  it.each([
    ["próximo slide", "e agora, próximo slide", 1, false],
    ["pra frente", "bora, pra frente", 1, false],
    ["slide seguinte", "slide seguinte por favor", 1, false],
    ["volta um", "opa, volta um", -1, false],
    ["volta slide", "volta slide aí", -1, false],
    ["slide anterior", "me dá o slide anterior", -1, false],
    ["mostra o resultado", "beleza, mostra o resultado", 0, true],
    ["accent-free transcription", "proximo slide", 1, false],
    ["mostrar resultado", "mostrar resultado", 0, true],
    ["mostrar resultados", "pode mostrar resultados", 0, true],
    ["mostra resultado", "mostra resultado aí", 0, true],
    ["revela o resultado", "revela o resultado", 0, true],
    ["voltar slide", "voltar slide", -1, false],
    ["volta pro slide anterior", "volta pro slide anterior", -1, false],
    ["voltar um", "voltar um", -1, false],
    ["próximo, plural", "próximos slides", 1, false],
    ["passa o slide", "passa o slide", 1, false],
    ["avança o slide", "avança o slide", 1, false],
    ["ordinary speech", "a frente de trabalho voltou", 0, false],
    ["ordinary speech about results", "o resultado do negócio é o que importa", 0, false],
    ["ordinary speech with próximo", "o próximo passo é mandar mensagem", 0, false],
  ])("%s", (_label, spoken, steps, reveal) => {
    const move = moveFor(spoken);
    expect({ steps: move.steps, reveal: move.reveal }).toEqual({ steps, reveal });
  });

  it("works on slides without a cue, such as polls", () => {
    expect(moveFor("próximo slide", undefined).steps).toBe(1);
  });

  it("a reveal does not lock the slide, so its cue still advances after the lock", () => {
    const revealed = moveFor("mostra o resultado");
    const after = voiceStep(revealed.state, {
      text: "vai ser o de vocês",
      isFinal: true,
      now: LOCK_MS + 1,
      slideIndex: 3,
      cues: ["vai ser o de vocês"],
      nextCues: undefined,
    });
    expect(after.steps).toBe(1);
  });
});
