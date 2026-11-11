import { ConnectionDot } from "../live/ConnectionDot";
import { toggleFullscreen, useDeck, useDeckKeys } from "../live/useDeck";
import { useStageTheme, useStoredToggle } from "../live/useStoredToggle";
import { ReactionsLayer } from "./Reactions";
import { Scaled } from "./Scaled";
import { SlideCanvas } from "./SlideCanvas";
import { CaptionLine, CueHint, ProgressBar, SectionLabel } from "./StageChrome";

const CAPTION_STATES = ["off", "on"] as const;
const CUE_STATES = ["on", "off"] as const;

export function StagePage() {
  const deck = useDeck();
  const [captions, toggleCaptions] = useStoredToggle("puc-ia-2026:stage-captions", CAPTION_STATES);
  const [theme, toggleTheme] = useStageTheme("stage");
  const [cues, toggleCues] = useStoredToggle("puc-ia-2026:stage-cues", CUE_STATES);

  useDeckKeys({
    next: deck.next,
    prev: deck.prev,
    reveal: deck.toggleReveal,
    voice: deck.toggleVoice,
    fullscreen: toggleFullscreen,
    captions: toggleCaptions,
    theme: toggleTheme,
    cues: toggleCues,
  });

  return (
    <main
      className="stage"
      data-theme={theme}
      data-slide-index={deck.index}
      data-slide-id={deck.slide.id}
    >
      <Scaled theme={theme}>
        <SectionLabel slide={deck.slide} />
        <SlideCanvas slide={deck.slide} />
        <ReactionsLayer />
        {captions === "on" ? <CaptionLine /> : null}
        {cues === "on" ? <CueHint slide={deck.slide} /> : null}
        <ProgressBar index={deck.index} />
      </Scaled>
      <div className="stage-status">
        {deck.keyValid === false ? (
          <span className="status-warning">Chave de apresentador inválida</span>
        ) : null}
        {deck.error && deck.keyValid !== false ? (
          <span className="status-warning">{deck.error}</span>
        ) : null}
        {deck.session.voiceEnabled ? <span className="status-chip">Voz ligada</span> : null}
        <ConnectionDot />
      </div>
    </main>
  );
}
