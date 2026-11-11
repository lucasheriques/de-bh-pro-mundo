import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

type CaptionLine = { _id: string; text: string; breakBefore: boolean };
type Paragraph = { key: string; finals: string[]; draft: string };

const EMPTY = { lines: [], draft: "", draftBreak: false };

export function useLiveCaptions() {
  return useQuery(api.captions.live) ?? EMPTY;
}

/** Finals grouped into paragraphs at each long pause; the draft continues or opens the last. */
export function toParagraphs(
  lines: readonly CaptionLine[],
  draft: string,
  draftBreak: boolean,
): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  for (const line of lines) {
    const last = paragraphs.at(-1);
    if (!last || line.breakBefore)
      paragraphs.push({ key: line._id, finals: [line.text], draft: "" });
    else last.finals.push(line.text);
  }
  if (draft) {
    const last = paragraphs.at(-1);
    if (!last || draftBreak) paragraphs.push({ key: "draft", finals: [], draft });
    else last.draft = draft;
  }
  return paragraphs;
}

/**
 * The newest speech, bottom-anchored: older text scrolls off the top and dims, a long pause
 * starts a new line, and the words still being recognised end in a cursor.
 */
export function LiveCaption({ className, history = 2 }: { className: string; history?: number }) {
  const { lines, draft, draftBreak } = useLiveCaptions();
  const paragraphs = toParagraphs(lines.slice(-history), draft, draftBreak);
  return (
    <div className={`live-caption ${className}`} aria-live="polite">
      {paragraphs.map((paragraph, index) => (
        <p
          key={paragraph.key}
          className="caption-paragraph"
          data-current={index === paragraphs.length - 1 || undefined}
        >
          {paragraph.finals.join(" ")}
          {paragraph.draft ? (
            <span className="caption-draft">
              {paragraph.finals.length > 0 ? " " : ""}
              {paragraph.draft}
            </span>
          ) : null}
        </p>
      ))}
    </div>
  );
}
