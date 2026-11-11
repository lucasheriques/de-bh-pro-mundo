import { useEffect, useRef, useState } from "react";
import { useLiveCaptions } from "./LiveCaption";

const SIZES = [24, 32, 44, 60] as const;

export function CaptionsPage() {
  const { lines, draft } = useLiveCaptions();
  const [size, setSize] = useState(1);
  const endRef = useRef<HTMLDivElement>(null);
  const lastId = lines.at(-1)?._id;

  useEffect(() => {
    if (lastId || draft) endRef.current?.scrollIntoView({ block: "end" });
  }, [lastId, draft]);

  return (
    <main className="captions-page" style={{ fontSize: SIZES[size] }}>
      <header className="captions-head">
        <h1>Legendas ao vivo</h1>
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
        {lines.map((line) => (
          <p key={line._id}>{line.text}</p>
        ))}
      </div>
      {draft ? <p className="caption-draft">{draft}</p> : null}
      <div ref={endRef} />
      <p className="captions-note muted">
        Gerada automaticamente pelo reconhecimento de voz. Pode ter erros.
      </p>
    </main>
  );
}
