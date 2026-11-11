import { useMutation } from "convex/react";
import { type CSSProperties, useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";
import { REACTION_COOLDOWN_MS, REACTION_KINDS, type ReactionKind } from "../../convex/validators";
import { SlideText } from "../content/ContentPage";
import { clientId } from "../live/env";
import { REACTIONS } from "../live/reactions";
import type { Slide, Visual } from "../talk/types";

/** Outlives this panel, which remounts on every slide: the wait follows the person. */
const cooldown = { retryAt: 0, kind: null as ReactionKind | null };

function useCooldownSeconds(): number {
  const [now, setNow] = useState(Date.now);
  const waiting = cooldown.retryAt > now;
  useEffect(() => {
    if (!waiting) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [waiting]);
  return Math.max(0, Math.ceil((cooldown.retryAt - now) / 1000));
}

const headlines: { [K in Visual["kind"]]: (visual: Extract<Visual, { kind: K }>) => string } = {
  title: (visual) => visual.title,
  statement: (visual) => visual.text,
  section: (visual) => `Parte ${visual.number} · ${visual.title}`,
  bigNumber: (visual) => `${visual.value} · ${visual.label}`,
  bars: (visual) => visual.title,
  list: (visual) => visual.title,
  compare: (visual) => visual.title,
  tierList: (visual) => visual.title,
  tierTop: (visual) => visual.title,
  join: () => "Você entrou. Fica com o celular por perto.",
  results: (visual) => visual.eyebrow ?? "Resultados",
  questionsWall: () => "Perguntas",
};

function headlineOf(visual: Visual): string {
  return (headlines[visual.kind] as (visual: Visual) => string)(visual);
}

export function AmbientPanel({ slide }: { slide: Slide }) {
  const send = useMutation(api.reactions.send);
  const [, rerender] = useState(0);
  const wait = useCooldownSeconds();

  const react = (kind: ReactionKind) => {
    if (wait > 0) return;
    cooldown.retryAt = Date.now() + REACTION_COOLDOWN_MS;
    cooldown.kind = kind;
    rerender((n) => n + 1);
    void send({ clientId, kind })
      .then((result) => {
        cooldown.retryAt = result.retryAt;
        if (!result.sent) cooldown.kind = null;
        rerender((n) => n + 1);
      })
      .catch(() => undefined);
  };

  return (
    <section className="panel panel-ambient">
      <h1 className="sr-only">{headlineOf(slide.visual)}</h1>
      <SlideText slide={slide} />
      <p className="reaction-hint">
        {wait > 0
          ? `Apareceu no telão. Você reage de novo em ${wait}s.`
          : "Reaja ao que o Lucas está falando. Aparece no telão."}
      </p>
      <div className="reaction-bar">
        {REACTION_KINDS.map((kind) => (
          <button
            key={kind}
            type="button"
            className={`reaction ${wait > 0 && cooldown.kind === kind ? "is-sent" : ""}`}
            style={{ "--reaction": REACTIONS[kind].color } as CSSProperties}
            disabled={wait > 0}
            onClick={() => react(kind)}
          >
            {REACTIONS[kind].icon}
            <span>{REACTIONS[kind].label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
