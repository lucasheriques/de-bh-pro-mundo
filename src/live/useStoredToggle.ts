import { useState } from "react";

export function useStoredToggle<const T extends readonly [string, string]>(
  storageKey: string,
  values: T,
): [T[number], () => void] {
  const [value, setValue] = useState<T[number]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return values.find((candidate) => candidate === stored) ?? values[0];
    } catch {
      return values[0];
    }
  });
  const toggle = () => {
    const next = value === values[0] ? values[1] : values[0];
    try {
      localStorage.setItem(storageKey, next);
    } catch {}
    setValue(next);
  };
  return [value, toggle];
}

export type StageTheme = "dark" | "light";

const THEMES = ["dark", "light"] as const;

function withoutTransitions(change: () => void): void {
  const root = document.documentElement;
  root.dataset.themeSwitching = "";
  change();
  requestAnimationFrame(() => requestAnimationFrame(() => delete root.dataset.themeSwitching));
}

export function useStageTheme(surface: "stage" | "presenter"): [StageTheme, () => void] {
  const [theme, toggle] = useStoredToggle(`puc-ia-2026:${surface}-theme`, THEMES);
  return [theme, () => withoutTransitions(toggle)];
}
