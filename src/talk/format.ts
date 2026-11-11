import type { Interaction } from "./types";

type GuessFormat = Extract<Interaction, { kind: "guess" }>["format"];

const decimal = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
const NBSP = " ";

const formatters: Record<GuessFormat, (value: number) => string> = {
  "brl-month": (value) =>
    Math.abs(value) >= 1000
      ? `R$${NBSP}${decimal.format(value / 1000)}${NBSP}mil/mês`
      : `R$${NBSP}${decimal.format(value)}/mês`,
  percent: (value) => `${decimal.format(value)}%`,
  number: (value) => decimal.format(value),
};

export function formatValue(value: number, format: GuessFormat): string {
  return formatters[format](value);
}
