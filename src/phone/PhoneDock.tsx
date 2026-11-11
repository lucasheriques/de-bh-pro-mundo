import { useQuery } from "convex/react";
import { useEffect, useRef } from "react";
import { api } from "../../convex/_generated/api";
import { LiveCaption } from "../captions/LiveCaption";
import { clientId } from "../live/env";
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

export function PhoneDock({
  captions,
  showQuestions,
  onOpenQuestions,
}: {
  captions: boolean;
  showQuestions: boolean;
  onOpenQuestions: () => void;
}) {
  if (!captions && !showQuestions) return null;
  return (
    <div className="phone-dock">
      {captions ? <LiveCaption className="caption-strip" history={3} /> : null}
      {showQuestions ? <QuestionsBar onOpen={onOpenQuestions} /> : null}
    </div>
  );
}
