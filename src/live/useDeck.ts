import type { OptimisticLocalStore } from "convex/browser";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../../convex/_generated/api";
import { DEFAULT_SESSION } from "../../convex/validators";
import { slides } from "../talk/slides";
import type { Slide } from "../talk/types";
import { presenterKey } from "./env";

export type Session = typeof DEFAULT_SESSION;

const clampIndex = (index: number) => Math.min(slides.length - 1, Math.max(0, index));

export function slideAt(index: number): Slide {
  const slide = slides[clampIndex(index)];
  if (!slide) throw new Error("The deck has no slides");
  return slide;
}

export function pollIdOf(slide: Slide): string | null {
  const interaction = slide.interaction;
  return interaction && interaction.kind !== "questions" ? interaction.pollId : null;
}

export function useSession(): Session {
  return useQuery(api.session.get) ?? DEFAULT_SESSION;
}

export function useDeck() {
  const session = useSession();
  const index = clampIndex(session.slideIndex);
  const indexRef = useRef(index);
  indexRef.current = index;
  const [error, setError] = useState<string | null>(null);
  const keyValid = useQuery(api.session.checkKey, { key: presenterKey });

  const rawSetSlide = useMutation(api.session.setSlide);
  const rawToggleReveal = useMutation(api.session.toggleReveal);
  const rawSetVoice = useMutation(api.session.setVoice);

  const mutations = useMemo(() => {
    const patchSession = (store: OptimisticLocalStore, patch: Partial<Session>) => {
      const current = store.getQuery(api.session.get, {}) ?? DEFAULT_SESSION;
      store.setQuery(api.session.get, {}, { ...current, ...patch });
    };
    return {
      setSlide: rawSetSlide.withOptimisticUpdate((store, { slideIndex }) =>
        patchSession(store, { slideIndex }),
      ),
      toggleReveal: rawToggleReveal.withOptimisticUpdate((store, { pollId }) => {
        const revealed = store.getQuery(api.session.get, {})?.revealed ?? {};
        patchSession(store, { revealed: { ...revealed, [pollId]: !revealed[pollId] } });
      }),
      setVoice: rawSetVoice.withOptimisticUpdate((store, { voiceEnabled }) =>
        patchSession(store, { voiceEnabled }),
      ),
    };
  }, [rawSetSlide, rawToggleReveal, rawSetVoice]);

  const report = (promise: Promise<unknown>) =>
    promise.then(
      () => setError(null),
      (cause: unknown) => setError(cause instanceof Error ? cause.message : String(cause)),
    );

  const goTo = (target: number) => {
    const slideIndex = clampIndex(target);
    if (slideIndex === indexRef.current) return;
    indexRef.current = slideIndex;
    report(mutations.setSlide({ key: presenterKey, slideIndex }));
  };

  const slide = slideAt(index);
  const pollId = pollIdOf(slide);

  return {
    index,
    slide,
    session,
    keyValid,
    error,
    goTo,
    next: () => goTo(indexRef.current + 1),
    prev: () => goTo(indexRef.current - 1),
    advanceFrom: (from: number) => {
      if (indexRef.current === from) goTo(from + 1);
    },
    toggleReveal: () => {
      if (pollId) report(mutations.toggleReveal({ key: presenterKey, pollId }));
    },
    toggleVoice: () =>
      report(mutations.setVoice({ key: presenterKey, voiceEnabled: !session.voiceEnabled })),
  };
}

export type Deck = ReturnType<typeof useDeck>;

export type DeckAction =
  | "next"
  | "prev"
  | "reveal"
  | "voice"
  | "captions"
  | "fullscreen"
  | "theme"
  | "cues";

export const KEYMAP: Record<string, DeckAction> = {
  ArrowRight: "next",
  ArrowDown: "next",
  PageDown: "next",
  " ": "next",
  ArrowLeft: "prev",
  ArrowUp: "prev",
  PageUp: "prev",
  r: "reveal",
  v: "voice",
  c: "captions",
  f: "fullscreen",
  t: "theme",
  d: "cues",
};

const REPEATABLE: ReadonlySet<DeckAction> = new Set(["next", "prev"]);

function isTyping(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement | null;
  return Boolean(target?.closest("input, textarea, [contenteditable]"));
}

function actionFor(event: KeyboardEvent): DeckAction | undefined {
  const hasModifier = event.metaKey || event.ctrlKey || event.altKey;
  if (hasModifier || isTyping(event)) return undefined;
  return KEYMAP[event.key.length === 1 ? event.key.toLowerCase() : event.key];
}

export function useDeckKeys(handlers: Partial<Record<DeckAction, () => void>>): void {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const action = actionFor(event);
      const handler = action && handlersRef.current[action];
      if (!handler) return;
      event.preventDefault();
      const firesOnRepeat = REPEATABLE.has(action);
      if (!event.repeat || firesOnRepeat) handler();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

export function toggleFullscreen(): void {
  if (document.fullscreenElement) void document.exitFullscreen();
  else void document.documentElement.requestFullscreen().catch(() => undefined);
}
