import { CueBanner } from "../live/CueBanner";
import { NoteList } from "../live/NoteList";
import { pollIdOf, slideAt, useDeck } from "../live/useDeck";
import { slides } from "../talk/slides";

function headline(index: number): string {
  const visual = slideAt(index).visual;
  if ("title" in visual) return visual.title;
  if ("text" in visual) return visual.text;
  if ("value" in visual) return visual.value;
  const interaction = slideAt(index).interaction;
  return interaction && "question" in interaction ? interaction.question : slideAt(index).id;
}

export function RemotePage() {
  const deck = useDeck();
  if (deck.keyValid !== true) {
    return (
      <main className="remote">
        <p className="muted">Entre pelo /admin com a chave da talk neste celular.</p>
      </main>
    );
  }
  const pollId = pollIdOf(deck.slide);
  const revealed = pollId ? (deck.session.revealed[pollId] ?? false) : false;
  const hasNext = deck.index + 1 < slides.length;
  return (
    <main className="remote">
      <header className="remote-head">
        <p className="mono muted">
          {deck.index + 1} / {slides.length} · {deck.slide.section ?? ""}
        </p>
        <h1>{headline(deck.index)}</h1>
        {hasNext ? <p className="muted">A seguir: {headline(deck.index + 1)}</p> : null}
      </header>
      <CueBanner slide={deck.slide} />
      <div className="remote-buttons">
        {pollId ? (
          <button type="button" className="remote-reveal" onClick={deck.toggleReveal}>
            {revealed ? "Esconder resultado" : "Mostrar resultado"}
          </button>
        ) : null}
        <button
          type="button"
          className="remote-prev"
          onClick={deck.prev}
          disabled={deck.index === 0}
        >
          Voltar
        </button>
        <button type="button" className="remote-next" onClick={deck.next} disabled={!hasNext}>
          Próximo
        </button>
      </div>
      <NoteList notes={deck.slide.notes} className="remote-notes" />
    </main>
  );
}
