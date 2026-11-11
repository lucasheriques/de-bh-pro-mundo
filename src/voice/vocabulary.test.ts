import { describe, expect, it } from "vitest";
import { BIAS_PHRASES, correctTranscript } from "./vocabulary";

describe("correctTranscript", () => {
  it.each([
    ["post hog", "eu trabalho na post hog", "eu trabalho na PostHog"],
    ["posthog joined", "na Post-hog", "na PostHog"],
    ["na gringa", "o na gringa tem dados", "o NaGringa tem dados"],
    ["g dois i", "entrei pela g dois i", "entrei pela G2i"],
    ["g2 i", "pela G2 i", "pela G2i"],
    ["tier misheard", "é tir s e paga mais", "é tier s e paga mais"],
    ["a real aunt stays", "minha tia a vida toda", "minha tia a vida toda"],
    ["untouched speech", "vamos falar de carreira", "vamos falar de carreira"],
  ])("%s", (_label, heard, expected) => {
    expect(correctTranscript(heard)).toBe(expected);
  });
});

describe("BIAS_PHRASES", () => {
  it("includes the talk's names and every slide cue, without duplicates", () => {
    expect(BIAS_PHRASES).toContain("PostHog");
    expect(BIAS_PHRASES).toContain("bora começar");
    expect(new Set(BIAS_PHRASES).size).toBe(BIAS_PHRASES.length);
  });
});
