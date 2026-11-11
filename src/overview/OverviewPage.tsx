import { presenterKey } from "../live/env";
import { useDeck } from "../live/useDeck";
import { useStageTheme } from "../live/useStoredToggle";
import { Scaled } from "../stage/Scaled";
import { SlideCanvas } from "../stage/SlideCanvas";
import { slides } from "../talk/slides";
import type { Slide } from "../talk/types";

const canJump = presenterKey.length > 0;

function SlideCard({
  slide,
  index,
  current,
  onJump,
}: {
  slide: Slide;
  index: number;
  current: boolean;
  onJump: () => void;
}) {
  const [theme] = useStageTheme("presenter");
  const number = String(index + 1).padStart(2, "0");
  return (
    <li className={`overview-card ${current ? "is-current" : ""}`} data-slide-id={slide.id}>
      <button
        type="button"
        className="overview-thumb"
        onClick={onJump}
        disabled={!canJump}
        aria-label={`Ir pro slide ${number}`}
      >
        <Scaled theme={theme} className="thumb">
          <SlideCanvas slide={slide} />
        </Scaled>
      </button>
      <p className="overview-meta mono">
        {number} · {slide.section ?? "Sem seção"}
        {current ? " · no telão agora" : ""}
      </p>
      <p className="overview-notes">{slide.notes}</p>
      <p className="overview-cues mono">
        {slide.cues?.length
          ? `Voz: ${slide.cues.map((cue) => `"${cue}"`).join(" ou ")}`
          : "Sem frase de voz: avance no clicker"}
      </p>
    </li>
  );
}

export function OverviewPage() {
  const deck = useDeck();
  return (
    <main className="overview">
      <header className="overview-head">
        <h1>Todos os slides</h1>
        <p className="muted">
          {canJump
            ? "Clique num slide pra levar o telão até ele."
            : "Modo leitura. Entre pelo /admin pra pular slides no telão."}
        </p>
      </header>
      <ol className="overview-grid">
        {slides.map((slide, index) => (
          <SlideCard
            key={slide.id}
            slide={slide}
            index={index}
            current={index === deck.index}
            onJump={() => deck.goTo(index)}
          />
        ))}
      </ol>
    </main>
  );
}
