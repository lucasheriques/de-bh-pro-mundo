import type { Slide } from "../talk/types";

/** What to say to move on from this slide, for the presenter's eyes only. */
export function cueText(slide: Slide): string {
  const cue = slide.cues?.[0];
  if (cue) return `“${cue}”`;
  if (slide.interaction && slide.interaction.kind !== "questions") {
    return "“mostra o resultado”, depois “próximo slide”";
  }
  return "“próximo slide”";
}

export function CueBanner({ slide }: { slide: Slide }) {
  return (
    <p className="cue-banner">
      <span className="eyebrow">Fala pra avançar</span>
      <span className="cue-banner-text">{cueText(slide)}</span>
    </p>
  );
}
