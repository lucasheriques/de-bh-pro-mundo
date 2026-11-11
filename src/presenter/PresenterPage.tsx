import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ConnectionDot } from "../live/ConnectionDot";
import { CueBanner } from "../live/CueBanner";
import { presenterKey } from "../live/env";
import { NoteList } from "../live/NoteList";
import { Roster } from "../live/Roster";
import { Shortcuts } from "../live/Shortcuts";
import {
  type Deck,
  pollIdOf,
  slideAt,
  toggleFullscreen,
  useDeck,
  useDeckKeys,
} from "../live/useDeck";
import { type StageTheme, useStageTheme } from "../live/useStoredToggle";
import { Scaled } from "../stage/Scaled";
import { SlideCanvas } from "../stage/SlideCanvas";
import { formatValue } from "../talk/format";
import { tallyMatch } from "../talk/match";
import { slides } from "../talk/slides";
import { countChoices, median, numericValues } from "../talk/stats";
import type { Interaction, Slide } from "../talk/types";
import { Timer } from "./Timer";
import { VoiceHud } from "./VoiceHud";

function PollSummary({ slide }: { slide: Slide }) {
  const pollId = pollIdOf(slide) ?? "";
  const tally = useQuery(api.votes.tally, pollId ? { pollId } : "skip") ?? [];
  const resetPoll = useMutation(api.votes.resetPoll);
  const interaction = slide.interaction;
  if (!interaction || interaction.kind === "questions") return null;
  const reset = () => {
    if (window.confirm("Zerar todos os votos dessa pergunta?")) {
      void resetPoll({ key: presenterKey, pollId: interaction.pollId }).catch(() => undefined);
    }
  };
  return (
    <section className="presenter-card">
      <header className="presenter-card-head">
        <p className="eyebrow">
          Votação · {tally.length} {tally.length === 1 ? "voto" : "votos"}
        </p>
        <button type="button" className="ghost" onClick={reset}>
          Zerar votação
        </button>
      </header>
      {interaction.kind === "choice" ? (
        <ChoiceTally interaction={interaction} tally={tally} />
      ) : null}
      {interaction.kind === "guess" ? <GuessTally interaction={interaction} tally={tally} /> : null}
      {interaction.kind === "match" ? <MatchTally interaction={interaction} tally={tally} /> : null}
    </section>
  );
}

type Tally = Parameters<typeof numericValues>[0];

function MatchTally({
  interaction,
  tally,
}: {
  interaction: Extract<Interaction, { kind: "match" }>;
  tally: Tally;
}) {
  return (
    <ul className="poll-summary">
      {tallyMatch(tally, interaction).map((row) => (
        <li key={row.item.id}>
          <span>{row.item.name}</span>
          <span className="mono">{Math.round(row.correctShare * 100)}% acertando</span>
        </li>
      ))}
    </ul>
  );
}

function ChoiceTally({
  interaction,
  tally,
}: {
  interaction: Extract<Interaction, { kind: "choice" }>;
  tally: Tally;
}) {
  return (
    <ul className="poll-summary">
      {countChoices(tally, interaction.options).map((option) => (
        <li key={option.id}>
          <span>{option.label}</span>
          <span className="mono">
            {option.count} · {Math.round(option.share * 100)}%
          </span>
        </li>
      ))}
    </ul>
  );
}

function GuessTally({
  interaction,
  tally,
}: {
  interaction: Extract<Interaction, { kind: "guess" }>;
  tally: Tally;
}) {
  const crowd = median(numericValues(tally));
  return (
    <p className="mono">
      Mediana {crowd === null ? "-" : formatValue(crowd, interaction.format)} · resposta{" "}
      {formatValue(interaction.answer, interaction.format)}
    </p>
  );
}

function Moderation() {
  const questions = useQuery(api.questions.list, {}) ?? [];
  const hide = useMutation(api.questions.hide);
  return (
    <section className="presenter-card">
      <p className="eyebrow">Perguntas · {questions.length}</p>
      <ol className="moderation">
        {questions.map((question) => (
          <li key={question._id}>
            <span className="mono">{question.voteCount}</span>
            <p>
              {question.text}
              {question.authorName ? (
                <span className="question-author"> · {question.authorName}</span>
              ) : null}
            </p>
            <button
              type="button"
              className="ghost"
              onClick={() =>
                void hide({ key: presenterKey, questionId: question._id }).catch(() => undefined)
              }
            >
              Ocultar
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}

const pad = (n: number) => String(n).padStart(2, "0");

function TopBar({ deck }: { deck: Deck }) {
  const audience = useQuery(api.presence.onlineCount) ?? 0;
  const section = deck.slide.section ? ` · ${deck.slide.section}` : "";
  return (
    <header className="presenter-top">
      <p className="mono">
        {pad(deck.index + 1)} / {pad(slides.length)}
        {section}
      </p>
      <Timer started={deck.index > 0} />
      <p className="mono">{audience} na sala</p>
      <ConnectionDot />
    </header>
  );
}

function Controls({ deck }: { deck: Deck }) {
  const pollId = pollIdOf(deck.slide);
  const revealed = pollId ? (deck.session.revealed[pollId] ?? false) : false;
  return (
    <div className="presenter-controls">
      <button type="button" className="ghost" onClick={deck.prev}>
        Anterior
      </button>
      {pollId ? (
        <button
          type="button"
          className={revealed ? "ghost" : "primary"}
          onClick={deck.toggleReveal}
        >
          {revealed ? "Esconder resultado" : "Revelar resultado"}
        </button>
      ) : null}
      <button type="button" className="primary" onClick={deck.next}>
        Próximo
      </button>
    </div>
  );
}

function NextPreview({ index, theme }: { index: number; theme: StageTheme }) {
  if (index + 1 >= slides.length) return <p className="eyebrow">Último slide</p>;
  return (
    <div className="next-wrap">
      <p className="eyebrow">A seguir</p>
      <Scaled theme={theme} className="thumb thumb-next">
        <SlideCanvas slide={slideAt(index + 1)} />
      </Scaled>
    </div>
  );
}

function Notes({ slide }: { slide: Slide }) {
  return (
    <section className="presenter-notes">
      <CueBanner slide={slide} />
      <p className="eyebrow">Notas</p>
      <NoteList notes={slide.notes} className="notes" />
    </section>
  );
}

export function PresenterPage() {
  const deck = useDeck();
  const [theme, toggleTheme] = useStageTheme("presenter");

  useDeckKeys({
    next: deck.next,
    prev: deck.prev,
    reveal: deck.toggleReveal,
    voice: deck.toggleVoice,
    fullscreen: toggleFullscreen,
    theme: toggleTheme,
  });

  return (
    <main className="presenter" data-slide-index={deck.index} data-slide-id={deck.slide.id}>
      <TopBar deck={deck} />
      {deck.keyValid === false ? (
        <p className="status-warning">
          Sem chave de apresentador neste navegador. Entre pelo /admin.
        </p>
      ) : null}
      <div className="presenter-grid">
        <div className="presenter-slides">
          <Scaled theme={theme} className="thumb thumb-current">
            <SlideCanvas slide={deck.slide} />
          </Scaled>
          <Controls deck={deck} />
          <NextPreview index={deck.index} theme={theme} />
        </div>
        <div className="presenter-side">
          <Notes slide={deck.slide} />
          <VoiceHud deck={deck} />
          <PollSummary slide={deck.slide} />
          <Roster />
          <Moderation />
          <Shortcuts className="presenter-card" />
        </div>
      </div>
    </main>
  );
}
