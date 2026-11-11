import { HandsClapping, Heart, Sparkle } from "@phosphor-icons/react";
import { type ReactNode, useId } from "react";
import type { ReactionKind } from "../../convex/validators";

/**
 * A laughing face (closed eyes, open mouth) in Phosphor's filled style; Phosphor has smileys but
 * none that laughs. The features are cut out, so whatever is behind shows through.
 */
function LaughingFace() {
  const mask = useId();
  return (
    <svg viewBox="0 0 256 256" aria-hidden="true">
      <mask id={mask}>
        <circle cx="128" cy="128" r="104" fill="white" />
        <path
          d="M76 108 q16 -22 32 0 M148 108 q16 -22 32 0"
          fill="none"
          stroke="black"
          strokeWidth="16"
          strokeLinecap="round"
        />
        <path d="M68 140 h120 a60 60 0 0 1 -120 0 z" fill="black" />
      </mask>
      <circle cx="128" cy="128" r="104" fill="currentColor" mask={`url(#${mask})`} />
    </svg>
  );
}

/** Familiar reactions, filled and coloured like their emoji so they read at a glance. */
export const REACTIONS: Record<ReactionKind, { label: string; icon: ReactNode; color: string }> = {
  clap: {
    label: "Palmas",
    icon: <HandsClapping weight="fill" aria-hidden />,
    color: "var(--hue-4)",
  },
  love: { label: "Amei", icon: <Heart weight="fill" aria-hidden />, color: "oklch(0.68 0.2 20)" },
  laugh: { label: "Haha", icon: <LaughingFace />, color: "var(--hue-2)" },
  wow: { label: "Uau", icon: <Sparkle weight="fill" aria-hidden />, color: "var(--hue-3)" },
};
