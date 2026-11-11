import { useQuery } from "convex/react";
import { type ReactNode, useRef } from "react";
import { api } from "../../convex/_generated/api";
import { applySlideEdits, type SlideEdit } from "./slideEdits";
import { slides } from "./slides";

const pristineSlides = structuredClone(slides);

export function useSlideEdits(): readonly SlideEdit[] | undefined {
  return useQuery(api.slideEdits.list);
}

function Splash() {
  return (
    <main className="splash" aria-busy="true">
      <span className="splash-dot" aria-hidden="true" />
      <span className="splash-text">Conectando...</span>
    </main>
  );
}

/** Applies the presenter's saved text edits to the shared slide registry before the page renders. */
export function LiveSlides({ render }: { render: () => ReactNode }) {
  const edits = useSlideEdits();
  const session = useQuery(api.session.get);
  const applied = useRef<readonly SlideEdit[] | null>(null);
  if (edits === undefined || session === undefined) return <Splash />;
  if (applied.current !== edits) {
    applySlideEdits(slides, pristineSlides, edits);
    applied.current = edits;
  }
  return render();
}

export function pristineSlide(id: string) {
  return pristineSlides.find((slide) => slide.id === id);
}
