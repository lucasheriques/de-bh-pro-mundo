import { useQuery } from "convex/react";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import type { ReactionKind } from "../../convex/validators";
import { REACTIONS } from "../live/reactions";

type Bubble = {
  id: Id<"reactions">;
  kind: ReactionKind;
  name: string | null;
  x: number;
  sway: number;
  delay: number;
};

const RISE_MS = 3600;
const MAX_BUBBLES = 10;
/** Bubbles rise inside the slide's empty right margin, so they never cover content. */
const LANE_FROM = 94;
const LANE_WIDTH = 3;
/** Reactions that arrive together leave one after another instead of stacking. */
const STAGGER_MS = 600;

/** Meet-style reactions: an icon bubble with the sender's name rises, sways and fades. */
export function ReactionsLayer() {
  const recent = useQuery(api.reactions.recent);
  const seen = useRef<Set<Id<"reactions">> | null>(null);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    if (!recent) return;
    if (!seen.current) {
      seen.current = new Set(recent.map((reaction) => reaction._id));
      return;
    }
    const known = seen.current;
    const fresh = recent.filter((reaction) => !known.has(reaction._id));
    if (fresh.length === 0) return;
    for (const reaction of fresh) known.add(reaction._id);
    const added = fresh.map((reaction, i) => ({
      id: reaction._id,
      kind: reaction.kind,
      name: reaction.name,
      x: LANE_FROM + Math.random() * LANE_WIDTH,
      sway: 6 + Math.random() * 10,
      delay: i * STAGGER_MS,
    }));
    setBubbles((current) => [...current, ...added].slice(-MAX_BUBBLES));
    const ids = new Set(added.map((bubble) => bubble.id));
    window.setTimeout(
      () => setBubbles((current) => current.filter((bubble) => !ids.has(bubble.id))),
      RISE_MS + added.length * STAGGER_MS,
    );
  }, [recent]);

  return (
    <div className="reactions-layer" aria-hidden>
      {bubbles.map((bubble) => (
        <span
          key={bubble.id}
          className="reaction-bubble"
          style={
            {
              left: `${bubble.x}%`,
              "--sway": `${bubble.sway}px`,
              animationDelay: `${bubble.delay}ms`,
            } as CSSProperties
          }
        >
          <span className="reaction-bubble-body">
            <span className="reaction-bubble-icon">{REACTIONS[bubble.kind].icon}</span>
            {bubble.name ? <small className="reaction-bubble-name">{bubble.name}</small> : null}
          </span>
        </span>
      ))}
    </div>
  );
}
