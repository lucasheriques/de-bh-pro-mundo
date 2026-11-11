import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertPresenter } from "./presenter";

const EDIT_CAP = 2000;
const VALUE_MAX_LENGTH = 2000;
const SLIDE_ID = /^[a-z0-9][a-z0-9-]{0,63}$/;
const PATH = /^[A-Za-z0-9.]{1,120}$/;

function parseTarget(slideId: string, path: string): void {
  if (!SLIDE_ID.test(slideId) || !PATH.test(path)) throw new ConvexError("Campo inválido");
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const edits = await ctx.db.query("slideEdits").take(EDIT_CAP);
    return edits.map(({ slideId, path, value }) => ({ slideId, path, value }));
  },
});

export const set = mutation({
  args: { key: v.string(), slideId: v.string(), path: v.string(), value: v.string() },
  handler: async (ctx, { key, slideId, path, value }) => {
    assertPresenter(key);
    parseTarget(slideId, path);
    const text = value.slice(0, VALUE_MAX_LENGTH);
    const existing = await ctx.db
      .query("slideEdits")
      .withIndex("by_slideId_and_path", (q) => q.eq("slideId", slideId).eq("path", path))
      .unique();
    const doc = { slideId, path, value: text, updatedAt: Date.now() };
    if (existing) await ctx.db.patch("slideEdits", existing._id, doc);
    else await ctx.db.insert("slideEdits", doc);
    return null;
  },
});

export const clear = mutation({
  args: { key: v.string(), slideId: v.string(), path: v.string() },
  handler: async (ctx, { key, slideId, path }) => {
    assertPresenter(key);
    parseTarget(slideId, path);
    const existing = await ctx.db
      .query("slideEdits")
      .withIndex("by_slideId_and_path", (q) => q.eq("slideId", slideId).eq("path", path))
      .unique();
    if (existing) await ctx.db.delete("slideEdits", existing._id);
    return null;
  },
});
