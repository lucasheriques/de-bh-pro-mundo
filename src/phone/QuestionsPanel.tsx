import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { type KeyboardEvent, useMemo, useState } from "react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { QUESTION_MAX_LENGTH } from "../../convex/validators";
import { clientId } from "../live/env";
import { QuestionList } from "./QuestionList";

type AskStatus = "idle" | "sending" | "sent" | "error";

const STATUS_NOTE: Partial<Record<AskStatus, string>> = {
  sent: "Pergunta enviada",
  error: "Não foi, tenta de novo",
};

function submitOnEnter(event: KeyboardEvent<HTMLTextAreaElement>): void {
  const isPlainEnter = event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing;
  if (!isPlainEnter) return;
  event.preventDefault();
  event.currentTarget.form?.requestSubmit();
}

function useAsk() {
  const rawAsk = useMutation(api.questions.ask);
  return useMemo(
    () =>
      rawAsk.withOptimisticUpdate((store, args) => {
        const list = store.getQuery(api.questions.list, { clientId });
        if (!list) return;
        const pending = {
          _id: `pending-${Date.now()}` as Id<"questions">,
          text: args.text,
          voteCount: 0,
          createdAt: Date.now(),
          authorName: store.getQuery(api.audience.me, { clientId }) ?? null,
          mine: true,
        };
        store.setQuery(api.questions.list, { clientId }, [...list, pending]);
      }),
    [rawAsk],
  );
}

export function AskForm({ onSent }: { onSent?: () => void }) {
  const ask = useAsk();
  const [text, setText] = useState("");
  const [status, setStatus] = useState<AskStatus>("idle");
  const [reason, setReason] = useState<string | null>(null);
  const trimmed = text.trim();
  const sending = status === "sending";

  const submit = async () => {
    if (!trimmed || sending) return;
    setStatus("sending");
    try {
      await ask({ clientId, text: trimmed });
      setText("");
      setStatus("sent");
      onSent?.();
    } catch (error) {
      setReason(error instanceof ConvexError && typeof error.data === "string" ? error.data : null);
      setStatus("error");
    }
  };

  return (
    <form
      className="ask"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <textarea
        value={text}
        maxLength={QUESTION_MAX_LENGTH}
        rows={3}
        enterKeyHint="send"
        autoCapitalize="sentences"
        onKeyDown={submitOnEnter}
        aria-label="Sua pergunta"
        placeholder="O que você quer perguntar?"
        onChange={(event) => {
          setText(event.target.value);
          if (!sending) setStatus("idle");
        }}
      />
      <div className="ask-row">
        <span className="mono muted">
          {(status === "error" && reason) ||
            STATUS_NOTE[status] ||
            `${trimmed.length}/${QUESTION_MAX_LENGTH}`}
        </span>
        <button type="submit" className="primary" disabled={!trimmed || sending}>
          {sending ? "Mandando…" : "Mandar pergunta"}
        </button>
      </div>
    </form>
  );
}

export function QuestionsPanel() {
  return (
    <section className="panel">
      <p className="eyebrow">Perguntas</p>
      <AskForm />
      <QuestionList />
    </section>
  );
}
