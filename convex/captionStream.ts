import { gateway } from "@ai-sdk/gateway";
import { v } from "convex/values";
import { action, query } from "./_generated/server";
import { assertPresenter, isPresenterKey } from "./presenter";

export const CAPTION_MODEL = "elevenlabs/scribe-v2-realtime";
const TOKEN_SECONDS = 300;

/** Whether live captions can stream: the Gateway key is set. Never returns the key. */
export const available = query({
  args: { key: v.string() },
  handler: async (_ctx, { key }) => isPresenterKey(key) && Boolean(process.env.AI_GATEWAY_API_KEY),
});

/**
 * A short-lived Gateway client secret for the presenter's browser to open the streaming
 * transcription socket; the Gateway key itself never leaves Convex.
 */
export const token = action({
  args: { key: v.string() },
  handler: async (_ctx, { key }): Promise<string> => {
    assertPresenter(key);
    const { token } = await gateway.experimental_transcription.getToken({
      model: CAPTION_MODEL,
      expiresAfterSeconds: TOKEN_SECONDS,
    });
    return token;
  },
});
