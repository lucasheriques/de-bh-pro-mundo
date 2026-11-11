import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { nameOf } from "./audience";
import { checkQuestion, fold } from "./moderation";
import { assertPresenter } from "./presenter";
import { rateLimiter } from "./rateLimits";
import { parseClientId } from "./validators";

const LIST_LIMIT = 50;

const QUESTIONS_PER_PERSON = 8;

export const ask = mutation({
  args: { clientId: v.string(), text: v.string() },
  handler: async (ctx, args) => {
    const clientId = parseClientId(args.clientId);
    const check = checkQuestion(args.text);
    if (!check.ok) throw new ConvexError(check.reason);
    const mine = await ctx.db
      .query("questions")
      .withIndex("by_clientId", (q) => q.eq("clientId", clientId))
      .take(QUESTIONS_PER_PERSON + 1);
    if (mine.length >= QUESTIONS_PER_PERSON)
      throw new ConvexError(`Até ${QUESTIONS_PER_PERSON} perguntas por pessoa`);
    if (mine.some((question) => fold(question.text) === fold(check.text)))
      throw new ConvexError("Você já mandou essa pergunta");
    const personal = await rateLimiter.limit(ctx, "question", { key: clientId });
    if (!personal.ok) throw new ConvexError("Calma, espera um pouco pra mandar outra");
    const room = await rateLimiter.limit(ctx, "questionRoom");
    if (!room.ok) throw new ConvexError("Muitas perguntas agora, tenta de novo já já");
    return await ctx.db.insert("questions", {
      text: check.text,
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
    if (!(await rateLimiter.limit(ctx, "questionVote", { key: clientId })).ok) return null;
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
