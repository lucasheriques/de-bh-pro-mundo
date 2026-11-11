import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { parseClientId, reactionKind } from "./validators";

const MIN_INTERVAL_MS = 1500;
const RECENT_LIMIT = 30;

export const send = mutation({
  args: { clientId: v.string(), kind: reactionKind },
  handler: async (ctx, args) => {
    const clientId = parseClientId(args.clientId);
    const now = Date.now();
    const recent = await ctx.db
      .query("reactions")
      .withIndex("by_clientId_and_createdAt", (q) =>
        q.eq("clientId", clientId).gt("createdAt", now - MIN_INTERVAL_MS),
      )
      .first();
    if (recent) return false;
    await ctx.db.insert("reactions", { kind: args.kind, clientId, createdAt: now });
    return true;
  },
});

export const recent = query({
  args: {},
  handler: async (ctx) => {
    const reactions = await ctx.db.query("reactions").order("desc").take(RECENT_LIMIT);
    return reactions.map(({ _id, kind, createdAt }) => ({ _id, kind, createdAt }));
  },
});
