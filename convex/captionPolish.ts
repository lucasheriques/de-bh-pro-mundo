import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction, internalMutation } from "./_generated/server";

const GATEWAY_URL = "https://ai-gateway.vercel.sh/v1/chat/completions";
const DEFAULT_MODEL = "anthropic/claude-haiku-4.5";
const TIMEOUT_MS = 4000;

const SYSTEM_PROMPT = `Você corrige legendas automáticas de uma palestra em português do Brasil.
Corrija só pontuação, maiúsculas e nomes próprios. Não resuma, não reescreva, não traduza, não acrescente nada.
Nomes que aparecem na palestra: PostHog, NaGringa, G2i, Coinbase, Brex, Increment, ioasys, Rock Content, Nubank, iFood, Mercado Livre, dti digital, Google, Uber, PUC Minas, Belo Horizonte, BH, tier 1, tier 2, tier 3, product engineer, Gergely Orosz, The Pragmatic Engineer.
Responda apenas com a frase corrigida.`;

/** A rewrite that changes length a lot is the model drifting, not a correction. */
export function isPlausibleRewrite(original: string, rewrite: string): boolean {
  const ratio = rewrite.length / Math.max(1, original.length);
  return rewrite.trim().length > 0 && ratio > 0.7 && ratio < 1.4;
}

async function askGateway(apiKey: string, text: string): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(GATEWAY_URL, {
      method: "POST",
      signal: controller.signal,
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({
        model: process.env.CAPTION_MODEL ?? DEFAULT_MODEL,
        temperature: 0,
        max_tokens: 300,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: text },
        ],
      }),
    });
    if (!response.ok) return null;
    const body = (await response.json()) as { choices?: { message?: { content?: string } }[] };
    return body.choices?.[0]?.message?.content?.trim() ?? null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export const polish = internalAction({
  args: { captionId: v.id("captions"), text: v.string() },
  handler: async (ctx, { captionId, text }) => {
    const apiKey = process.env.AI_GATEWAY_API_KEY;
    if (!apiKey) return null;
    const rewrite = await askGateway(apiKey, text);
    if (!rewrite || rewrite === text || !isPlausibleRewrite(text, rewrite)) return null;
    await ctx.runMutation(internal.captionPolish.replace, { captionId, text: rewrite });
    return null;
  },
});

export const replace = internalMutation({
  args: { captionId: v.id("captions"), text: v.string() },
  handler: async (ctx, { captionId, text }) => {
    if (await ctx.db.get("captions", captionId))
      await ctx.db.patch("captions", captionId, { text });
    return null;
  },
});
