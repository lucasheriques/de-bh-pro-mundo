import type { Interaction, MatchItem } from "./types";

type MatchInteraction = Extract<Interaction, { kind: "match" }>;

export type MatchPicks = Readonly<Record<string, string>>;

export function encodeMatch(picks: MatchPicks): string {
  return Object.entries(picks)
    .map(([item, target]) => `${item}=${target}`)
    .join(";");
}

export function parseMatch(value: unknown): MatchPicks {
  if (typeof value !== "string") return {};
  const picks: Record<string, string> = {};
  for (const pair of value.split(";")) {
    const [item, target] = pair.split("=");
    if (item && target) picks[item] = target;
  }
  return picks;
}

export type MatchRow = {
  item: MatchItem;
  counts: Record<string, number>;
  total: number;
  correctShare: number;
};

export function tallyMatch(values: readonly unknown[], interaction: MatchInteraction): MatchRow[] {
  const all = values.map(parseMatch);
  return interaction.items.map((item) => {
    const counts = Object.fromEntries(interaction.targets.map((target) => [target.id, 0]));
    for (const picks of all) {
      const target = picks[item.id];
      if (target !== undefined && target in counts) counts[target] = (counts[target] ?? 0) + 1;
    }
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    const correct = counts[item.answer] ?? 0;
    return { item, counts, total, correctShare: total ? correct / total : 0 };
  });
}

export function scoreMatch(picks: MatchPicks, interaction: MatchInteraction): number {
  return interaction.items.filter((item) => picks[item.id] === item.answer).length;
}
