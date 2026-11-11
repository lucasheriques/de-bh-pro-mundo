import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { nameOf } from "./audience";
import { rateLimiter } from "./rateLimits";
import { parseClientId, REACTION_COOLDOWN_MS, reactionKind } from "./validators";

const RECENT_LIMIT = 30;

/** Sends a reaction, at most one per person every REACTION_COOLDOWN_MS. */
export const send = mutation({
  args: { clientId: v.string(), kind: reactionKind },
  handler: async (ctx, args): Promise<{ sent: boolean; retryAt: number }> => {
    const clientId = parseClientId(args.clientId);
    const now = Date.now();
    const recent = await ctx.db
      .query("reactions")
      .withIndex("by_clientId_and_createdAt", (q) =>
        q.eq("clientId", clientId).gt("createdAt", now - REACTION_COOLDOWN_MS),
      )
      .first();
    if (recent) return { sent: false, retryAt: recent.createdAt + REACTION_COOLDOWN_MS };
    if (!(await rateLimiter.limit(ctx, "reactionRoom")).ok) return { sent: false, retryAt: now };
    await ctx.db.insert("reactions", { kind: args.kind, clientId, createdAt: now });
    return { sent: true, retryAt: now + REACTION_COOLDOWN_MS };
  },
});

export const recent = query({
  args: {},
  handler: async (ctx) => {
    const reactions = await ctx.db.query("reactions").order("desc").take(RECENT_LIMIT);
    return await Promise.all(
      reactions.map(async ({ _id, kind, createdAt, clientId }) => ({
        _id,
        kind,
        createdAt,
        name: (await nameOf(ctx, clientId)) ?? null,
      })),
    );
  },
});
