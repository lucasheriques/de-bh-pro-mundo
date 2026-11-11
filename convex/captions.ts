import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { MutationCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { assertPresenter } from "./presenter";

const CAPTION_MAX_LENGTH = 500;
const LIVE_LINES = 8;

async function writeDraft(ctx: MutationCtx, text: string): Promise<void> {
  const draft = await ctx.db.query("captionDraft").first();
  const doc = { text: text.trim().slice(0, CAPTION_MAX_LENGTH), updatedAt: Date.now() };
  if (draft) await ctx.db.patch("captionDraft", draft._id, doc);
  else await ctx.db.insert("captionDraft", doc);
}

export const push = mutation({
  args: { key: v.string(), text: v.string(), slideIndex: v.number() },
  handler: async (ctx, { key, text, slideIndex }) => {
    assertPresenter(key);
    const trimmed = text.trim().slice(0, CAPTION_MAX_LENGTH);
    if (trimmed.length === 0) return null;
    const captionId = await ctx.db.insert("captions", {
      text: trimmed,
      slideIndex,
      createdAt: Date.now(),
    });
    if (process.env.AI_GATEWAY_API_KEY) {
      await ctx.scheduler.runAfter(0, internal.captionPolish.polish, { captionId, text: trimmed });
    }
    return null;
  },
});

export const draft = mutation({
  args: { key: v.string(), text: v.string() },
  handler: async (ctx, { key, text }) => {
    assertPresenter(key);
    await writeDraft(ctx, text);
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
      lines: finals.reverse().map(({ _id, text }) => ({ _id, text })),
      draft: draft?.text ?? "",
    };
  },
});
