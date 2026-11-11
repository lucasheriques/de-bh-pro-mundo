import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { storedReactionKind } from "./validators";

export default defineSchema({
  session: defineTable({
    slideIndex: v.number(),
    revealed: v.record(v.string(), v.boolean()),
    voiceEnabled: v.boolean(),
    /** When each poll's results slide was first shown; its countdown starts there. */
    pollOpenedAt: v.optional(v.record(v.string(), v.number())),
    /** Live captions on the stage and phones; off unless the presenter turns them on. */
    captionsEnabled: v.optional(v.boolean()),
  }),
  audience: defineTable({
    clientId: v.string(),
    joinedAt: v.number(),
    lastSeenAt: v.number(),
    name: v.optional(v.string()),
  }).index("by_clientId", ["clientId"]),
  votes: defineTable({
    pollId: v.string(),
    clientId: v.string(),
    value: v.union(v.string(), v.number()),
  }).index("by_pollId_and_clientId", ["pollId", "clientId"]),
  questions: defineTable({
    text: v.string(),
    clientId: v.string(),
    createdAt: v.number(),
    hidden: v.boolean(),
    voteCount: v.number(),
    authorName: v.optional(v.string()),
  })
    .index("by_hidden_and_voteCount", ["hidden", "voteCount"])
    .index("by_clientId", ["clientId"]),
  questionVotes: defineTable({
    questionId: v.id("questions"),
    clientId: v.string(),
  })
    .index("by_questionId_and_clientId", ["questionId", "clientId"])
    .index("by_clientId", ["clientId"]),
  reactions: defineTable({
    kind: storedReactionKind,
    clientId: v.string(),
    createdAt: v.number(),
  }).index("by_clientId_and_createdAt", ["clientId", "createdAt"]),
  captions: defineTable({
    text: v.string(),
    slideIndex: v.number(),
    createdAt: v.number(),
    breakBefore: v.optional(v.boolean()),
  }),
  slideEdits: defineTable({
    slideId: v.string(),
    path: v.string(),
    value: v.string(),
    updatedAt: v.number(),
  }).index("by_slideId_and_path", ["slideId", "path"]),
  captionDraft: defineTable({
    text: v.string(),
    updatedAt: v.number(),
    breakBefore: v.optional(v.boolean()),
  }),
});
