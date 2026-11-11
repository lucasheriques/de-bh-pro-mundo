import { type RefObject, useLayoutEffect } from "react";

const MIN_ZOOM = 0.6;

/** The zoom that makes content of `needed` px fit in `available` px, never enlarging it. */
export function fitZoom(available: number, needed: number): number {
  if (needed <= available || needed <= 0) return 1;
  return Math.max(MIN_ZOOM, available / needed);
}

function fitToSlide(slide: HTMLElement): void {
  const content = slide.firstElementChild;
  if (!(content instanceof HTMLElement)) return;
  content.style.zoom = "";
  const style = getComputedStyle(slide);
  const available =
    slide.clientHeight -
    Number.parseFloat(style.paddingTop) -
    Number.parseFloat(style.paddingBottom);
  const zoom = fitZoom(available, content.scrollHeight);
  if (zoom < 1) content.style.zoom = String(zoom);
}

/**
 * Shrinks a slide's content when it is taller than the slide (long edited text, captions on),
 * so nothing is cut at the bottom of the projector.
 */
export function useFitHeight(ref: RefObject<HTMLElement | null>, deps: readonly unknown[]): void {
  useLayoutEffect(() => {
    const slide = ref.current;
    if (!slide) return;
    const refit = () => fitToSlide(slide);
    refit();
    void document.fonts.ready.then(refit);
    const observer = new ResizeObserver(refit);
    observer.observe(slide);
    return () => observer.disconnect();
    // biome-ignore lint/correctness/useExhaustiveDependencies: refit whenever the slide content changes
  }, deps);
}
