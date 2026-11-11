import { v } from "convex/values";
import type { MutationCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { assertPresenter } from "./presenter";

const CAPTION_MAX_LENGTH = 500;
const LIVE_LINES = 8;

async function writeDraft(ctx: MutationCtx, text: string, breakBefore: boolean): Promise<void> {
  const draft = await ctx.db.query("captionDraft").first();
  const doc = {
    text: text.trim().slice(0, CAPTION_MAX_LENGTH),
    updatedAt: Date.now(),
    breakBefore,
  };
  if (draft) await ctx.db.patch("captionDraft", draft._id, doc);
  else await ctx.db.insert("captionDraft", doc);
}

export const push = mutation({
  args: {
    key: v.string(),
    text: v.string(),
    slideIndex: v.number(),
    afterPause: v.optional(v.boolean()),
  },
  handler: async (ctx, { key, text, slideIndex, afterPause }) => {
    assertPresenter(key);
    const trimmed = text.trim().slice(0, CAPTION_MAX_LENGTH);
    if (trimmed.length === 0) return null;
    const previous = await ctx.db.query("captions").order("desc").first();
    // Same transaction as the new line: the live draft never blanks out before the line lands.
    await writeDraft(ctx, "", false);
    await ctx.db.insert("captions", {
      text: trimmed,
      slideIndex,
      createdAt: Date.now(),
      breakBefore: afterPause === true || previous?.slideIndex !== slideIndex,
    });
    return null;
  },
});

export const draft = mutation({
  args: { key: v.string(), text: v.string(), afterPause: v.optional(v.boolean()) },
  handler: async (ctx, { key, text, afterPause }) => {
    assertPresenter(key);
    await writeDraft(ctx, text, afterPause === true);
    return null;
  },
});

export const latest = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const take = Math.min(Math.max(1, Math.floor(limit ?? 3)), 20);
    const captions = await ctx.db.query("captions").order("desc").take(take);
    return captions.map(({ _id, text, slideIndex }) => ({ _id, text, slideIndex }));
  },
});

export const live = query({
  args: {},
  handler: async (ctx) => {
    const finals = await ctx.db.query("captions").order("desc").take(LIVE_LINES);
    const draft = await ctx.db.query("captionDraft").first();
    return {
      lines: finals
        .reverse()
        .map(({ _id, text, breakBefore }) => ({ _id, text, breakBefore: breakBefore ?? false })),
      draft: draft?.text ?? "",
      draftBreak: draft?.breakBefore ?? false,
    };
  },
});

const CLEAR_CAP = 4000;

/** Deletes every caption line and the live draft; votes, questions and reactions stay. */
export const clear = mutation({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    assertPresenter(key);
    const lines = await ctx.db.query("captions").take(CLEAR_CAP);
    await Promise.all(lines.map((line) => ctx.db.delete("captions", line._id)));
    const drafts = await ctx.db.query("captionDraft").take(CLEAR_CAP);
    await Promise.all(drafts.map((draft) => ctx.db.delete("captionDraft", draft._id)));
    return lines.length;
  },
});
