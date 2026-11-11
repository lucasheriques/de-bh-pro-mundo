import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertPresenter, isPresenterKey, patchSession, readSession } from "./presenter";
import { DEFAULT_SESSION, parsePollId } from "./validators";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const session = await readSession(ctx);
    if (!session) return DEFAULT_SESSION;
    const { slideIndex, revealed, voiceEnabled } = session;
    return { slideIndex, revealed, voiceEnabled };
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
