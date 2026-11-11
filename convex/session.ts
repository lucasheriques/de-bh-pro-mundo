import { v } from "convex/values";
import { timedPollAt } from "../src/talk/pollTimer";
import { internal } from "./_generated/api";
import { internalMutation, mutation, query } from "./_generated/server";
import { assertPresenter, isPresenterKey, patchSession, readSession } from "./presenter";
import { DEFAULT_SESSION, parsePollId } from "./validators";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const session = await readSession(ctx);
    if (!session) return DEFAULT_SESSION;
    const { slideIndex, revealed, voiceEnabled } = session;
    return { slideIndex, revealed, voiceEnabled, pollOpenedAt: session.pollOpenedAt ?? {} };
  },
});

export const checkKey = query({
  args: { key: v.string() },
  handler: async (_ctx, { key }) => isPresenterKey(key),
});

export const setSlide = mutation({
  args: { key: v.string(), slideIndex: v.number() },
  handler: async (ctx, { key, slideIndex }) => {
    assertPresenter(key);
    if (!Number.isInteger(slideIndex) || slideIndex < 0 || slideIndex > 500) return null;
    await patchSession(ctx, { slideIndex });
    const timed = timedPollAt(slideIndex);
    const session = await readSession(ctx);
    if (!timed || !session) return null;
    const opened = session.pollOpenedAt ?? {};
    if (opened[timed.pollId] !== undefined || session.revealed[timed.pollId]) return null;
    const openedAt = Date.now();
    await patchSession(ctx, { pollOpenedAt: { ...opened, [timed.pollId]: openedAt } });
    await ctx.scheduler.runAfter(timed.seconds * 1000, internal.session.autoReveal, {
      pollId: timed.pollId,
      openedAt,
    });
    return null;
  },
});

/** Reveals a poll when its countdown ends, unless it was reset or reopened since. */
export const autoReveal = internalMutation({
  args: { pollId: v.string(), openedAt: v.number() },
  handler: async (ctx, { pollId, openedAt }) => {
    const session = await readSession(ctx);
    if (!session || session.pollOpenedAt?.[pollId] !== openedAt) return null;
    if (session.revealed[pollId] !== undefined) return null;
    await patchSession(ctx, { revealed: { ...session.revealed, [pollId]: true } });
    return null;
  },
});

export const toggleReveal = mutation({
  args: { key: v.string(), pollId: v.string() },
  handler: async (ctx, { key, pollId }) => {
    assertPresenter(key);
    const revealed = (await readSession(ctx))?.revealed ?? {};
    await patchSession(ctx, {
      revealed: { ...revealed, [parsePollId(pollId)]: !revealed[pollId] },
    });
    return null;
  },
});

export const setVoice = mutation({
  args: { key: v.string(), voiceEnabled: v.boolean() },
  handler: async (ctx, { key, voiceEnabled }) => {
    assertPresenter(key);
    await patchSession(ctx, { voiceEnabled });
    return null;
  },
});
