import { useSyncExternalStore } from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "puc-ia-2026:theme";
const STATUS_BAR: Record<Theme, string> = { dark: "#0a0a0f", light: "#f5f6fa" };
const systemLight = window.matchMedia("(prefers-color-scheme: light)");
const listeners = new Set<() => void>();

function storedChoice(): Theme | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "dark" || stored === "light" ? stored : null;
  } catch {
    return null;
  }
}

function currentTheme(): Theme {
  return storedChoice() ?? (systemLight.matches ? "light" : "dark");
}

function apply(): void {
  const theme = currentTheme();
  document.documentElement.dataset.theme = theme;
  for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
    meta.content = STATUS_BAR[theme];
  }
  for (const listener of listeners) listener();
}

/** Audience pages follow the system theme until the viewer picks one. */
export function startAudienceTheme(): void {
  apply();
  systemLight.addEventListener("change", apply);
}

function toggleTheme(): void {
  const next: Theme = currentTheme() === "dark" ? "light" : "dark";
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {}
  const root = document.documentElement;
  root.dataset.themeSwitching = "";
  apply();
  requestAnimationFrame(() => requestAnimationFrame(() => delete root.dataset.themeSwitching));
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAudienceTheme(): [Theme, () => void] {
  return [useSyncExternalStore(subscribe, currentTheme), toggleTheme];
}
