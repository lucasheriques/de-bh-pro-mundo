import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useLiveCaptions() {
  return useQuery(api.captions.live) ?? { lines: [], draft: "" };
}

/**
 * The newest speech, bottom-anchored: the box keeps the latest words in view and older
 * text scrolls off the top, so a long unbroken sentence never hides what was just said.
 */
export function LiveCaption({ className, history = 2 }: { className: string; history?: number }) {
  const { lines, draft } = useLiveCaptions();
  const recent = lines.slice(-history);
  return (
    <div className={`live-caption ${className}`}>
      <p>
        {recent.map((line) => (
          <span key={line._id} className="caption-final" aria-live="polite">
            {line.text}{" "}
          </span>
        ))}
        {draft ? <span className="caption-draft">{draft}</span> : null}
      </p>
    </div>
  );
}
