import { useEffect, useRef, useState } from "react";
import { toParagraphs, useLiveCaptions } from "./LiveCaption";

const SIZES = [24, 32, 44, 60] as const;

export function CaptionsPage() {
  const { lines, draft, draftBreak } = useLiveCaptions();
  const paragraphs = toParagraphs(lines, draft, draftBreak);
  const [size, setSize] = useState(1);
  const endRef = useRef<HTMLDivElement>(null);
  const lastId = lines.at(-1)?._id;

  useEffect(() => {
    if (lastId || draft) endRef.current?.scrollIntoView({ block: "end" });
  }, [lastId, draft]);

  return (
    <main className="captions-page" style={{ fontSize: SIZES[size] }}>
      <header className="captions-head">
        <a href="/" className="captions-back">
          Voltar pra talk
        </a>
        <div className="captions-size">
          <button
            type="button"
            onClick={() => setSize((s) => Math.max(0, s - 1))}
            disabled={size === 0}
            aria-label="Diminuir letra"
          >
            A−
          </button>
          <button
            type="button"
            onClick={() => setSize((s) => Math.min(SIZES.length - 1, s + 1))}
            disabled={size === SIZES.length - 1}
            aria-label="Aumentar letra"
          >
            A+
          </button>
        </div>
      </header>
      <div className="captions-log" aria-live="polite">
        {lines.length === 0 && !draft ? (
          <p className="muted">As legendas aparecem aqui quando o Lucas começar a falar.</p>
        ) : null}
        {paragraphs.map((paragraph) => (
          <p key={paragraph.key}>
            {paragraph.finals.join(" ")}
            {paragraph.draft ? (
              <span className="caption-draft">
                {paragraph.finals.length > 0 ? " " : ""}
                {paragraph.draft}
              </span>
            ) : null}
          </p>
        ))}
      </div>
      <div ref={endRef} />
      <p className="captions-note muted">
        Gerada automaticamente pelo reconhecimento de voz. Pode ter erros.
      </p>
    </main>
  );
}
