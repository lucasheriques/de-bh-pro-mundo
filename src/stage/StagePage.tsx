import { presenterKey } from "../live/env";
import { useCaptionsEnabled } from "../live/features";
import { toggleFullscreen, useDeck, useDeckKeys } from "../live/useDeck";
import { useStageTheme, useStoredToggle } from "../live/useStoredToggle";
import { slides } from "../talk/slides";
import { ReactionsLayer } from "./Reactions";
import { Scaled } from "./Scaled";
import { SlideCanvas } from "./SlideCanvas";
import { CaptionLine, CornerQr, CueHint, ProgressBar, SectionLabel } from "./StageChrome";
import { useSlideHash, useSlidePreview } from "./useSlideUrl";

const CAPTION_STATES = ["off", "on"] as const;
const CUE_STATES = ["on", "off"] as const;

export function StagePage() {
  const deck = useDeck();
  const [captions, toggleCaptions] = useStoredToggle("puc-ia-2026:stage-captions", CAPTION_STATES);
  const [theme, toggleTheme] = useStageTheme("stage");
  const [cues, toggleCues] = useStoredToggle("puc-ia-2026:stage-cues", CUE_STATES);
  const preview = useSlidePreview();
  const captionsOn = useCaptionsEnabled();
  const showCaptions = captionsOn && captions === "on";
  const index = preview?.index ?? deck.index;
  const slide = slides[index] ?? deck.slide;
  useSlideHash(slide.id, preview === null);

  useDeckKeys({
    next: preview?.next ?? deck.next,
    prev: preview?.prev ?? deck.prev,
    reveal: deck.toggleReveal,
    voice: deck.toggleVoice,
    fullscreen: toggleFullscreen,
    captions: toggleCaptions,
    theme: toggleTheme,
    cues: toggleCues,
  });

  return (
    <main className="stage" data-theme={theme} data-slide-index={index} data-slide-id={slide.id}>
      <Scaled theme={theme}>
        <SectionLabel slide={slide} />
        <SlideCanvas slide={slide} />
        <ReactionsLayer />
        {showCaptions ? <CaptionLine /> : null}
        {/* The caption box covers the bottom-left corner, so the cue steps aside for it */}
        {cues === "on" && deck.session.voiceEnabled && !showCaptions ? (
          <CueHint slide={slide} isLast={index === slides.length - 1} />
        ) : null}
        <CornerQr slide={slide} />
        <ProgressBar index={index} />
      </Scaled>
      <div className="stage-status">
        {preview ? (
          <span className="status-warning">Prévia: {slide.id} · ← → navegam, a sala não muda</span>
        ) : null}
        {/* A stage without a key is a display-only mirror, not an error worth projecting */}
        {presenterKey && deck.keyValid === false ? (
          <span className="status-warning">Chave de apresentador inválida</span>
        ) : null}
        {deck.error && deck.keyValid !== false ? (
          <span className="status-warning">{deck.error}</span>
        ) : null}
      </div>
    </main>
  );
}
