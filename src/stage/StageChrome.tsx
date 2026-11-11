import { LiveCaption } from "../captions/LiveCaption";
import { slides } from "../talk/slides";
import type { Slide } from "../talk/types";

export function ProgressBar({ index }: { index: number }) {
  return (
    <div className="progress" aria-hidden>
      <span
        className="progress-fill"
        style={{ transform: `scaleX(${(index + 1) / slides.length})` }}
      />
    </div>
  );
}

export function SectionLabel({ slide }: { slide: Slide }) {
  return slide.section ? <p className="section-label">{slide.section}</p> : null;
}

export function CaptionLine() {
  return <LiveCaption className="caption-line" />;
}

const COMMAND_HINT = "“mostra o resultado” · “próximo slide”";

export function CueHint({ slide }: { slide: Slide }) {
  const cue = slide.cues?.[0];
  const text = cue ? `“${cue}”` : slide.interaction ? COMMAND_HINT : "“próximo slide”";
  return (
    <p className="cue-hint" aria-hidden="true">
      {text}
    </p>
  );
}
