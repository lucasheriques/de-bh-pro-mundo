import type { ReactNode } from "react";
import type { ReactionKind } from "../../convex/validators";

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 16,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export const REACTIONS: Record<ReactionKind, { label: string; icon: ReactNode }> = {
  sense: {
    label: "Faz sentido",
    icon: (
      <svg viewBox="0 0 256 256" aria-hidden="true">
        <circle cx="128" cy="128" r="96" {...stroke} />
        <polyline points="88 136 112 160 168 104" {...stroke} />
      </svg>
    ),
  },
  spicy: {
    label: "Polêmico",
    icon: (
      <svg viewBox="0 0 256 256" aria-hidden="true">
        <polygon points="160 16 48 144 120 144 96 240 208 112 136 112 160 16" {...stroke} />
      </svg>
    ),
  },
  more: {
    label: "Quero saber mais",
    icon: (
      <svg viewBox="0 0 256 256" aria-hidden="true">
        <circle cx="116" cy="116" r="76" {...stroke} />
        <line x1="170" y1="170" x2="224" y2="224" {...stroke} />
        <line x1="116" y1="84" x2="116" y2="148" {...stroke} />
        <line x1="84" y1="116" x2="148" y2="116" {...stroke} />
      </svg>
    ),
  },
  wow: {
    label: "Uau",
    icon: (
      <svg viewBox="0 0 256 256" aria-hidden="true">
        <path
          d="M128 24 L150 106 L232 128 L150 150 L128 232 L106 150 L24 128 L106 106 Z"
          {...stroke}
        />
      </svg>
    ),
  },
};
