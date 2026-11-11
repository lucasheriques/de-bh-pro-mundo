import { useQuery } from "convex/react";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import type { ReactionKind } from "../../convex/validators";
import { REACTIONS } from "../live/reactions";

type Floating = { id: Id<"reactions">; kind: ReactionKind; x: number };

const FLOAT_MS = 2600;

export function ReactionsLayer() {
  const recent = useQuery(api.reactions.recent);
  const seen = useRef<Set<Id<"reactions">> | null>(null);
  const [floating, setFloating] = useState<Floating[]>([]);

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
    const added = fresh.map((reaction) => ({
      id: reaction._id,
      kind: reaction.kind,
      x: 8 + Math.random() * 84,
    }));
    setFloating((current) => [...current, ...added].slice(-24));
    const ids = new Set(added.map((reaction) => reaction.id));
    window.setTimeout(
      () => setFloating((current) => current.filter((reaction) => !ids.has(reaction.id))),
      FLOAT_MS,
    );
  }, [recent]);

  return (
    <div className="reactions-layer" aria-hidden>
      {floating.map((reaction) => (
        <span
          key={reaction.id}
          className="reaction-float"
          style={{ left: `${reaction.x}%` } as CSSProperties}
        >
          {REACTIONS[reaction.kind].icon}
          {REACTIONS[reaction.kind].label}
        </span>
      ))}
    </div>
  );
}
