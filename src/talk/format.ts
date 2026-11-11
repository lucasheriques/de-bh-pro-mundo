import type { Interaction } from "./types";

type GuessFormat = Extract<Interaction, { kind: "guess" }>["format"];

const decimal = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
const NBSP = " ";

/** "R$ 62,5 mil" for thousands, "R$ 950" below that. */
export function formatBrl(value: number): string {
  return Math.abs(value) >= 1000
    ? `R$${NBSP}${decimal.format(value / 1000)}${NBSP}mil`
    : `R$${NBSP}${decimal.format(value)}`;
}

/** "+146%": how much bigger `to` is than `from`. */
export function formatJump(from: number, to: number): string {
  return `+${Math.round((to / from - 1) * 100)}%`;
}

const formatters: Record<GuessFormat, (value: number) => string> = {
  "brl-month": (value) => `${formatBrl(value)}/mês`,
  percent: (value) => `${decimal.format(value)}%`,
  number: (value) => decimal.format(value),
};

export function formatValue(value: number, format: GuessFormat): string {
  return formatters[format](value);
}
