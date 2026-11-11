import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useLiveCaptions() {
  return useQuery(api.captions.live) ?? { lines: [], draft: "" };
}

export function LiveCaption({ className }: { className: string }) {
  const { lines, draft } = useLiveCaptions();
  const last = lines.at(-1)?.text ?? "";
  return (
    <p className={className}>
      <span aria-live="polite">{last}</span>{" "}
      {draft ? <span className="caption-draft">{draft}</span> : null}
    </p>
  );
}
