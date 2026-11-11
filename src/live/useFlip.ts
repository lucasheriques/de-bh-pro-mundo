import { useLayoutEffect, useRef } from "react";

export function useFlip<T extends HTMLElement>(_order: string) {
  const containerRef = useRef<T>(null);
  const rects = useRef(new Map<string, DOMRect>());

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const next = new Map<string, DOMRect>();
    for (const child of Array.from(container.children) as HTMLElement[]) {
      const id = child.dataset.flipId;
      if (!id) continue;
      const rect = child.getBoundingClientRect();
      next.set(id, rect);
      const previous = rects.current.get(id);
      if (reduce) continue;
      if (!previous) {
        child.animate(
          [
            {
              opacity: 0,
              transform: "translateY(16px) scale(0.96)",
              boxShadow: "0 0 0 2px var(--accent)",
            },
            { opacity: 1, transform: "none", boxShadow: "0 0 0 2px var(--accent)", offset: 0.6 },
            { opacity: 1, transform: "none", boxShadow: "0 0 0 0 transparent" },
          ],
          {
            duration: 1100,
            easing: "cubic-bezier(0.23, 1, 0.32, 1)",
          },
        );
      } else if (previous.top !== rect.top) {
        const scale = container.getBoundingClientRect().height / container.offsetHeight || 1;
        child.animate(
          [
            { transform: `translateY(${(previous.top - rect.top) / scale}px)` },
            { transform: "none" },
          ],
          {
            duration: 400,
            easing: "cubic-bezier(0.23, 1, 0.32, 1)",
          },
        );
      }
    }
    rects.current = next;
  }, []);

  return containerRef;
}
