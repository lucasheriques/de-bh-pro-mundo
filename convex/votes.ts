import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { acceptVote } from "./pollRules";
import { assertPresenter, patchSession, readSession } from "./presenter";
import { rateLimiter } from "./rateLimits";
import { parseClientId, parsePollId } from "./validators";

const VOTES_PER_POLL_CAP = 5000;

export const cast = mutation({
  args: { pollId: v.string(), clientId: v.string(), value: v.union(v.string(), v.number()) },
  handler: async (ctx, args) => {
    const pollId = parsePollId(args.pollId);
    const clientId = parseClientId(args.clientId);
    const value = acceptVote(pollId, args.value);
    if (value === null) return null;
    if (!(await rateLimiter.limit(ctx, "vote", { key: clientId })).ok) return null;
    const existing = await ctx.db
      .query("votes")
      .withIndex("by_pollId_and_clientId", (q) => q.eq("pollId", pollId).eq("clientId", clientId))
      .unique();
    if (existing) await ctx.db.patch("votes", existing._id, { value });
    else await ctx.db.insert("votes", { pollId, clientId, value });
    return null;
  },
});

export const mine = query({
  args: { pollId: v.string(), clientId: v.string() },
  handler: async (ctx, { pollId, clientId }) => {
    const vote = await ctx.db
      .query("votes")
      .withIndex("by_pollId_and_clientId", (q) => q.eq("pollId", pollId).eq("clientId", clientId))
      .unique();
    return vote?.value ?? null;
  },
});

export const tally = query({
  args: { pollId: v.string() },
  handler: async (ctx, { pollId }) => {
    const votes = await ctx.db
      .query("votes")
      .withIndex("by_pollId_and_clientId", (q) => q.eq("pollId", pollId))
      .take(VOTES_PER_POLL_CAP);
    return votes.map((vote) => vote.value);
  },
});

export const resetPoll = mutation({
  args: { key: v.string(), pollId: v.string() },
  handler: async (ctx, { key, pollId }) => {
    assertPresenter(key);
    const votes = await ctx.db
      .query("votes")
      .withIndex("by_pollId_and_clientId", (q) => q.eq("pollId", parsePollId(pollId)))
      .take(VOTES_PER_POLL_CAP);
    await Promise.all(votes.map((vote) => ctx.db.delete("votes", vote._id)));
    const revealed = (await readSession(ctx))?.revealed ?? {};
    await patchSession(ctx, { revealed: { ...revealed, [pollId]: false } });
    return null;
  },
});
