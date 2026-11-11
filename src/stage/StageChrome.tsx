import { LiveCaption } from "../captions/LiveCaption";
import { slides } from "../talk/slides";
import type { Slide } from "../talk/types";
import { audienceHost, useQrSrc } from "./useQrSrc";

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
  return <LiveCaption className="caption-line" history={1} />;
}

export function CornerQr({ slide }: { slide: Slide }) {
  const src = useQrSrc();
  if (slide.visual.kind === "join" || !src) return null;
  return (
    <div className="corner-qr" aria-hidden="true">
      <img src={src} alt="" />
      <span>{audienceHost}</span>
    </div>
  );
}
