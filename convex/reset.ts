import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { assertPresenter, patchSession } from "./presenter";

const ROOM_TABLES = [
  "audience",
  "votes",
  "questions",
  "questionVotes",
  "reactions",
  "captions",
  "captionDraft",
] as const;
const DOCS_PER_TABLE_CAP = 4000;

export const all = mutation({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    assertPresenter(key);
    for (const table of ROOM_TABLES) {
      const docs = await ctx.db.query(table).take(DOCS_PER_TABLE_CAP);
      await Promise.all(docs.map((doc) => ctx.db.delete(table, doc._id)));
    }
    await patchSession(ctx, { slideIndex: 0, revealed: {}, voiceEnabled: false });
    return null;
  },
});
