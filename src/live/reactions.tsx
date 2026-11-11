import { HandsClapping, Heart, Smiley, Sparkle } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import type { ReactionKind } from "../../convex/validators";

/** Familiar reactions, filled and coloured like their emoji so they read at a glance. */
export const REACTIONS: Record<ReactionKind, { label: string; icon: ReactNode; color: string }> = {
  clap: {
    label: "Palmas",
    icon: <HandsClapping weight="fill" aria-hidden />,
    color: "var(--hue-4)",
  },
  love: { label: "Amei", icon: <Heart weight="fill" aria-hidden />, color: "oklch(0.68 0.2 20)" },
  laugh: { label: "Haha", icon: <Smiley weight="fill" aria-hidden />, color: "var(--hue-2)" },
  wow: { label: "Uau", icon: <Sparkle weight="fill" aria-hidden />, color: "var(--hue-3)" },
};
