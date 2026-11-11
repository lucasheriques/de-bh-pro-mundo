import { useMutation } from "convex/react";
import { useRef, useState } from "react";
import { api } from "../../convex/_generated/api";
import { REACTION_KINDS, type ReactionKind } from "../../convex/validators";
import { clientId } from "../live/env";
import { REACTIONS } from "../live/reactions";
import type { Slide, Visual } from "../talk/types";

const COOLDOWN_MS = 1500;

const headlines: { [K in Visual["kind"]]: (visual: Extract<Visual, { kind: K }>) => string } = {
  title: (visual) => visual.title,
  statement: (visual) => visual.text,
  bigNumber: (visual) => `${visual.value} · ${visual.label}`,
  bars: (visual) => visual.title,
  list: (visual) => visual.title,
  compare: (visual) => visual.title,
  tierList: (visual) => visual.title,
  join: () => "Você entrou. Fica com o celular por perto.",
  results: (visual) => visual.eyebrow ?? "Resultados",
  questionsWall: () => "Perguntas",
};

function headlineOf(visual: Visual): string {
  return (headlines[visual.kind] as (visual: Visual) => string)(visual);
}

export function AmbientPanel({ slide }: { slide: Slide }) {
  const send = useMutation(api.reactions.send);
  const [sent, setSent] = useState<ReactionKind | null>(null);
  const lastSent = useRef(0);

  const react = (kind: ReactionKind) => {
    const now = Date.now();
    if (now - lastSent.current < COOLDOWN_MS) return;
    lastSent.current = now;
    setSent(kind);
    window.setTimeout(() => setSent((current) => (current === kind ? null : current)), COOLDOWN_MS);
    void send({ clientId, kind }).catch(() => undefined);
  };

  return (
    <section className="panel panel-ambient">
      {"eyebrow" in slide.visual && slide.visual.eyebrow ? (
        <p className="eyebrow">{slide.visual.eyebrow}</p>
      ) : null}
      <h1 className="ambient-headline">{headlineOf(slide.visual)}</h1>
      <div className="reaction-bar">
        {REACTION_KINDS.map((kind) => (
          <button
            key={kind}
            type="button"
            className={`reaction ${sent === kind ? "is-sent" : ""}`}
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
