import { ConvexError } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { DEFAULT_SESSION } from "./validators";

export function isPresenterKey(key: string): boolean {
  const expected = process.env.PRESENTER_KEY;
  return expected !== undefined && expected.length > 0 && key === expected;
}

export function assertPresenter(key: string): void {
  if (!isPresenterKey(key)) throw new ConvexError("Chave de apresentador inválida");
}

export async function readSession(ctx: QueryCtx): Promise<Doc<"session"> | null> {
  return await ctx.db.query("session").first();
}

export async function patchSession(
  ctx: MutationCtx,
  patch: Partial<Pick<Doc<"session">, "slideIndex" | "revealed" | "voiceEnabled">>,
): Promise<void> {
  const current = await readSession(ctx);
  if (current) await ctx.db.patch("session", current._id, patch);
  else await ctx.db.insert("session", { ...DEFAULT_SESSION, ...patch });
}
