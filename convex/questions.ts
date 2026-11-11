import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { nameOf } from "./audience";
import { assertPresenter } from "./presenter";
import { parseClientId, QUESTION_MAX_LENGTH } from "./validators";

const LIST_LIMIT = 50;

export const ask = mutation({
  args: { clientId: v.string(), text: v.string() },
  handler: async (ctx, args) => {
    const clientId = parseClientId(args.clientId);
    const text = args.text.trim().replace(/\s+/g, " ");
    if (text.length === 0) throw new ConvexError("Pergunta vazia");
    if (text.length > QUESTION_MAX_LENGTH) throw new ConvexError("Pergunta longa demais");
    return await ctx.db.insert("questions", {
      text,
      clientId,
      createdAt: Date.now(),
      hidden: false,
      voteCount: 0,
      authorName: await nameOf(ctx, clientId),
    });
  },
});

export const toggleVote = mutation({
  args: { clientId: v.string(), questionId: v.id("questions") },
  handler: async (ctx, args) => {
    const clientId = parseClientId(args.clientId);
    const question = await ctx.db.get("questions", args.questionId);
    if (!question) return null;
    const existing = await ctx.db
      .query("questionVotes")
      .withIndex("by_questionId_and_clientId", (q) =>
        q.eq("questionId", question._id).eq("clientId", clientId),
      )
      .unique();
    if (existing) await ctx.db.delete("questionVotes", existing._id);
    else await ctx.db.insert("questionVotes", { questionId: question._id, clientId });
    await ctx.db.patch("questions", question._id, {
      voteCount: Math.max(0, question.voteCount + (existing ? -1 : 1)),
    });
    return null;
  },
});

export const list = query({
  args: { clientId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const viewer = args.clientId ? parseClientId(args.clientId) : null;
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_hidden_and_voteCount", (q) => q.eq("hidden", false))
      .order("desc")
      .take(LIST_LIMIT);
    return questions.map(({ _id, text, voteCount, createdAt, authorName, clientId }) => ({
      _id,
      text,
      voteCount,
      createdAt,
      authorName: authorName ?? null,
      mine: viewer !== null && clientId === viewer,
    }));
  },
});

export const myVotes = query({
  args: { clientId: v.string() },
  handler: async (ctx, { clientId }) => {
    const votes = await ctx.db
      .query("questionVotes")
      .withIndex("by_clientId", (q) => q.eq("clientId", clientId))
      .take(500);
    return votes.map((vote) => vote.questionId);
  },
});

export const hide = mutation({
  args: { key: v.string(), questionId: v.id("questions") },
  handler: async (ctx, { key, questionId }) => {
    assertPresenter(key);
    if (await ctx.db.get("questions", questionId)) {
      await ctx.db.patch("questions", questionId, { hidden: true });
    }
    return null;
  },
});

export const remove = mutation({
  args: { clientId: v.string(), questionId: v.id("questions") },
  handler: async (ctx, args) => {
    const clientId = parseClientId(args.clientId);
    const question = await ctx.db.get("questions", args.questionId);
    if (!question || question.clientId !== clientId) return null;
    const votes = await ctx.db
      .query("questionVotes")
      .withIndex("by_questionId_and_clientId", (q) => q.eq("questionId", question._id))
      .take(1000);
    await Promise.all(votes.map((vote) => ctx.db.delete("questionVotes", vote._id)));
    await ctx.db.delete("questions", question._id);
    return null;
  },
});
