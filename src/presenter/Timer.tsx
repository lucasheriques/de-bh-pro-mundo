import { useEffect, useState } from "react";

const TALK_MS = 25 * 60 * 1000;
const STORAGE = "puc-ia-2026:talk-start";

function readStart(): number | null {
  try {
    const stored = Number(localStorage.getItem(STORAGE));
    return stored > 0 ? stored : null;
  } catch {
    return null;
  }
}

function writeStart(start: number | null) {
  try {
    if (start === null) localStorage.removeItem(STORAGE);
    else localStorage.setItem(STORAGE, String(start));
  } catch {}
}

const clock = (ms: number) => {
  const total = Math.floor(Math.abs(ms) / 1000);
  return `${ms < 0 ? "-" : ""}${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

export function Timer({ started }: { started: boolean }) {
  const [start, setStart] = useState(readStart);
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    if (started && start === null) {
      const fresh = Date.now();
      writeStart(fresh);
      setStart(fresh);
    }
  }, [started, start]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(id);
  }, []);

  const elapsed = start === null ? 0 : now - start;
  const remaining = TALK_MS - elapsed;
  return (
    <div className={`timer ${remaining < 5 * 60 * 1000 ? "is-late" : ""}`}>
      <span className="mono">{clock(elapsed)}</span>
      <span className="mono timer-remaining">{clock(remaining)} restantes</span>
      <button
        type="button"
        className="ghost"
        onClick={() => {
          const fresh = start === null ? Date.now() : null;
          writeStart(fresh);
          setStart(fresh);
        }}
      >
        {start === null ? "Iniciar" : "Zerar"}
      </button>
    </div>
  );
}
