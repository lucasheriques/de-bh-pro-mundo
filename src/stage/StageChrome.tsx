import type { CSSProperties } from "react";
import { LiveCaption } from "../captions/LiveCaption";
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
  return <LiveCaption className="caption-line" history={1} />;
}

export function CornerQr({ slide }: { slide: Slide }) {
  if (slide.visual.kind === "join") return null;
  return (
    <div className="corner-qr" aria-hidden="true">
      <StyledQr className="qr" />
      <span className="corner-qr-copy">
        Entre e participe
        <strong>{audienceHost}</strong>
      </span>
    </div>
  );
}
