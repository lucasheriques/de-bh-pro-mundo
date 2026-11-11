import { type RefObject, useLayoutEffect } from "react";

const MIN_ZOOM = 0.6;
/** Sub-pixel rounding is not overflow: a few pixels over still renders at full size. */
const SLACK_PX = 8;

/** The zoom that makes content of `needed` px fit in `available` px, never enlarging it. */
export function fitZoom(available: number, needed: number): number {
  if (needed <= available + SLACK_PX || needed <= 0) return 1;
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
 * Shrinks a slide's content when it is taller than the slide (long edited text, captions on,
 * a growing questions wall), so nothing is cut at the bottom of the projector.
 */
export function useFitHeight(ref: RefObject<HTMLElement | null>, deps: readonly unknown[]): void {
  useLayoutEffect(() => {
    const slide = ref.current;
    if (!slide) return;
    let frame = 0;
    const refit = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => fitToSlide(slide));
    };
    fitToSlide(slide);
    void document.fonts.ready.then(refit);
    const resized = new ResizeObserver(refit);
    resized.observe(slide);
    // Live content (questions, votes) arrives after the slide mounts and can grow past it.
    const grown = new MutationObserver(refit);
    grown.observe(slide, { childList: true, subtree: true });
    return () => {
      cancelAnimationFrame(frame);
      resized.disconnect();
      grown.disconnect();
    };
    // biome-ignore lint/correctness/useExhaustiveDependencies: refit whenever the slide content changes
  }, deps);
}
