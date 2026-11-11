import { ConvexReactClient } from "convex/react";

export const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

const PRESENTER_KEY_STORAGE = "puc-ia-2026:presenterKey";

function storedPresenterKey(): string {
  try {
    return localStorage.getItem(PRESENTER_KEY_STORAGE) ?? "";
  } catch {
    return "";
  }
}

function rememberPresenterKey(key: string): void {
  try {
    localStorage.setItem(PRESENTER_KEY_STORAGE, key);
  } catch {}
}

function takeKeyFromUrl(): string | null {
  const url = new URL(window.location.href);
  const key = url.searchParams.get("key");
  if (key === null) return null;
  url.searchParams.delete("key");
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  return key;
}

function readPresenterKey(): string {
  const fromUrl = takeKeyFromUrl();
  if (fromUrl === null) return storedPresenterKey();
  rememberPresenterKey(fromUrl);
  return fromUrl;
}

/** Read once from ?key= (then stripped from the address bar) or this browser's storage. */
export const presenterKey = readPresenterKey();

export function savePresenterKey(key: string): void {
  rememberPresenterKey(key.trim());
  window.location.reload();
}

export function forgetPresenterKey(): void {
  try {
    localStorage.removeItem(PRESENTER_KEY_STORAGE);
  } catch {}
  window.location.reload();
}

const CLIENT_ID_STORAGE = "puc-ia-2026:clientId";

function randomId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function readClientId(): string {
  try {
    const stored = localStorage.getItem(CLIENT_ID_STORAGE);
    if (stored && /^[a-f0-9]{32}$/.test(stored)) return stored;
    const fresh = randomId();
    localStorage.setItem(CLIENT_ID_STORAGE, fresh);
    return fresh;
  } catch {
    return randomId();
  }
}

export const clientId = readClientId();

export const audienceUrl = `${window.location.origin}/`;
