import { useQuery } from "convex/react";
import { useLayoutEffect, useRef } from "react";
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

const PINNED_SLACK_PX = 24;

/** Keeps the newest words in view, unless the reader scrolled up to reread. */
function useFollowBottom(changed: unknown) {
  const ref = useRef<HTMLDivElement>(null);
  const pinned = useRef(true);
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll again whenever the text changes
  useLayoutEffect(() => {
    const box = ref.current;
    if (box && pinned.current) box.scrollTop = box.scrollHeight;
  }, [changed]);
  const onScroll = () => {
    const box = ref.current;
    if (box) pinned.current = box.scrollHeight - box.scrollTop - box.clientHeight < PINNED_SLACK_PX;
  };
  return { ref, onScroll };
}

/**
 * The newest speech at the bottom: older text dims above it and stays scrollable, a long
 * pause starts a new line, and the words still being recognised end in a cursor.
 */
export function LiveCaption({ className, history = 2 }: { className: string; history?: number }) {
  const { lines, draft, draftBreak } = useLiveCaptions();
  const paragraphs = toParagraphs(lines.slice(-history), draft, draftBreak);
  const follow = useFollowBottom(`${lines.at(-1)?._id}:${draft}`);
  return (
    <div
      ref={follow.ref}
      onScroll={follow.onScroll}
      className={`live-caption ${className}`}
      aria-live="polite"
    >
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
