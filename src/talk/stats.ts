import type { PollOption } from "./types";

export function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const at = (i: number) => sorted[i] ?? 0;
  return sorted.length % 2 === 1 ? at(mid) : (at(mid - 1) + at(mid)) / 2;
}

export type Range = { min: number; max: number };

export const GUESS_BINS = 8;

export function binOf(value: number, { min, max }: Range, bins: number): number {
  const width = (max - min) / bins;
  return Math.min(bins - 1, Math.max(0, Math.floor((value - min) / width)));
}

export function histogram(values: readonly number[], range: Range, bins: number): number[] {
  const counts = Array.from({ length: bins }, () => 0);
  for (const value of values) {
    const bin = binOf(value, range, bins);
    counts[bin] = (counts[bin] ?? 0) + 1;
  }
  return counts;
}

export type ChoiceCount = PollOption & { count: number; share: number };

export function countChoices(
  values: readonly (string | number)[],
  options: readonly PollOption[],
): ChoiceCount[] {
  const counts = new Map<string, number>();
  for (const value of values) {
    if (typeof value === "string") counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  const total = options.reduce((sum, option) => sum + (counts.get(option.id) ?? 0), 0);
  return options.map((option) => {
    const count = counts.get(option.id) ?? 0;
    return { ...option, count, share: total === 0 ? 0 : count / total };
  });
}

export function numericValues(values: readonly (string | number)[]): number[] {
  return values.filter((value): value is number => typeof value === "number");
}
