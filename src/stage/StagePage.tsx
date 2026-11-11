import { toggleFullscreen, useDeck, useDeckKeys } from "../live/useDeck";
import { useStageTheme, useStoredToggle } from "../live/useStoredToggle";
import { ReactionsLayer } from "./Reactions";
import { Scaled } from "./Scaled";
import { SlideCanvas } from "./SlideCanvas";
import { CaptionLine, CornerQr, ProgressBar, SectionLabel } from "./StageChrome";

const CAPTION_STATES = ["off", "on"] as const;

export function StagePage() {
  const deck = useDeck();
  const [captions, toggleCaptions] = useStoredToggle("puc-ia-2026:stage-captions", CAPTION_STATES);
  const [theme, toggleTheme] = useStageTheme("stage");

  useDeckKeys({
    next: deck.next,
    prev: deck.prev,
    reveal: deck.toggleReveal,
    voice: deck.toggleVoice,
    fullscreen: toggleFullscreen,
    captions: toggleCaptions,
    theme: toggleTheme,
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
        <CornerQr slide={deck.slide} />
        <ProgressBar index={deck.index} />
      </Scaled>
      <div className="stage-status">
        {deck.keyValid === false ? (
          <span className="status-warning">Chave de apresentador inválida</span>
        ) : null}
        {deck.error && deck.keyValid !== false ? (
          <span className="status-warning">{deck.error}</span>
        ) : null}
      </div>
    </main>
  );
}
