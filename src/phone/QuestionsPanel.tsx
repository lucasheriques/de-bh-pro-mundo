import { useMutation } from "convex/react";
import { type KeyboardEvent, useState } from "react";
import { api } from "../../convex/_generated/api";
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

export function AskForm({ onSent }: { onSent?: () => void }) {
  const ask = useMutation(api.questions.ask);
  const [text, setText] = useState("");
  const [status, setStatus] = useState<AskStatus>("idle");
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
    } catch {
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
        placeholder="O que você quer perguntar?"
        onChange={(event) => {
          setText(event.target.value);
          if (!sending) setStatus("idle");
        }}
      />
      <div className="ask-row">
        <span className="mono muted">
          {STATUS_NOTE[status] ?? `${trimmed.length}/${QUESTION_MAX_LENGTH}`}
        </span>
        <button type="submit" className="primary" disabled={!trimmed || sending}>
          {sending ? "Mandando..." : "Mandar pergunta"}
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
