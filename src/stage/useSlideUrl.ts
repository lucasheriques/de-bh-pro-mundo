import { useEffect, useState } from "react";
import { slides } from "../talk/slides";

const PREVIEW_PARAM = "slide";

function indexOfId(id: string | null): number | null {
  if (!id) return null;
  const index = slides.findIndex((slide) => slide.id === id);
  return index === -1 ? null : index;
}

export type SlidePreview = { index: number; next: () => void; prev: () => void };

/**
 * `/stage?slide=<id>` previews one slide without moving the room: arrows browse locally and
 * the URL follows, so a link points at exactly what you are looking at.
 */
export function useSlidePreview(): SlidePreview | null {
  const [index, setIndex] = useState(() =>
    indexOfId(new URLSearchParams(window.location.search).get(PREVIEW_PARAM)),
  );
  useEffect(() => {
    if (index === null) return;
    const url = new URL(window.location.href);
    url.searchParams.set(PREVIEW_PARAM, slides[index]?.id ?? "");
    window.history.replaceState(null, "", url);
  }, [index]);
  if (index === null) return null;
  return {
    index,
    next: () => setIndex(Math.min(slides.length - 1, index + 1)),
    prev: () => setIndex(Math.max(0, index - 1)),
  };
}

/** The live stage keeps the current slide's id in the URL hash (`/stage#paths`). */
export function useSlideHash(slideId: string, enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;
    window.history.replaceState(null, "", `${window.location.pathname}#${slideId}`);
  }, [slideId, enabled]);
}
