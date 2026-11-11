import type { CSSProperties } from "react";
import { LiveCaption } from "../captions/LiveCaption";
import { StageCountdown, usePollCountdown } from "../live/PollCountdown";
import { slides } from "../talk/slides";
import type { Slide } from "../talk/types";
import { audienceHost, StyledQr } from "./StyledQr";

export function ProgressBar({ index }: { index: number }) {
  return (
    <div
      className="progress"
      aria-hidden
      style={{ "--slides": slides.length, "--share": (index + 1) / slides.length } as CSSProperties}
    >
      <span className="progress-fill" />
    </div>
  );
}

export function SectionLabel({ slide }: { slide: Slide }) {
  if (!slide.section || slide.visual.kind === "section") return null;
  return <p className="section-label">{slide.section}</p>;
}

export function CaptionLine() {
  return <LiveCaption className="caption-line" history={2} />;
}

function pollIdOf(slide: Slide): string {
  const interaction = slide.interaction;
  return slide.visual.kind === "results" && interaction && interaction.kind !== "questions"
    ? interaction.pollId
    : "";
}

/** The join QR on every slide; while a poll counts down it grows and carries the timer. */
export function CornerQr({ slide }: { slide: Slide }) {
  const countdown = usePollCountdown(pollIdOf(slide));
  if (slide.visual.kind === "join") return null;
  return (
    <div className="corner-qr" data-voting={countdown ? "true" : undefined} aria-hidden="true">
      <StyledQr className="qr" />
      <span className="corner-qr-copy">
        {countdown ? "Vote pelo celular" : "Entre e participe"}
        <strong>{audienceHost}</strong>
        {countdown ? <StageCountdown countdown={countdown} /> : null}
      </span>
    </div>
  );
}
