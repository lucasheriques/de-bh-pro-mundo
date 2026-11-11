import { useQuery } from "convex/react";
import { useEffect, useRef } from "react";
import { api } from "../../convex/_generated/api";
import { LiveCaption } from "../captions/LiveCaption";
import { clientId } from "../live/env";
import { useCaptionsEnabled } from "../live/features";
import { DESKTOP_QUERY, useMediaQuery } from "../live/useMediaQuery";
import { QuestionList } from "./QuestionList";
import { AskForm } from "./QuestionsPanel";

function useQuestions() {
  return useQuery(api.questions.list, { clientId }) ?? [];
}

function newestOf<T extends { createdAt: number }>(items: readonly T[]): T | undefined {
  return items.reduce<T | undefined>(
    (newest, item) => (!newest || item.createdAt > newest.createdAt ? item : newest),
    undefined,
  );
}

function QuestionsBar({ onOpen }: { onOpen: () => void }) {
  const questions = useQuestions();
  const newest = newestOf(questions);
  return (
    <button type="button" className="questions-bar" onClick={onOpen}>
      <span className="questions-bar-count">
        Perguntas <span className="mono">{questions.length}</span>
      </span>
      <span className="questions-bar-ticker" aria-live="polite">
        {newest ? (
          <span key={newest._id} className="questions-bar-latest">
            {newest.text}
          </span>
        ) : (
          <span className="questions-bar-latest muted">Toque pra perguntar</span>
        )}
      </span>
    </button>
  );
}

export function QuestionsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={ref} className="questions-sheet" aria-label="Perguntas da sala" onClose={onClose}>
      <header className="questions-sheet-head">
        <p className="eyebrow">Perguntas da sala</p>
        <button type="button" className="ghost" onClick={onClose}>
          Fechar
        </button>
      </header>
      <div className="questions-sheet-body">
        {open ? (
          <>
            <AskForm />
            <QuestionList />
          </>
        ) : null}
      </div>
    </dialog>
  );
}

/** The captions' own label and switch, right where the captions appear. */
function CaptionsHead({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div className="captions-head-row">
      <span className="captions-head-label">
        <span className="captions-live-dot" data-on={on || undefined} aria-hidden="true" />
        {on ? "Legendas ao vivo" : "Legendas desligadas"}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label="Legendas"
        className="captions-switch"
        onClick={onToggle}
      >
        {on ? "Esconder" : "Mostrar"}
      </button>
    </div>
  );
}

export function PhoneDock({
  captions,
  showQuestions,
  onOpenQuestions,
  onToggleCaptions,
}: {
  captions: boolean;
  showQuestions: boolean;
  onOpenQuestions: () => void;
  onToggleCaptions: () => void;
}) {
  const desktop = useMediaQuery(DESKTOP_QUERY);
  const captionsOn = useCaptionsEnabled();
  return (
    <div className="phone-dock">
      {captionsOn ? <CaptionsHead on={captions} onToggle={onToggleCaptions} /> : null}
      {captionsOn && captions ? <LiveCaption className="caption-strip" history={8} /> : null}
      {showQuestions && desktop ? (
        <section className="dock-questions" aria-label="Perguntas da sala">
          <p className="eyebrow">Perguntas da sala</p>
          <AskForm />
          <QuestionList />
        </section>
      ) : null}
      {showQuestions && !desktop ? <QuestionsBar onOpen={onOpenQuestions} /> : null}
    </div>
  );
}
