import { ConvexError, v } from "convex/values";
import type { QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { checkDisplayName } from "./displayName";
import { presence, ROOM } from "./presence";
import { isPresenterKey } from "./presenter";
import { rateLimiter } from "./rateLimits";
import { parseClientId } from "./validators";

const AUDIENCE_COUNT_CAP = 5000;

export const join = mutation({
  args: { clientId: v.string() },
  handler: async (ctx, args) => {
    const clientId = parseClientId(args.clientId);
    const now = Date.now();
    const existing = await ctx.db
      .query("audience")
      .withIndex("by_clientId", (q) => q.eq("clientId", clientId))
      .unique();
    if (existing) await ctx.db.patch("audience", existing._id, { lastSeenAt: now });
    else await ctx.db.insert("audience", { clientId, joinedAt: now, lastSeenAt: now });
    return null;
  },
});

export const count = query({
  args: {},
  handler: async (ctx) => (await ctx.db.query("audience").take(AUDIENCE_COUNT_CAP)).length,
});

async function findMember(ctx: QueryCtx, clientId: string) {
  return await ctx.db
    .query("audience")
    .withIndex("by_clientId", (q) => q.eq("clientId", clientId))
    .unique();
}

export async function nameOf(ctx: QueryCtx, clientId: string): Promise<string | undefined> {
  return (await findMember(ctx, clientId))?.name;
}

export const setName = mutation({
  args: { clientId: v.string(), name: v.string() },
  handler: async (ctx, args) => {
    const clientId = parseClientId(args.clientId);
    const check = checkDisplayName(args.name);
    if (!check.ok) throw new ConvexError(check.reason);
    if (!(await rateLimiter.limit(ctx, "name", { key: clientId })).ok)
      throw new ConvexError("Espera um pouco pra trocar de novo");
    const member = await findMember(ctx, clientId);
    const now = Date.now();
    if (member) await ctx.db.patch("audience", member._id, { name: check.name, lastSeenAt: now });
    else
      await ctx.db.insert("audience", {
        clientId,
        joinedAt: now,
        lastSeenAt: now,
        name: check.name,
      });
    return check.name;
  },
});

export const me = query({
  args: { clientId: v.string() },
  handler: async (ctx, args) => (await nameOf(ctx, parseClientId(args.clientId))) ?? null,
});

export const roster = query({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    if (!isPresenterKey(key)) return null;
    const online = await presence.listRoom(ctx, ROOM, true, AUDIENCE_COUNT_CAP);
    const names: string[] = [];
    for (const { userId } of online) {
      const name = await nameOf(ctx, userId);
      if (name) names.push(name);
    }
    return { count: online.length, names };
  },
});
