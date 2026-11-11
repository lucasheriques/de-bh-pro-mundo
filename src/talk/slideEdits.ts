import type { Slide } from "./types";

export type SlideEdit = { slideId: string; path: string; value: string };

export type EditableField = { path: string; value: string };

const LOCKED_KEYS = new Set(["id", "kind", "pollId", "logo", "tier", "format", "section"]);

type Node = Record<string, unknown> | unknown[];

const isNode = (value: unknown): value is Node => typeof value === "object" && value !== null;

function child(node: Node, key: string): unknown {
  return Array.isArray(node) ? node[Number(key)] : node[key];
}

/** Every string a person can rewrite in a slide, by dotted path, skipping structural ids. */
export function editableFields(slide: Slide): EditableField[] {
  const fields: EditableField[] = [];
  const walk = (value: unknown, path: string[]) => {
    if (typeof value === "string") {
      fields.push({ path: path.join("."), value });
      return;
    }
    if (!isNode(value)) return;
    for (const [key, next] of Object.entries(value)) {
      if (!LOCKED_KEYS.has(key)) walk(next, [...path, key]);
    }
  };
  walk(slide, []);
  return fields;
}

/** Sets `value` at `path` only where a string already lives, so an edit can never change shape. */
export function setText(root: Node, path: string, value: string): boolean {
  const keys = path.split(".");
  const last = keys.pop();
  if (last === undefined || LOCKED_KEYS.has(last)) return false;
  let node: unknown = root;
  for (const key of keys) {
    if (!isNode(node)) return false;
    node = child(node, key);
  }
  if (!isNode(node) || typeof child(node, last) !== "string") return false;
  if (Array.isArray(node)) node[Number(last)] = value;
  else node[last] = value;
  return true;
}

/** Rebuilds `live` from `pristine` plus `edits`, in place, so every importer sees the change. */
export function applySlideEdits(
  live: Slide[],
  pristine: readonly Slide[],
  edits: readonly SlideEdit[],
): void {
  pristine.forEach((original, index) => {
    const slide = structuredClone(original);
    for (const edit of edits) {
      if (edit.slideId === slide.id) setText(slide as unknown as Node, edit.path, edit.value);
    }
    live[index] = slide;
  });
}
